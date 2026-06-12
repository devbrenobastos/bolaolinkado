# Palpiteiro Nato — Documentação Técnica Completa
**Versão de referência: 12/06/2026 | Branch: `main` | Repo: `devbrenobastos/bolaolinkado`**

---

## 1. Visão Geral do Projeto

PWA de bolão da Copa do Mundo FIFA 2026. Os usuários dão palpites em placares de jogos, competem em grupos privados (bolões) e acompanham o ranking em tempo real. Sem servidor próprio — 100% Supabase + Vercel (ou Netlify).

**URL de produção:** `https://palpiteironato.online`

---

## 2. Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Build tool |
| Tailwind CSS | 3.4 | Estilização |
| Framer Motion | 12 | Animações e transições |
| Day.js | 1.11 | Formatação de datas (locale pt-BR) |
| Lucide React | 1.17 | Ícones |
| @supabase/supabase-js | 2 | Client do banco/auth |

### Backend
| Tecnologia | Uso |
|---|---|
| Supabase (PostgreSQL) | Banco de dados principal |
| Supabase Auth | Autenticação email/senha |
| Supabase Edge Functions | Lógica serverless (Deno) |
| Supabase Realtime | WebSocket para atualizações ao vivo |
| pg_cron | Jobs agendados no banco |
| pg_net | HTTP requests a partir do banco (chama edge functions) |

### Serviços externos
| API | Uso | Limite free |
|---|---|---|
| football-data.org | Agenda + resultados finais dos jogos | 10 req/min |
| worldcup26.ir | Placares ao vivo (mais frescos) | Sem limite conhecido |

---

## 3. Estrutura de Arquivos (Frontend)

```
bolao-linka/
├── public/
│   ├── sw.js                  # Service Worker v3
│   ├── manifest.webmanifest   # PWA manifest
│   ├── offline.html           # Página offline
│   └── icons/                 # Ícones PWA (192, 512, maskable, apple-touch)
├── src/
│   ├── App.jsx                # Componente raiz (~3800 linhas) — toda a UI
│   ├── main.jsx               # Entry point React
│   ├── utils/
│   │   └── supabase.js        # Client Supabase inicializado
│   └── components/
│       ├── LiveScoreWidget.jsx # Widget de placar ao vivo
│       └── TourOverlay.jsx    # Tour de onboarding interativo
├── .claude/
│   └── launch.json            # Config do preview server (porta 5174)
└── package.json
```

**Observação importante:** Toda a lógica de UI, estado, roteamento e chamadas ao banco está concentrada em `App.jsx`. É uma SPA de arquivo único. Qualquer dev novo deve começar por esse arquivo.

---

## 4. Arquitetura da SPA

A navegação é feita via estado React (`activeTab`), persistido no `localStorage`. Não há React Router nem hash routing.

### Abas
| `activeTab` | Tela |
|---|---|
| `inicio` | Painel de palpites (aba principal) |
| `boloes` | Gerenciar bolões |
| `ranking` | Classificação do bolão selecionado |
| `convites` | Aprovar membros pendentes |
| `perfil` | Configurações, notificações push, instalar PWA |
| `historico` | Histórico de palpites do usuário |

### Estados globais principais (em `App.jsx`)
```
session         → sessão Supabase Auth
profile         → perfil do usuário logado
matches         → todos os jogos da Copa 2026
pools           → bolões que o usuário participa
selectedPool    → bolão ativo no momento
poolMembers     → membros do selectedPool
poolGuesses     → palpites de todos no selectedPool
userPredictions → palpites do usuário logado (keyed by match.id)
tiebreakerPicks → escolha de quem classifica em empate de mata-mata
savedMatchIds   → Set de match IDs recém-salvos (auto-save indicator)
isTourOpen      → controla o onboarding tour
```

---

## 5. Banco de Dados — Schema Completo

### Tipos customizados (PostgreSQL ENUM)
```sql
CREATE TYPE match_phase AS ENUM (
  'groups', 'round_of_32', 'round_of_16',
  'quarter_finals', 'semi_finals', 'final'
);

CREATE TYPE user_role AS ENUM ('user', 'premium', 'admin');
```

---

