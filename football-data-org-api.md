# football-data.org API — Referência Completa (v4)

> **Versão:** v4 (lançada em 20/05/2022). A v2 ainda está disponível mas a migração para v4 é recomendada.
> **Base URL:** `http://api.football-data.org`
> **Autenticação:** Header `X-Auth-Token: {SUA_API_KEY}` em todas as requisições.

---

## Conceitos Fundamentais

### Autenticação

Toda requisição autenticada deve incluir o header:

```
X-Auth-Token: {SUA_API_KEY}
```

Sem o token, as requisições ainda funcionam mas com acesso limitado (TIER_ONE).

### Tiers de Acesso

| Tier | Descrição |
|------|-----------|
| `TIER_ONE` | Acesso gratuito básico |
| `TIER_TWO` | Plano pago intermediário |
| `TIER_THREE` | Plano pago avançado |
| `TIER_FOUR` | Acesso máximo |

O campo `permission` nas respostas indica o tier necessário para aquele dado.

### Headers Especiais

| Header | Descrição |
|--------|-----------|
| `X-Unfold-Goals: true` | Expande detalhes de gols nos objetos de partida |
| `X-Unfold-Bookings: true` | Expande cartões (amarelo/vermelho) |
| `X-Unfold-Substitutions: true` | Expande substituições |
| `X-Unfold-Lineups: true` | Expande escalações titulares e banco |

### Formatos de Data e Status

**Formato de datas nos filtros:** `YYYY-MM-DD` (ex: `2022-05-17`)

**Status possíveis de partida:**

| Status | Descrição |
|--------|-----------|
| `SCHEDULED` | Agendada, data/hora definida |
| `TIMED` | Agendada sem hora definida |
| `IN_PLAY` | Em andamento |
| `PAUSED` | Intervalo |
| `FINISHED` | Encerrada |
| `SUSPENDED` | Suspensa |
| `POSTPONED` | Adiada |
| `CANCELLED` | Cancelada |
| `AWARDED` | Resultado por decisão administrativa |

**Duração de partidas (`score.duration`):**

| Valor | Descrição |
|-------|-----------|
| `REGULAR` | Tempo regular |
| `EXTRA_TIME` | Prorrogação |
| `PENALTY_SHOOTOUT` | Pênaltis |

**Vencedor (`score.winner`):**

| Valor | Descrição |
|-------|-----------|
| `HOME_TEAM` | Time da casa venceu |
| `AWAY_TEAM` | Time visitante venceu |
| `DRAW` | Empate |
| `null` | Partida não encerrada |

---

## Mapa de Endpoints

| Recurso | Ação | Endpoint | Filtros disponíveis |
|---------|------|----------|---------------------|
| **Area** | Uma área específica | `GET /v4/areas/{id}` | — |
| **Areas** | Todas as áreas | `GET /v4/areas/` | — |
| **Competition** | Uma competição específica | `GET /v4/competitions/{id}` | — |
| **Competitions** | Todas as competições | `GET /v4/competitions/` | `areas` |
| **Competition / Standings** | Tabela de classificação | `GET /v4/competitions/{id}/standings` | `matchday`, `season`, `date` |
| **Competition / Matches** | Partidas de uma competição | `GET /v4/competitions/{id}/matches` | `dateFrom`, `dateTo`, `stage`, `status`, `matchday`, `group`, `season` |
| **Competition / Teams** | Times de uma competição | `GET /v4/competitions/{id}/teams` | `season` |
| **Competition / Scorers** | Artilheiros de uma competição | `GET /v4/competitions/{id}/scorers` | `limit`, `season` |
| **Team** | Um time específico | `GET /v4/teams/{id}` | — |
| **Teams** | Listar times | `GET /v4/teams/` | `limit`, `offset` |
| **Team / Matches** | Partidas de um time | `GET /v4/teams/{id}/matches/` | `dateFrom`, `dateTo`, `season`, `competitions`, `status`, `venue`, `limit` |
| **Person** | Uma pessoa específica | `GET /v4/persons/{id}` | — |
| **Person / Matches** | Partidas de uma pessoa | `GET /v4/persons/{id}/matches` | `dateFrom`, `dateTo`, `status`, `competitions`, `limit`, `offset` |
| **Match** | Uma partida específica | `GET /v4/matches/{id}` | — |
| **Matches** | Partidas entre competições | `GET /v4/matches` | `competitions`, `ids`, `dateFrom`, `dateTo`, `status` |
| **Match / Head2Head** | Histórico entre dois times | `GET /v4/matches/{id}/head2head` | `limit`, `dateFrom`, `dateTo`, `competitions` |