### Tabela: `profiles`
Extensão da tabela `auth.users` do Supabase. Criada automaticamente via trigger `handle_new_user` quando um usuário se registra.

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | uuid | PK (= auth.users.id) | ID do usuário |
| `full_name` | text | null | Nome de exibição |
| `avatar_url` | text | null | Base64 do avatar ou URL |
| `role` | user_role | `'user'` | Papel: user / premium / admin |
| `updated_at` | timestamptz | now() | Última atualização |
| `has_seen_tour` | boolean | `true` | Controla onboarding tour |

**Regra de negócio:** `has_seen_tour` é `true` por padrão (usuários existentes não veem o tour). Ao criar um novo perfil via signup, o código insere explicitamente `has_seen_tour: false`, garantindo que apenas novos usuários vejam o tour.

---

### Tabela: `matches`
Central do sistema. Populada e atualizada pela edge function `sync-matches`.

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | bigint | PK (= ID do football-data.org) | ID único do jogo |
| `home_team` | text | — | Nome do time da casa (inglês) |
| `away_team` | text | — | Nome do time visitante (inglês) |
| `home_score` | integer | null | Gols do time da casa |
| `away_score` | integer | null | Gols do time visitante |
| `phase` | match_phase | `'groups'` | Fase do torneio |
| `kickoff_time` | timestamptz | — | Data/hora do jogo (UTC) |
| `is_finished` | boolean | `false` | Jogo encerrado? |
| `updated_at` | timestamptz | now() | Última atualização |
| `home_team_crest` | text | null | URL do escudo do time da casa |
| `away_team_crest` | text | null | URL do escudo do time visitante |
| `advance_team` | text | null | Time que avançou (mata-mata) |
| `pre_match_notif_sent` | boolean | `false` | Notificação pré-jogo enviada? |
| `post_match_notif_sent` | boolean | `false` | Notificação pós-jogo enviada? |

---

### Tabela: `pools`
Cada bolão criado por um usuário.

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | ID do bolão |
| `name` | text | — | Nome do bolão |
| `owner_id` | uuid | — | FK → profiles.id |
| `entry_fee` | numeric | `0` | Taxa de entrada (R$) |
| `invite_code` | text | md5 aleatório (8 chars) | Código de convite |
| `created_at` | timestamptz | now() | Data de criação |
| `mode` | text | `'total'` | `'total'`, `'round'`, `'day'` ou `'match'` |
| `is_private` | boolean | `true` | Privado (convite) ou público |
| `auto_approve` | boolean | `false` | Aprovação automática de membros |
| `match_id` | bigint | null | FK → matches.id (partida específica se mode = 'match') |

**Regras de negócio:**
- Admin users: criação de bolão livre ou privado, com ou sem taxa de entrada. Usa o formulário completo no UI.
- Não-admin sem taxa: modal intercepta submit e pergunta "Deixar público?" antes de criar. Restrição imposta no banco pela trigger `check_pool_creation_limits` (impede bolão grátis privado).
- Pools com `is_private = false` aparecem na listagem de bolões públicos.
- Pools com `is_private = true` só são acessíveis via `invite_code`.
- **Modalidades de Bolão**:
  * `'total'`: Classificação acumula pontos de todos os jogos do início ao fim.
  * `'round'`: Classificação filtra e computa apenas jogos da rodada selecionada.
  * `'day'`: Classificação computa apenas jogos do dia atual e zera/finaliza ao final do dia.
  * `'match'`: Foca em uma partida única (`match_id`). O ranking encerra ao fim do jogo coroando o vencedor.

---

### Tabela: `pool_members`
Relação N:N entre usuários e bolões. Chave composta implícita (`pool_id`, `user_id`).

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `pool_id` | uuid | — | FK → pools.id |
| `user_id` | uuid | — | FK → profiles.id |
| `joined_at` | timestamptz | now() | Data de entrada |
| `is_approved` | boolean | `false` | Aprovado pelo moderador? |
| `role` | text | `'member'` | `'member'` ou `'admin'` |

---

### Tabela: `guesses`
Palpites dos usuários. Um registro por (user, match, pool).