---

## Referência Detalhada por Endpoint

---

### `GET /v4/areas/{id}` — Área específica

**Descrição:** Retorna dados de uma área geográfica (país ou continente).

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/areas/2267
```

**Exemplo de resposta:**
```json
{
  "id": 2267,
  "name": "World",
  "code": "INT",
  "flag": null,
  "parentAreaId": null,
  "parentArea": null,
  "childAreas": [
    {
      "id": 2001,
      "name": "Africa",
      "countryCode": "AFR",
      "flag": null,
      "parentAreaId": 2267,
      "parentArea": "World"
    }
  ]
}
```

**Campos do objeto `Area`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | Identificador único da área |
| `name` | string | Nome da área |
| `code` | string | Código ISO (3 letras) |
| `flag` | string \| null | URL do SVG da bandeira |
| `parentAreaId` | integer \| null | ID da área pai |
| `parentArea` | string \| null | Nome da área pai |
| `childAreas` | array | Subáreas (apenas na rota `/areas/{id}`) |

---

### `GET /v4/areas/` — Todas as áreas

**Descrição:** Lista todas as 272 áreas disponíveis.

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/areas/
```

**Exemplo de resposta (abreviada):**
```json
{
  "count": 272,
  "filters": {},
  "areas": [
    {
      "id": 2000,
      "name": "Afghanistan",
      "countryCode": "AFG",
      "flag": null,
      "parentAreaId": 2014,
      "parentArea": "Asia"
    }
  ]
}
```

---

### `GET /v4/competitions/{id}` — Competição específica

**Descrição:** Retorna dados completos de uma competição, incluindo temporada atual e histórico de temporadas.

**Identificador:** pode ser o `id` numérico ou o `code` (ex: `PL`, `WC`, `BL1`).

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/competitions/PL
```

**Exemplo de resposta (abreviada):**
```json
{
  "area": {
    "id": 2072,
    "name": "England",
    "code": "ENG",
    "flag": "https://crests.football-data.org/770.svg"
  },
  "id": 2021,
  "name": "Premier League",
  "code": "PL",
  "type": "LEAGUE",
  "emblem": "https://crests.football-data.org/PL.png",
  "currentSeason": {
    "id": 733,
    "startDate": "2021-08-13",
    "endDate": "2022-05-22",
    "currentMatchday": 37,
    "winner": null,
    "stages": ["REGULAR_SEASON"]
  },
  "seasons": [
    {
      "id": 733,
      "startDate": "2021-08-13",
      "endDate": "2022-05-22",
      "currentMatchday": 37,
      "winner": null,
      "stages": ["REGULAR_SEASON"]
    }
  ],
  "lastUpdated": "2022-03-20T08:58:54Z"
}
```

**Campos do objeto `Competition`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | Identificador numérico |
| `name` | string | Nome completo |
| `code` | string | Código abreviado (ex: `PL`, `WC`) |
| `type` | string | `LEAGUE` ou `CUP` |
| `emblem` | string \| null | URL do escudo/logo |
| `plan` | string | Tier de acesso necessário |
| `area` | object | Área geográfica |
| `currentSeason` | object | Temporada em andamento |
| `seasons` | array | Histórico de temporadas |
| `lastUpdated` | string | ISO 8601 |

---

### `GET /v4/competitions/` — Todas as competições

**Descrição:** Lista todas as competições disponíveis (157 no total).

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `areas` | string | IDs de áreas separados por vírgula (ex: `2072,2081`) |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/competitions/
```