| Coluna | Tipo | Padrão | Descrição |
|---|---|---|---|
| `id` | uuid | gen_random_uuid() | — |
| `user_id` | uuid | — | FK → profiles.id |
| `match_id` | bigint | — | FK → matches.id |
| `pool_id` | uuid | — | FK → pools.id |
| `home_guess` | integer | — | Palpite gols casa |
| `away_guess` | integer | — | Palpite gols visitante |
| `points_earned` | integer | `0` | Pontos ganhos (calculado por trigger) |
| `created_at` | timestamptz | now() | — |
| `tiebreaker_pick` | text | null | `'home'` ou `'away'` (mata-mata empatado) |

**Regra de negócio crítica:** Palpites são **universais** — um único palpite (home_guess, away_guess) é upsertado para TODOS os bolões do usuário simultaneamente. Não é possível ter palpites diferentes para o mesmo jogo em bolões distintos.

---

### Tabela: `push_subscriptions`
Assinaturas Web Push dos usuários.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → profiles.id |
| `endpoint` | text | URL do push service (APNs/FCM) |
| `p256dh` | text | Chave pública do dispositivo (base64url) |
| `auth` | text | Auth secret do dispositivo (base64url) |
| `created_at` | timestamptz | — |

**Stack de push:** VAPID (ES256) + JWK + **aes128gcm** (RFC 8291 + RFC 8188). Compatível com iOS/Safari. Assinaturas expiradas (HTTP 404/410) são removidas automaticamente.

---

### Tabela: `system_status`
Tabela singleton (1 linha). Controla flags globais do sistema.

---

### Tabela: `api_rate_limit`
Controle de quota da API football-data.org. RLS habilitado: apenas `service_role` tem acesso.

| Coluna | Tipo | Descrição |
|---|---|---|
| `api` | text | Nome da API (ex: `'football-data'`) |
| `called_at` | timestamptz | Timestamp da chamada |

---

### Tabela: `failed_join_attempts` *(referenciada em RLS)*
Controle de tentativas de força bruta para entrar em bolões por código.

---

## 6. Row Level Security (RLS) — Políticas por Tabela

### `profiles`
| Operação | Quem pode | Condição |
|---|---|---|
| SELECT | Authenticated | Todos podem ver todos os perfis |
| INSERT | Authenticated | Apenas o próprio perfil (`id = auth.uid()`) |
| UPDATE | Authenticated | Próprio perfil; ou admin pode alterar qualquer um; ou premium pode alterar usuários não-admin |

### `matches`
| Operação | Quem pode | Condição |
|---|---|---|
| SELECT | Authenticated | Leitura total liberada |
| INSERT/UPDATE/DELETE | — | Bloqueado para clientes (apenas service_role via edge functions) |

### `pools`
| Operação | Quem pode | Condição |
|---|---|---|
| SELECT | Authenticated | Leitura total liberada |
| INSERT | Authenticated | Qualquer autenticado pode criar |
| UPDATE | Authenticated | Apenas o `owner_id` do bolão |

### `pool_members`
| Operação | Quem pode | Condição |
|---|---|---|
| SELECT | Authenticated | Leitura total liberada |
| INSERT | Authenticated | Qualquer autenticado (entrada via convite) |
| UPDATE | Authenticated | Dono do pool; ou admin; ou premium que é membro aprovado |
| DELETE | Authenticated/Public | Próprio usuário; ou dono; ou admin; ou premium membro |

### `guesses`
| Operação | Quem pode | Condição |
|---|---|---|
| SELECT | Authenticated | Próprios palpites **sempre**; palpites alheios somente após o jogo ser bloqueado (`kickoff - 15min < now()`) |
| INSERT | Authenticated | Permite inserção (validação de lockout via trigger) |
| UPDATE | Authenticated | Apenas o próprio usuário (`user_id = auth.uid()`) |

> **Importante:** A política de SELECT em `guesses` garante que nenhum usuário veja o palpite do adversário enquanto o jogo está aberto. Isso evita copiar estratégias.

### `push_subscriptions`
| Operação | Quem pode | Condição |
|---|---|---|
| ALL | Public/Authenticated | Apenas a própria assinatura (`user_id = auth.uid()`) |

### `api_rate_limit`
| Operação | Quem pode | Condição |
|---|---|---|
| ALL | `service_role` | Apenas edge functions têm acesso |

---

## 7. Funções e Triggers do Banco

### Triggers

**`calculate_guess_points`** (trigger em `guesses` AFTER UPDATE/INSERT)
Calcula automaticamente `points_earned` sempre que um palpite é inserido ou atualizado. Regra de pontuação com multiplicadores por fase:

| Fase | Multiplicador base |
|---|---|
| Fase de grupos | 1× |
| 16-avos | 2× |
| Oitavas | 3× |
| Quartas | 4× |
| Semifinal | 6× |
| Final / 3º lugar | 10× |

Palpite exato (placar correto) vale mais pontos que acertar apenas o vencedor.

---

**`enforce_guess_lockout`** (trigger em `guesses` BEFORE INSERT/UPDATE)
Impede a criação ou alteração de palpites quando `kickoff_time - 15min < now()`. É a segunda linha de defesa (a primeira é no client-side via `isMatchLocked()`).

---

**`check_retroactive_guess`** (trigger em `guesses`)
Bloqueia inserção de palpites para jogos já encerrados (`is_finished = true`).

---

**`check_pool_creation_limits`** (trigger em `pools` BEFORE INSERT)
Valida limites de criação de bolões por usuário (evita spam).

---

**`handle_new_user`** (trigger em `auth.users` AFTER INSERT)
Cria automaticamente o registro em `public.profiles` quando um novo usuário se autentica pela primeira vez. Fallback ao fluxo manual no App.jsx.

---

**`copy_member_guesses`** (trigger em `pool_members` AFTER INSERT/UPDATE)
Copia automaticamente os palpites existentes do usuário para todos os jogos abertos futuros ao ser aprovado ou inserido em um bolão. Executado com `SECURITY DEFINER` para evitar restrições de RLS.

---

### Funções RPC (chamáveis pelo client)

**`join_pool_by_invite_code(invite_code_input TEXT) → JSON`**
Entrada segura em bolões. Retorna JSON com resultado da operação.

Lógica interna:
1. Busca o bolão pelo `invite_code`
2. Verifica se o usuário já é membro
3. Se `auto_approve = true`: insere com `is_approved = true`
4. Se `auto_approve = false`: insere com `is_approved = false` (aguarda moderador)
5. Retorna: `{ success, pool_id, pool_name, is_approved, message }`

Proteções: registra tentativas em `failed_join_attempts` para prevenir força bruta.

---

**`clean_api_rate_limit()` → void**
Remove registros com mais de 60s da tabela `api_rate_limit`. Chamada pelo cron a cada 5 minutos.

---

**`keep_database_alive()` → void**
Query simples para manter o projeto Supabase ativo no free tier (que pausa após 7 dias sem atividade).

---

## 8. Edge Functions (Deno / Supabase)

### Stack criptográfico compartilhado (push notifications)
Todas as funções que enviam push usam:
- **VAPID:** ES256 via Web Crypto API, chave importada no formato **JWK** (não PKCS8 — o Deno rejeita DER manual)
- **Criptografia de payload:** **aes128gcm** (RFC 8291 + RFC 8188) — obrigatório para iOS/Safari
- **Derivação de chave:** HKDF-SHA256 com info strings hardcoded como byte arrays para evitar ambiguidade de escape

> ⚠️ **NÃO use `npm:web-push`** — não funciona em Deno/Supabase Edge Functions. Toda a implementação é nativa via `crypto.subtle`.

---

### `sync-matches` (v20) — Sincronização de Jogos

**Trigger:** pg_cron (`* * * * *` = todo minuto) + chamada diária de backup (`0 0 * * *`)

**Fluxo:**
1. Verifica rate limit: se ≥ 8 chamadas nos últimos 60s à football-data.org → retorna 429
2. Registra chamada na `api_rate_limit`
3. Faz GET em `https://api.football-data.org/v4/competitions/WC/matches?season=2026`
4. Em paralelo, faz GET em `https://worldcup26.ir/get/games`
5. Para cada jogo: **lógica de prioridade de fonte:**
   - `IN_PLAY` / `PAUSED` → **worldcup26.ir é primário** (dados mais frescos; football-data.org free tier tem ~5min de lag)
   - `FINISHED` / agendados → **football-data.org é primário**; worldcup26.ir preenche apenas campos `null`
   - Se worldcup26.ir reportar `finished: TRUE` → marca `is_finished = true` sem esperar football-data.org
6. Faz upsert em `matches` (conflict em `id`)
7. **Se há jogos ao vivo:** aguarda 30s e faz segunda poll ao worldcup26.ir, atualizando apenas os jogos `IN_PLAY`/`PAUSED`
8. **Circuit Breaker:** Se o fetch da API principal (`football-data.org`) falhar ou retornar erro, a função chaveia para o banco local de forma transparente, carregando os jogos pendentes e sincronizando placares apenas usando a API secundária `worldcup26.ir`.

**Resultado:** atualização de scores ao vivo a cada ~30s (antes era ~4-5min) e resiliência a quedas da API principal.

**Variáveis de ambiente necessárias:**
- `API_FOOTBALL_KEY` — chave da football-data.org
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — padrão Supabase

---

### `send-push-notification` (v9) — Envio Manual de Push

**Trigger:** HTTP POST (chamada manual — admin/teste)  
**Auth:** JWT ativa (`verify_jwt: true` no gateway) + validação interna rígida da role `'admin'` no banco.

**Body esperado:**
```json
{
  "title": "Título da notificação",
  "body": "Corpo do texto",
  "url": "/?tab=ranking",
  "tag": "identificador-unico"
}
```

**Fluxo:**
1. Valida o cabeçalho de autenticação JWT do Supabase Auth.
2. Consulta o perfil (`profiles`) para certificar que o usuário logado possui a role `'admin'`. Se inválido, aborta com HTTP 403.
3. Busca todas as `push_subscriptions` ativas
4. Para cada assinatura, executa `sendWebPush()`:
   - Gera par de chaves ECDH efêmeras (P-256)
   - Deriva shared secret via ECDH com a chave pública do device
   - Deriva CEK e Nonce via HKDF (info strings como byte arrays)
   - Monta header RFC 8188: `salt(16) | rs(4 BE=4096) | idlen(1=65) | serverPub(65)`
   - Cifra payload com AES-GCM + delimitador `0x02`
   - POST para o endpoint com header `Content-Encoding: aes128gcm`
5. Assinaturas que retornam 404/410 são **deletadas automaticamente** da tabela

**VAPID Keys (hardcoded na função):**
```
Public:  BGvXIDwn2IgG9P9AoMGf_PqhSO-afyCuW3rQ9JK4bnXkRI7IDQ_h7rOHYpjVAl7vgpnjGcFJpByqc97VooAr42g
Private: 2akxnzgMsIBQfLGA9JjF8PG6qhq-9DYH1cMqOnp1T9Y
Subject: mailto:admin@bolaolink.com
```

---

### `match-notification-scheduler` (v5) — Notificações Automáticas

**Trigger:** pg_cron (`*/2 * * * *` = a cada 2 minutos)  
**Auth:** header `x-cron-secret: bolao-notif-cron-2026` (obrigatório — retorna 401 sem ele)

**Fluxo:**
1. Em paralelo, busca:
   - Jogos com `pre_match_notif_sent = false` e kickoff entre 28-32 min no futuro
   - Jogos com `post_match_notif_sent = false` e `is_finished = true` nos últimos 5 min
   - Todas as `push_subscriptions`
2. Se não há jogos nem assinantes → retorna cedo
3. Para cada jogo pré-match encontrado:
   - Traduz nomes dos times para português (mapa interno)
   - Broadcast da notificação para todos os assinantes
   - Marca `pre_match_notif_sent = true`
4. Para cada jogo pós-match:
   - Idem com mensagem de resultado
   - Marca `post_match_notif_sent = true`
5. Remove assinaturas expiradas (404/410)

**Mensagens enviadas:**

| Evento | Título | Corpo |
|---|---|---|
| 30 min antes | `⚽ Hora do palpite!` | `{Time A} x {Time B} começa em 30 minutos — corre antes que feche! 🔒` |
| Jogo encerrado | `🏁 Apito final!` | `{Time A} 2 x 1 {Time B} • Veja sua pontuação no ranking! 📈` |

---

## 9. Jobs Agendados (pg_cron)

| Job | Frequência | O que faz |
|---|---|---|
| `sync-results-live` | `* * * * *` (todo minuto) | Chama edge function `sync-matches` |
| `sync-matches-daily` | `0 0 * * *` (meia-noite) | Backup diário da `sync-matches` |
| `match-notification-scheduler` | `*/2 * * * *` (a cada 2min) | Chama edge function de notificações |
| `clean-api-rate-limit` | `*/5 * * * *` (a cada 5min) | Limpa `api_rate_limit` (registros > 60s) |
| `anti-pause-keep-alive` | `0 0 */3 * *` (a cada 3 dias) | Mantém o projeto ativo no free tier |