**Exemplo de resposta (abreviada):**
```json
{
  "count": 157,
  "filters": {},
  "competitions": [
    {
      "id": 2006,
      "area": {
        "id": 2001,
        "name": "Africa",
        "code": "AFR",
        "flag": null
      },
      "name": "WC Qualification CAF",
      "code": "QCAF",
      "type": "CUP",
      "emblem": null,
      "plan": "TIER_FOUR",
      "currentSeason": {
        "id": 555,
        "startDate": "2019-09-04",
        "endDate": "2021-11-16",
        "currentMatchday": 6,
        "winner": null
      },
      "numberOfAvailableSeasons": 2,
      "lastUpdated": "2022-03-13T18:51:44Z"
    }
  ]
}
```

---

### `GET /v4/competitions/{id}/standings` — Classificação

**Descrição:** Retorna a tabela de classificação de uma competição.

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `matchday` | integer | Classificação de uma rodada específica |
| `season` | integer | Ano de início da temporada (ex: `2021`) |
| `date` | string | Data no formato `YYYY-MM-DD` |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/competitions/PL/standings
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": { "season": "2021" },
  "area": {
    "id": 2072,
    "name": "England",
    "code": "ENG",
    "flag": "https://crests.football-data.org/770.svg"
  },
  "competition": {
    "id": 2021,
    "name": "Premier League",
    "code": "PL",
    "type": "LEAGUE",
    "emblem": "https://crests.football-data.org/PL.png"
  },
  "season": {
    "id": 733,
    "startDate": "2021-08-13",
    "endDate": "2022-05-22",
    "currentMatchday": 37,
    "winner": null,
    "stages": ["REGULAR_SEASON"]
  },
  "standings": [
    {
      "stage": "REGULAR_SEASON",
      "type": "TOTAL",
      "group": null,
      "table": [
        {
          "position": 1,
          "team": {
            "id": 65,
            "name": "Manchester City FC",
            "shortName": "Man City",
            "tla": "MCI",
            "crest": "https://crests.football-data.org/65.png"
          },
          "playedGames": 36,
          "form": "WWWWW",
          "won": 26,
          "draw": 6,
          "lost": 4,
          "points": 84,
          "goalsFor": 96,
          "goalsAgainst": 24,
          "goalDifference": 72
        }
      ]
    }
  ]
}
```

**Tipos de `standings[].type`:** `TOTAL`, `HOME`, `AWAY`

---

### `GET /v4/competitions/{id}/matches` — Partidas de uma competição

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `dateFrom` | string | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | Data final `YYYY-MM-DD` |
| `stage` | string | Fase do torneio (ex: `GROUP_STAGE`, `FINAL`) |
| `status` | string | Status da partida (ver tabela de status acima) |
| `matchday` | integer | Número da rodada |
| `group` | string | Grupo (ex: `GROUP_A`) |
| `season` | integer | Ano de início da temporada |

**Exemplo de requisição:**
```bash
curl -X GET "http://api.football-data.org/v4/competitions/2003/matches?matchday=1" \
  -H "X-Unfold-Goals: true"
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": { "season": "2021", "matchday": "34" },
  "resultSet": {
    "count": 9,
    "first": "2022-05-14",
    "last": "2022-05-14",
    "played": 9
  },
  "competition": {
    "id": 2002,
    "name": "Bundesliga",
    "code": "BL1",
    "type": "LEAGUE",
    "emblem": "https://crests.football-data.org/BL1.png"
  },
  "matches": [
    {
      "id": 391905,
      "utcDate": "2022-05-14T13:30:00Z",
      "status": "FINISHED",
      "matchday": 34,
      "stage": "REGULAR_SEASON",
      "group": null,
      "homeTeam": { "id": 5, "name": "FC Bayern München" },
      "awayTeam": { "id": 3, "name": "Borussia Dortmund" },
      "score": {
        "winner": "HOME_TEAM",
        "duration": "REGULAR",
        "fullTime": { "home": 3, "away": 1 },
        "halfTime": { "home": 1, "away": 0 }
      },
      "goals": [],
      "odds": { "homeWin": 1.5, "draw": 4.0, "awayWin": 6.0 },
      "referees": []
    }
  ]
}
```

---

### `GET /v4/competitions/{id}/teams` — Times de uma competição

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `season` | integer | Ano de início da temporada |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/competitions/WC/teams
```