---

## 10. Sistema PWA

**Service Worker** (`public/sw.js`, v3):

| Estratégia | Recursos |
|---|---|
| Cache-First | JS, CSS, imagens, ícones, fontes locais |
| Network-First | Navegação HTML |
| Stale-While-Revalidate | Demais requisições |

**Ignorados pelo SW:** chamadas Supabase, Google Fonts, APIs externas.

**Push notifications no SW:**
- Evento `push`: parseia JSON do payload, chama `showNotification()`
- Evento `notificationclick`: foca janela existente ou abre nova em `data.url`
- Evento `message`: suporta `SKIP_WAITING` para forçar atualização

**Manifest (`manifest.webmanifest`):**
- Nome: "Palpiteiro Nato"
- Cor tema: `#FF7A00` (laranja)
- Background: `#0D0D0D` (preto)
- Atalhos: "Meus Palpites" (`/?tab=inicio`) e "Ranking" (`/?tab=ranking`)

---

## 11. Funcionalidades Detalhadas

### Sistema de Palpites
- Palpite = placar previsto (inteiro 0-99 para cada lado)
- Fechamento: **15 minutos antes do kickoff** (client-side + trigger no banco)
- Palpites são **universais**: ao salvar, faz bulk upsert para todos os bolões do usuário
- Visualização: carrossel horizontal (padrão) ou lista expandida

### Sistema de Pontuação
- Trigger `calculate_guess_points` calcula automaticamente ao inserir/atualizar guess
- Acertar placar exato > acertar vencedor/empate
- Multiplicadores por fase (ver tabela acima)
- Tiebreaker em mata-mata: se o palpite for empate, escolher qual time avança (+5 pts bônus)

### Link de Convite Mágico
URL: `https://palpiteironato.online/?invite=CODIGO`

Fluxo:
1. App captura `?invite=` da URL em `useEffect` → salva no `localStorage`, limpa a URL
2. Se usuário já logado → entra no bolão automaticamente via `joinPoolByCodeSilently()`
3. Se deslogado → código persiste no `localStorage` durante login/cadastro → entra após autenticação
4. Respeita `auto_approve`: se privado com aprovação manual, cria solicitação pendente

### Onboarding Tour (5 passos)
Controle: coluna `has_seen_tour` em `profiles`.
- `true` (default para existentes) → não exibe tour
- `false` (novos cadastros) → exibe tour na primeira sessão

Passos com spotlight spotlight no elemento real:
1. Boas-vindas (centralizado, sem alvo)
2. Card de palpite (`#tour-match-card`)
3. Aba Bolões (`#tour-boloes-btn`)
4. Seção Ranking (`#tour-ranking-section`)
5. Barra de navegação (`#tour-bottom-nav`)

Tour navega automaticamente entre abas conforme o usuário avança. Fechar/pular grava `has_seen_tour = true` no banco.

### UX Micro-interações
- **Haptic feedback:** `navigator.vibrate(12)` a cada clique em `+`/`-` de palpite
- **Auto-save silencioso:** checkmark verde `✓ Palpite salvo` no card por 2s após persistir
- **Tendência do bolão:** barra colorida mostrando distribuição de palpites do grupo (calculado client-side de `poolGuesses`). Laranja = time da casa, cinza = empate, azul = visitante. Aparece quando há ≥ 2 palpites para o jogo

---

## 12. Regras de Negócio — Resumo

| Regra | Onde é aplicada |
|---|---|
| Palpite rota fecha 15min antes do kickoff | Client (`isMatchLocked`) + trigger `enforce_guess_lockout` |
| Palpites universais entre bolões | Client (`handleUserPredictionChange` bulk upsert em rede) |
| Palpite alheio visível só após bloqueio | RLS policy em `guesses` (SELECT) |
| Admin cria bolão com qualquer privacidade/taxa | Client (`handleCreatePool`) |
| Não-admin sem taxa: confirmação "Deixar público?" | Client (`showPublicConfirm` state) |
| Bolão público = `is_private = false` | Campo `pools.is_private` |
| Aprovação de membros: manual ou automática | `pools.auto_approve` + `pool_members.is_approved` |
| Hierarquia de roles: user < premium < admin | RLS policies em `profiles` e `pool_members` |
| Push para subscriptions expiradas auto-removidas | `send-push-notification` e `match-notification-scheduler` |
| Projeto Supabase não pausa | Job `anti-pause-keep-alive` a cada 3 dias |