**Exemplo de resposta (abreviada):**
```json
{
  "count": 32,
  "filters": { "season": "2022" },
  "competition": {
    "id": 2000,
    "name": "FIFA World Cup",
    "code": "WC",
    "type": "CUP",
    "emblem": "https://crests.football-data.org/qatar.png"
  },
  "season": {
    "id": 1382,
    "startDate": "2022-11-21",
    "endDate": "2022-12-18",
    "currentMatchday": 1,
    "winner": null,
    "stages": ["GROUP_STAGE", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"]
  },
  "teams": [
    {
      "area": { "id": 2257, "name": "Uruguay", "code": "URY", "flag": null },
      "id": 758,
      "name": "Uruguay",
      "shortName": "Uruguay",
      "tla": "URU",
      "crest": "https://crests.football-data.org/758.svg",
      "address": "Guayaybo 1531 Montevideo 11200",
      "website": "http://www.auf.org.uy",
      "founded": 1900,
      "clubColors": "Sky Blue / White",
      "venue": "Estadio Centenario",
      "coach": {
        "id": 12345,
        "name": "Diego Alonso",
        "nationality": "Uruguay"
      },
      "squad": []
    }
  ]
}
```

---

### `GET /v4/competitions/{id}/scorers` — Artilheiros

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | integer | Número de artilheiros a retornar |
| `season` | integer | Ano de início da temporada |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/competitions/SA/scorers
```

**Exemplo de resposta (abreviada):**
```json
{
  "count": 10,
  "filters": { "season": "2021", "limit": 10 },
  "competition": {
    "id": 2019,
    "name": "Serie A",
    "code": "SA",
    "type": "LEAGUE",
    "emblem": "https://crests.football-data.org/SA.png"
  },
  "season": {
    "id": 757,
    "startDate": "2021-08-21",
    "endDate": "2022-05-22",
    "currentMatchday": 37,
    "winner": null,
    "stages": ["REGULAR_SEASON"]
  },
  "scorers": [
    {
      "player": {
        "id": 2076,
        "name": "Ciro Immobile",
        "firstName": "Ciro",
        "lastName": "Immobile",
        "dateOfBirth": "1990-02-20",
        "nationality": "Italy",
        "position": "Offence",
        "shirtNumber": null,
        "lastUpdated": "2021-10-13T08:03:51Z"
      },
      "team": {
        "id": 110,
        "name": "SS Lazio",
        "shortName": "Lazio",
        "tla": "LAZ",
        "crest": "https://crests.football-data.org/110.png"
      },
      "playedMatches": 35,
      "goals": 27,
      "assists": 7,
      "penalties": 5
    }
  ]
}
```

---

### `GET /v4/teams/{id}` — Time específico

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/teams/2061
```

**Exemplo de resposta (abreviada):**
```json
{
  "area": {
    "id": 2011,
    "name": "Argentina",
    "code": "ARG",
    "flag": "https://crests.football-data.org/762.png"
  },
  "id": 2061,
  "name": "CA Boca Juniors",
  "shortName": "Boca Juniors",
  "tla": "BOC",
  "crest": "https://crests.football-data.org/2061.png",
  "address": "Brandsen 805, La Boca Buenos Aires, Buenos Aires 1161",
  "website": "http://www.bocajuniors.com.ar",
  "founded": 1905,
  "clubColors": "Dark Blue / Yellow",
  "venue": "Estadio Alberto José Armando",
  "runningCompetitions": [
    {
      "id": 2152,
      "name": "Copa Libertadores",
      "code": "CLI",
      "type": "CUP",
      "emblem": "https://crests.football-data.org/CLI.svg"
    }
  ],
  "coach": {
    "id": 60123,
    "firstName": "Sebastián",
    "lastName": "Battaglia",
    "name": "Sebastián Battaglia",
    "nationality": "Argentina",
    "dateOfBirth": "1980-01-01",
    "contract": {
      "start": "2021-09-01",
      "until": "2023-12-31"
    }
  },
  "squad": [
    {
      "id": 3210,
      "name": "Agustín Rossi",
      "position": "Goalkeeper",
      "dateOfBirth": "1995-08-21",
      "nationality": "Argentina"
    }
  ],
  "staff": [],
  "lastUpdated": "2022-05-01T00:00:00Z"
}
```

**Campos do objeto `Team`:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | integer | Identificador único |
| `name` | string | Nome completo |
| `shortName` | string | Nome abreviado |
| `tla` | string | Abreviação 3 letras |
| `crest` | string \| null | URL do escudo |
| `address` | string | Endereço físico |
| `website` | string | Site oficial |
| `founded` | integer | Ano de fundação |
| `clubColors` | string | Cores do clube |
| `venue` | string | Nome do estádio |
| `runningCompetitions` | array | Competições ativas |
| `coach` | object | Técnico atual |
| `squad` | array | Elenco |

---

### `GET /v4/teams/` — Listar times

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | integer | Número de times por página |
| `offset` | integer | Deslocamento para paginação |

**Exemplo de requisição:**
```bash
curl -X GET "http://api.football-data.org/v4/teams/?limit=20&offset=0"
```

---

### `GET /v4/teams/{id}/matches/` — Partidas de um time

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `dateFrom` | string | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | Data final `YYYY-MM-DD` |
| `season` | integer | Ano de início da temporada |
| `competitions` | string | IDs ou códigos de competições separados por vírgula |
| `status` | string | Status da partida |
| `venue` | string | `HOME` ou `AWAY` |
| `limit` | integer | Número máximo de resultados |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/teams/759/matches
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": {
    "competitions": "WC",
    "permission": "TIER_THREE",
    "limit": 100
  },
  "resultSet": {
    "count": 3,
    "competitions": "WC",
    "first": "2022-11-23",
    "last": "2022-12-01",
    "played": 0,
    "wins": 0,
    "draws": 3,
    "losses": 0
  },
  "matches": [
    {
      "id": 391905,
      "utcDate": "2022-11-23T13:00:00Z",
      "status": "SCHEDULED",
      "matchday": 1,
      "stage": "GROUP_STAGE",
      "group": "GROUP_E",
      "homeTeam": { "id": 759, "name": "Germany" },
      "awayTeam": { "id": 800, "name": "Japan" },
      "score": {
        "winner": null,
        "duration": "REGULAR",
        "fullTime": { "home": null, "away": null },
        "halfTime": { "home": null, "away": null }
      }
    }
  ]
}
```

---

### `GET /v4/persons/{id}` — Pessoa específica

**Descrição:** Retorna dados de um jogador ou técnico.

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/persons/44
```

**Exemplo de resposta:**
```json
{
  "id": 44,
  "name": "Cristiano Ronaldo",
  "firstName": "Cristiano Ronaldo",
  "lastName": "dos Santos Aveiro",
  "dateOfBirth": "1985-02-05",
  "nationality": "Portugal",
  "position": "Offence",
  "shirtNumber": 7,
  "lastUpdated": "2022-05-01T00:00:00Z",
  "currentTeam": {
    "id": 66,
    "name": "Manchester United FC",
    "shortName": "Man United",
    "tla": "MUN",
    "crest": "https://crests.football-data.org/66.png",
    "area": { "id": 2072, "name": "England" },
    "contract": {
      "start": "2021-08-28",
      "until": "2023-06-30"
    }
  }
}
```

**Valores de `position`:** `Goalkeeper`, `Defence`, `Midfield`, `Offence`

---

### `GET /v4/persons/{id}/matches` — Partidas de uma pessoa

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `dateFrom` | string | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | Data final `YYYY-MM-DD` |
| `status` | string | Status da partida |
| `competitions` | string | IDs ou códigos separados por vírgula |
| `limit` | integer | Número máximo de resultados |
| `offset` | integer | Deslocamento para paginação |