---

## 13. Variáveis de Ambiente Necessárias

### Edge Functions (configuradas no Supabase Secrets)
| Secret | Valor | Usado em |
|---|---|---|
| `API_FOOTBALL_KEY` | Chave da football-data.org | `sync-matches` |
| `SUPABASE_URL` | Auto-injetado | Todas |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injetado | Todas |

### Frontend (Vite `.env`)
| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anon do Supabase |

---

## 14. Dados Atuais (12/06/2026)

| Métrica | Valor |
|---|---|
| Usuários cadastrados | 13 |
| Palpites registrados | 293 |
| Jogos encerrados | 61 |
| Jogos restantes | 107 |
| Bolões ativos | 4 |
| Total de membros (todos os bolões) | 12 |
| Assinantes de push | 3 |

---

## 15. Alertas de Segurança Pendentes

| Item | Risco | Recomendação | Status Atual |
|---|---|---|---|
| api_rate_limit sem RLS | Baixo | Habilitar RLS e aplicar política restrict | **Resolvido** (RLS habilitado + restrict a `service_role` ativo) |
| VAPID private key hardcoded | Médio | Mover para Supabase Secret (`VAPID_PRIVATE_KEY`) | **Resolvido** (Lido dos Secrets do Supabase com fallback seguro) |
| `send-push-notification` sem auth | Médio | Adicionar JWT verification + restrição de role admin | **Resolvido** (Ativo na v10 de push: JWT/CronSecret + role check) |

---

## 16. Pontos de Atenção para Devs

1. **`App.jsx` tem ~3800 linhas** — qualquer refactor deve extrair componentes sem quebrar o estado compartilhado. Prioridade: `MatchCard`, `RankingTable`, `PoolCreationModal`.

2. **Palpites universais** é uma decisão de produto deliberada — não tentar "consertar" para palpites por bolão sem validar com o dono do produto.

3. **`sync-matches` usa dois duplos de polling** durante jogos ao vivo (30s dentro da execução). O timeout da edge function é de ~150s. Monitorar se isso causa timeouts em fases com muitos jogos simultâneos.

4. **football-data.org free tier** — manter abaixo de 8 req/min (há proteção no código). Upgrade de plano necessário se a Copa exigir mais frequência de sync.

5. **iOS Web Push** exige `aes128gcm` obrigatoriamente. **Não usar `aesgcm` (legado)** nem `npm:web-push` (não funciona em Deno). A implementação atual com `crypto.subtle` é a solução correta.

6. **O scoring (pontos)** é calculado por trigger no banco — nunca calcular no client. Se precisar depurar pontuações erradas, investigar o trigger `calculate_guess_points`.

7. **Monetização e Gateways de Pagamento (Futuro)**:
   - **Status Atual**: A criação dos bolões nas novas modalidades `'day'` (Por Dia) e `'match'` (Jogo Único) está temporariamente liberada de forma gratuita para todos os usuários para fins de teste/experimento, visto que ainda não há um gateway de pagamento vinculado ao sistema.
   - **Sugestão de Fluxo**: No futuro, pode-se limitar a criação de bolões dessas modalidades apenas a usuários com a role `'premium'` ou `'admin'`.
   - **Integração do Gateway**: Recomenda-se integrar um gateway de pagamento (ex: Stripe, Asaas ou Mercado Pago para PIX) via Supabase Edge Functions. O fluxo seria:
     1. O usuário solicita o upgrade para `'premium'` no app.
     2. Uma Edge Function gera a cobrança/PIX e retorna o QR Code/link.
     3. O gateway envia um webhook de confirmação de pagamento para outra Edge Function do Supabase.
     4. A Edge Function atualiza a coluna `role` do usuário em `profiles` para `'premium'`.
   - **Restrições**: A validação final deve ser feita no banco de dados por meio da trigger `check_pool_creation_limits`, impedindo a inserção de bolões premium por usuários comuns, acompanhado de um aviso/bloqueio visual na interface (UI).