**Exemplo de requisição:**
```bash
curl -X GET "http://api.football-data.org/v4/persons/16271/matches?limit=5" \
  -H "X-Unfold-Goals: true"
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": {
    "limit": 5,
    "offset": 0,
    "competitions": "BL1,DFB,EL,WC",
    "permission": "TIER_THREE"
  },
  "resultSet": {
    "count": 5,
    "competitions": "EL,BL1",
    "first": "2022-05-02",
    "last": "2022-05-18"
  },
  "aggregations": {
    "matchesOnPitch": 5,
    "startingXI": 3,
    "minutesPlayed": 328,
    "goals": 0,
    "ownGoals": 0,
    "assists": 0,
    "penalties": 0,
    "subbedOut": 1,
    "subbedIn": 2,
    "yellowCards": 0,
    "yellowRedCards": 0,
    "redCards": 0
  },
  "person": {
    "id": 16271,
    "name": "Djibril Sow",
    "firstName": "Djibril",
    "lastName": "Sow",
    "dateOfBirth": "1997-02-06",
    "nationality": "Switzerland",
    "position": "Midfield",
    "shirtNumber": null,
    "lastUpdated": "2022-03-17T16:47:43Z"
  },
  "matches": []
}
```

---

### `GET /v4/matches/{id}` — Partida específica

**Descrição:** Retorna todos os dados de uma partida: placar, escalações, gols, cartões, substituições, árbitros e odds.

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/matches/327117
```

**Exemplo de resposta (abreviada):**
```json
{
  "area": { "id": 2072, "name": "England", "code": "ENG", "flag": "https://crests.football-data.org/770.svg" },
  "competition": { "id": 2021, "name": "Premier League", "code": "PL", "type": "LEAGUE" },
  "season": {
    "id": 733,
    "startDate": "2021-08-13",
    "endDate": "2022-05-22",
    "currentMatchday": 37,
    "winner": null
  },
  "id": 327117,
  "utcDate": "2022-02-12T12:30:00Z",
  "status": "FINISHED",
  "minute": 90,
  "injuryTime": 6,
  "attendance": 73084,
  "venue": "Old Trafford",
  "matchday": 25,
  "stage": "REGULAR_SEASON",
  "group": null,
  "lastUpdated": "2022-05-17T17:33:08Z",
  "homeTeam": {
    "id": 66,
    "name": "Manchester United FC",
    "shortName": "Man United",
    "tla": "MUN",
    "crest": "https://crests.football-data.org/66.png",
    "coach": { "id": 9344, "name": "Ralf Rangnick", "nationality": "Germany" },
    "leagueRank": 4,
    "formation": "4-2-3-1",
    "lineup": [
      { "id": 1234, "name": "David de Gea", "position": "Goalkeeper", "shirtNumber": 1 }
    ],
    "bench": []
  },
  "awayTeam": {
    "id": 64,
    "name": "Liverpool FC",
    "shortName": "Liverpool",
    "tla": "LIV",
    "crest": "https://crests.football-data.org/64.png",
    "coach": { "id": 9344, "name": "Jürgen Klopp", "nationality": "Germany" },
    "leagueRank": 2,
    "formation": "4-3-3",
    "lineup": [],
    "bench": []
  },
  "score": {
    "winner": "AWAY_TEAM",
    "duration": "REGULAR",
    "fullTime": { "home": 0, "away": 5 },
    "halfTime": { "home": 0, "away": 4 }
  },
  "goals": [
    {
      "minute": 22,
      "injuryTime": null,
      "type": "REGULAR",
      "team": { "id": 64, "name": "Liverpool FC" },
      "scorer": { "id": 7867, "name": "Trent Alexander-Arnold" },
      "assist": { "id": 4092, "name": "Diogo Jota" },
      "score": { "home": 0, "away": 1 }
    }
  ],
  "penalties": [],
  "bookings": [
    {
      "minute": 50,
      "team": { "id": 66, "name": "Manchester United FC" },
      "player": { "id": 9999, "name": "Fred" },
      "card": "YELLOW"
    }
  ],
  "substitutions": [
    {
      "minute": 65,
      "team": { "id": 64, "name": "Liverpool FC" },
      "playerOut": { "id": 7873, "name": "Curtis Jones" },
      "playerIn": { "id": 5678, "name": "Naby Keïta" }
    }
  ],
  "odds": { "homeWin": 2.4, "draw": 3.5, "awayWin": 3.0 },
  "referees": [
    { "id": 11551, "name": "Martin Atkinson", "type": "REFEREE", "nationality": "England" },
    { "id": 11606, "name": "Constantine Hatzidakis", "type": "ASSISTANT_REFEREE_N1", "nationality": "England" },
    { "id": 11494, "name": "Stuart Attwell", "type": "VIDEO_ASSISTANT_REFEREE_N1", "nationality": "England" }
  ]
}
```

**Tipos de `goals[].type`:** `REGULAR`, `OWN`, `PENALTY`

**Tipos de `bookings[].card`:** `YELLOW`, `YELLOW_RED`, `RED`

**Tipos de árbitros (`referees[].type`):**

| Valor | Descrição |
|-------|-----------|
| `REFEREE` | Árbitro principal |
| `ASSISTANT_REFEREE_N1` | Auxiliar 1 |
| `ASSISTANT_REFEREE_N2` | Auxiliar 2 |
| `FOURTH_OFFICIAL` | Quarto árbitro |
| `VIDEO_ASSISTANT_REFEREE_N1` | VAR principal |
| `VIDEO_ASSISTANT_REFEREE_N2` | VAR auxiliar |

---

### `GET /v4/matches` — Partidas entre competições

**Descrição:** Lista partidas de múltiplas competições simultaneamente.

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `competitions` | string | IDs ou códigos separados por vírgula (ex: `PL,BL1`) |
| `ids` | string | IDs de partidas específicas separados por vírgula |
| `dateFrom` | string | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | Data final `YYYY-MM-DD` |
| `status` | string | Status da partida |

**Exemplo de requisição:**
```bash
curl -X GET http://api.football-data.org/v4/matches \
  -H "X-Unfold-Goals: true"
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": {
    "dateFrom": "2022-05-17",
    "dateTo": "2022-05-18",
    "permission": "TIER_THREE"
  },
  "resultSet": {
    "count": 10,
    "competitions": "CPD,VEI,REG,PL,BSB,CLI",
    "first": "2022-05-17",
    "last": "2022-05-17",
    "played": 1
  },
  "matches": []
}
```

---

### `GET /v4/matches/{id}/head2head` — Histórico entre dois times

**Descrição:** Retorna o histórico de confrontos diretos entre os dois times da partida indicada pelo `id`.

**Filtros:**

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `limit` | integer | Número máximo de partidas |
| `dateFrom` | string | Data inicial `YYYY-MM-DD` |
| `dateTo` | string | Data final `YYYY-MM-DD` |
| `competitions` | string | IDs ou códigos de competições separados por vírgula |

**Exemplo de requisição:**
```bash
curl -X GET "http://api.football-data.org/v4/matches/327125/head2head?limit=50"
```

**Exemplo de resposta (abreviada):**
```json
{
  "filters": { "limit": "50", "permission": "TIER_THREE" },
  "resultSet": {
    "count": 50,
    "competitions": "PL,FAC",
    "first": "1991-08-15",
    "last": "2022-02-09"
  },
  "aggregates": {
    "numberOfMatches": 50,
    "totalGoals": 153,
    "homeTeam": {
      "id": 73,
      "name": "Tottenham Hotspur FC",
      "wins": 26,
      "draws": 9,
      "losses": 15
    },
    "awayTeam": {
      "id": 340,
      "name": "Southampton FC",
      "wins": 15,
      "draws": 9,
      "losses": 26
    }
  },
  "matches": []
}
```

---

## Códigos de Competições Populares

| Código | Nome | Tipo |
|--------|------|------|
| `PL` | Premier League | LEAGUE |
| `BL1` | Bundesliga | LEAGUE |
| `SA` | Serie A | LEAGUE |
| `PD` | La Liga (Primera Division) | LEAGUE |
| `FL1` | Ligue 1 | LEAGUE |
| `DED` | Eredivisie | LEAGUE |
| `PPL` | Primeira Liga | LEAGUE |
| `CL` | UEFA Champions League | CUP |
| `EL` | UEFA Europa League | CUP |
| `EC` | European Championship | CUP |
| `WC` | FIFA World Cup | CUP |
| `BSA` | Brasileirão Série A | LEAGUE |
| `BSB` | Brasileirão Série B | LEAGUE |
| `CLI` | Copa Libertadores | CUP |
| `FAC` | FA Cup | CUP |
| `MLS` | Major League Soccer | LEAGUE |

---

## IDs de Países/Áreas Relevantes

| ID | Nome |
|----|------|
| `2072` | England |
| `2088` | Germany |
| `2081` | France |
| `2114` | Italy |
| `2224` | Spain |
| `2032` | Brazil |
| `2011` | Argentina |
| `2267` | World |
| `2077` | Europe |
| `2220` | South America |

---

## Objeto Match — Estrutura Completa

```
Match {
  area              { id, name, code, flag }
  competition       { id, name, code, type, emblem }
  season            { id, startDate, endDate, currentMatchday, winner, stages[] }
  id                integer
  utcDate           string (ISO 8601)
  status            string (ver tabela de status)
  minute            integer | null  (minuto atual ou final)
  injuryTime        integer | null
  attendance        integer | null
  venue             string | null
  matchday          integer | null
  stage             string
  group             string | null
  lastUpdated       string (ISO 8601)
  homeTeam          TeamInMatch
  awayTeam          TeamInMatch
  score {
    winner          "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null
    duration        "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT"
    fullTime        { home: int|null, away: int|null }
    halfTime        { home: int|null, away: int|null }
  }
  goals[]           { minute, injuryTime, type, team, scorer, assist, score }
  penalties[]       { player, team, scored }
  bookings[]        { minute, team, player, card }
  substitutions[]   { minute, team, playerOut, playerIn }
  odds              { homeWin: float|null, draw: float|null, awayWin: float|null }
  referees[]        { id, name, type, nationality }
}

TeamInMatch {
  id, name, shortName, tla, crest
  coach             { id, name, nationality }
  leagueRank        integer | null
  formation         string | null  (ex: "4-3-3")
  lineup[]          { id, name, position, shirtNumber }
  bench[]           { id, name, position, shirtNumber }
}
```

---

## Exemplos Práticos de Uso

### Buscar tabela de classificação da Premier League
```bash
curl -X GET "http://api.football-data.org/v4/competitions/PL/standings" \
  -H "X-Auth-Token: {SUA_API_KEY}"
```

### Buscar partidas de hoje
```bash
curl -X GET "http://api.football-data.org/v4/matches?dateFrom=2024-01-15&dateTo=2024-01-15" \
  -H "X-Auth-Token: {SUA_API_KEY}"
```

### Buscar próximas partidas do Real Madrid
```bash
curl -X GET "http://api.football-data.org/v4/teams/86/matches/?status=SCHEDULED&limit=10" \
  -H "X-Auth-Token: {SUA_API_KEY}"
```

### Buscar artilheiros do Brasileirão Série A
```bash
curl -X GET "http://api.football-data.org/v4/competitions/BSA/scorers?season=2024" \
  -H "X-Auth-Token: {SUA_API_KEY}"
```

### Buscar histórico de confrontos entre dois times
```bash
# Primeiro obtenha um match_id de uma partida entre os dois times
# Depois use o head2head
curl -X GET "http://api.football-data.org/v4/matches/{match_id}/head2head?limit=20" \
  -H "X-Auth-Token: {SUA_API_KEY}"
```

### Buscar detalhes de uma partida com escalação e gols expandidos
```bash
curl -X GET "http://api.football-data.org/v4/matches/{match_id}" \
  -H "X-Auth-Token: {SUA_API_KEY}" \
  -H "X-Unfold-Goals: true" \
  -H "X-Unfold-Lineups: true" \
  -H "X-Unfold-Substitutions: true" \
  -H "X-Unfold-Bookings: true"
```

---

## Erros Comuns

| HTTP Status | Significado |
|-------------|-------------|
| `400` | Parâmetro inválido ou filtro mal formatado |
| `401` | API key inválida ou ausente |
| `403` | Acesso negado (tier insuficiente para aquele dado) |
| `404` | Recurso não encontrado (ID inexistente) |
| `429` | Rate limit atingido (muitas requisições) |

---

## Links Úteis

- **Documentação oficial:** https://www.football-data.org/documentation/quickstart
- **Registro / API Key:** https://www.football-data.org
- **Crests / Flags CDN:** `https://crests.football-data.org/{id}.png` ou `.svg`
