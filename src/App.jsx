import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Trophy, 
  BarChart3, 
  Bell, 
  User, 
  Plus, 
  Minus, 
  Lock, 
  Check, 
  X, 
  Share2, 
  Calendar, 
  ChevronRight, 
  Users, 
  Coins, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Settings,
  LogOut,
  Key,
  Download,
  UserCheck,
  Smartphone,
  History
} from 'lucide-react';
import { supabase } from './utils/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

dayjs.locale('pt-br');

import LiveScoreWidget from './components/LiveScoreWidget';

const translateTeam = (name) => {
  if (!name) return name;
  const dict = {
    'Mexico': 'México',
    'South Africa': 'África do Sul',
    'South Korea': 'Coreia do Sul',
    'Czech Republic': 'República Tcheca',
    'Czechia': 'República Tcheca',
    'Canada': 'Canadá',
    'Bosnia and Herzegovina': 'Bósnia e Herzegovina',
    'Argentina': 'Argentina',
    'Algeria': 'Argélia',
    'Germany': 'Alemanha',
    'Brazil': 'Brasil',
    'France': 'França',
    'England': 'Inglaterra',
    'Spain': 'Espanha',
    'Italy': 'Itália',
    'Netherlands': 'Holanda',
    'Belgium': 'Bélgica',
    'Portugal': 'Portugal',
    'Uruguay': 'Uruguai',
    'Croatia': 'Croácia',
    'Switzerland': 'Suíça',
    'Denmark': 'Dinamarca',
    'Sweden': 'Suécia',
    'Poland': 'Polônia',
    'Senegal': 'Senegal',
    'Morocco': 'Marrocos',
    'Tunisia': 'Tunísia',
    'Cameroon': 'Camarões',
    'Ghana': 'Gana',
    'Japan': 'Japão',
    'Australia': 'Austrália',
    'Saudi Arabia': 'Arábia Saudita',
    'Iran': 'Irã',
    'United States': 'Estados Unidos',
    'USA': 'Estados Unidos',
    'Costa Rica': 'Costa Rica',
    'Ecuador': 'Equador',
    'Qatar': 'Catar',
    'Serbia': 'Sérvia',
    'Wales': 'País de Gales',
    'Ukraine': 'Ucrânia',
    'Scotland': 'Escócia',
    'Peru': 'Peru',
    'New Zealand': 'Nova Zelândia',
    'Colombia': 'Colômbia',
    'Chile': 'Chile',
    'Paraguay': 'Paraguai',
    'Venezuela': 'Venezuela',
    'Bolivia': 'Bolívia',
    'Turkey': 'Turquia',
    'Russia': 'Rússia',
    'Austria': 'Áustria',
    'Jordan': 'Jordânia'
  };
  return dict[name] || name;
};

// Current local time
const CURRENT_TIME = new Date();

// Phase Multipliers and Labels
const PHASE_MAP = {
  groups: { label: '1ª Fase', mult: 1 },
  round_of_32: { label: '16-avos de Final', mult: 2 },
  round_of_16: { label: 'Oitavas de Final', mult: 3 },
  quarter_finals: { label: 'Quartas de Final', mult: 4 },
  semi_finals: { label: 'Semifinal', mult: 6 },
  final: { label: 'Final', mult: 10 },
};

function ImageWithFallback({ src, alt }) {
  const [error, setError] = useState(!src);
  
  useEffect(() => {
    setError(!src);
  }, [src]);

  return (
    <div className="w-9 h-6 min-w-[36px] rounded-sm overflow-hidden bg-[#1D1D1D] shadow-sm flex items-center justify-center shrink-0">
      {error ? (
        <span className="text-xs font-semibold text-neutral-500" title={alt}>⚽</span>
      ) : (
        <img 
          src={src} 
          alt={alt} 
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

function UserRoleBadge({ role }) {
  if (role === 'admin') {
    return (
      <span className="text-[10px] font-bold bg-[#F1C40F] text-black px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-[0_0_8px_#F1C40F] inline-flex items-center shrink-0">
        Admin
      </span>
    );
  }
  if (role === 'premium') {
    return (
      <span className="text-[10px] font-bold bg-[#FF7A00] text-white px-2 py-0.5 rounded-sm uppercase tracking-wider inline-flex items-center shrink-0">
        Premium
      </span>
    );
  }
  return null;
}

const isTbdMatch = (match) => {
  const isGeneric = (name) => {
    if (!name) return true;
    const n = name.toUpperCase();
    return n === 'TBD' || n.includes('VENCEDOR') || n.includes('WINNER') || n.includes('JOGO') || n.trim() === '';
  };
  
  return isGeneric(match.home_team) || isGeneric(match.away_team);
};

const getFormattedDeadline = (kickoffTimeStr) => {
  const kickoff = dayjs(kickoffTimeStr);
  const cutoff = kickoff.subtract(15, 'minute');
  const current = dayjs(CURRENT_TIME);
  const cutoffFormattedTime = cutoff.format('HH:mm');
  
  if (cutoff.isSame(current, 'day')) {
    return `Hoje às ${cutoffFormattedTime}`;
  } else if (cutoff.isSame(current.add(1, 'day'), 'day')) {
    return `Amanhã às ${cutoffFormattedTime}`;
  } else {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${cutoff.date()} de ${months[cutoff.month()]} às ${cutoffFormattedTime}`;
  }
};

const usePlatform = () => {
  const [platform, setPlatform] = useState('other');

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) setPlatform('ios');
    else if (/android/.test(userAgent)) setPlatform('android');
  }, []);

  return platform;
};

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('bolao_active_tab') || 'inicio';
  }); // inicio, boloes, ranking, convites, perfil
  const [rankingTab, setRankingTab] = useState('classificacao'); // classificacao, simulador
  const [toastMessage, setToastMessage] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolFee, setNewPoolFee] = useState('');
  const [pushReminder, setPushReminder] = useState(true);
  const [replicateGuesses, setReplicateGuesses] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const platform = usePlatform();
  const matchSectionRef = React.useRef(null);

  // Auth State
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMessage, setAuthSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // PWA States
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isPwa, setIsPwa] = useState(false);

  // Edit Profile States
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Pending Approvals State
  const [pendingApprovals, setPendingApprovals] = useState([]);

  // Management States
  const [targetUserToManage, setTargetUserToManage] = useState(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newRoleSelected, setNewRoleSelected] = useState('user');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [isPoolMembersModalOpen, setIsPoolMembersModalOpen] = useState(false);

  // Database synchronised state
  const [matches, setMatches] = useState([]);
  const [pools, setPools] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [poolMembers, setPoolMembers] = useState([]);
  const [poolGuesses, setPoolGuesses] = useState([]);
  
  // User Predictions for selected pool (keyed by match ID)
  const [userPredictions, setUserPredictions] = useState({});
  // Tiebreaker picks for knockout matches with draw prediction (keyed by match ID)
  const [tiebreakerPicks, setTiebreakerPicks] = useState({});
  // Simulated scores (keyed by match ID)
  const [simulatedScores, setSimulatedScores] = useState({});

  // Join pool by code state
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  // History states
  const [historyGuesses, setHistoryGuesses] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Expanded guesses state (keyed by match ID)
  const [expandedGuesses, setExpandedGuesses] = useState({});

  const toggleGuessesExpansion = (matchId) => {
    setExpandedGuesses(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  const renderParticipantGuesses = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return null;
    const locked = isMatchLocked(match.kickoff_time);
    
    if (!locked) {
      return (
        <div className="text-center p-2.5 bg-[#1D1D1D] rounded-sm border border-[#262626] text-[10px] text-neutral-400 mt-2">
          🔒 Os palpites do grupo ficarão visíveis 15 minutos antes do início do jogo.
        </div>
      );
    }

    const otherMembersGuesses = poolMembers
      .filter(m => m.profiles && m.profiles.id !== session.user.id)
      .map(m => {
        const guess = poolGuesses.find(g => g.user_id === m.profiles.id && g.match_id === matchId);
        return {
          profile: m.profiles,
          guess: guess ? `${guess.home_guess} × ${guess.away_guess}` : 'Sem palpite'
        };
      });

    if (otherMembersGuesses.length === 0) {
      return (
        <div className="text-center p-2 text-[10px] text-neutral-500 mt-2">
          Não há outros participantes neste bolão.
        </div>
      );
    }

    return (
      <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {otherMembersGuesses.map(({ profile: p, guess }) => (
          <div key={p.id} className="flex items-center justify-between bg-[#1D1D1D] p-2 rounded-sm border border-[#262626] text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded bg-[#FF7A00]/20 text-[#FF7A00] flex items-center justify-center font-bold text-[9px] overflow-hidden shrink-0 border border-[#FF7A00]/10">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                ) : (
                  p.full_name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="font-semibold text-white truncate max-w-[120px]">{p.full_name}</span>
            </div>
            <span className="font-bold text-[#FF7A00] px-1.5 py-0.5 bg-[#262626] rounded-sm">{guess}</span>
          </div>
        ))}
      </div>
    );
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleIosShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bolão Linkado',
          text: 'Participe do Bolão Linkado e dê seus palpites!',
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      triggerToast('API de compartilhamento não suportada neste navegador.');
    }
  };

  // PWA Listener
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsPwa(!!isStandalone);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Sync activeTab to localStorage
  useEffect(() => {
    localStorage.setItem('bolao_active_tab', activeTab);
  }, [activeTab]);

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscription for matches and guesses
  useEffect(() => {
    if (!session) return;

    const matchesChannel = supabase
      .channel('realtime-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setMatches(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
          } else if (payload.eventType === 'INSERT') {
            setMatches(prev => [...prev, payload.new].sort((a, b) => new Date(a.kickoff_time) - new Date(b.kickoff_time)));
          } else if (payload.eventType === 'DELETE') {
            setMatches(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const guessesChannel = supabase
      .channel('realtime-guesses')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'guesses' },
        (payload) => {
          if (!selectedPool) return;
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (payload.new.pool_id === selectedPool.id) {
              setPoolGuesses(prev => {
                const exists = prev.some(g => g.id === payload.new.id);
                if (exists) {
                  return prev.map(g => g.id === payload.new.id ? payload.new : g);
                } else {
                  return [...prev, payload.new];
                }
              });
            }
          } else if (payload.eventType === 'DELETE') {
            setPoolGuesses(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(guessesChannel);
    };
  }, [session, selectedPool]);

  // Fetch / Seed profile and load matches/pools on session state
  useEffect(() => {
    if (!session) {
      setProfile(null);
      setPools([]);
      setSelectedPool(null);
      return;
    }

    const loadUserData = async () => {
      // 1. Fetch Profile
      let { data: prof, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileErr) {
        console.error('Error fetching profile:', profileErr);
      }

      if (!prof) {
        // Create profile
        const { data: newProf, error: createProfileErr } = await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || 'Participante',
            avatar_url: ''
          })
          .select()
          .single();

        if (createProfileErr) {
          console.error('Error creating profile:', createProfileErr);
        } else {
          prof = newProf;
        }
      }
      setProfile(prof);
      setEditName(prof?.full_name || '');

      // 2. Fetch Matches & Seed if empty
      let { data: dbMatches, error: matchesErr } = await supabase
        .from('matches')
        .select('*')
        .order('kickoff_time', { ascending: true });

      if (matchesErr) {
        console.error('Error fetching matches:', matchesErr);
      }

      if (!dbMatches || dbMatches.length === 0) {
        const seedData = INITIAL_MATCHES.map(m => ({
          id: m.id,
          home_team: m.home_team,
          away_team: m.away_team,
          home_score: null,
          away_score: null,
          phase: m.phase,
          kickoff_time: m.kickoff_time,
          is_finished: false
        }));

        const { data: seeded, error: seedErr } = await supabase
          .from('matches')
          .insert(seedData)
          .select();

        if (seedErr) {
          console.error('Error seeding matches:', seedErr);
        }
        dbMatches = seeded || seedData;
      }
      setMatches(dbMatches);

      // Set initial simulated scores
      const initialSims = {};
      dbMatches.forEach(m => {
        initialSims[m.id] = {
          home: m.home_score !== null ? m.home_score : 0,
          away: m.away_score !== null ? m.away_score : 0
        };
      });
      setSimulatedScores(initialSims);

      // 3. Load Pools
      await loadPoolsData();
    };

    loadUserData();
  }, [session]);

  // Load pool members, guesses, and predictions when selectedPool changes
  useEffect(() => {
    if (!selectedPool || !session) return;

    const loadPoolDetails = async () => {
      // Fetch pool members
      const { data: members, error: membersErr } = await supabase
        .from('pool_members')
        .select('joined_at, profiles(*)')
        .eq('pool_id', selectedPool.id);

      if (membersErr) {
        console.error('Error fetching pool members:', membersErr);
      } else {
        setPoolMembers(members || []);
      }

      // Fetch guesses for this pool
      const { data: guesses, error: guessesErr } = await supabase
        .from('guesses')
        .select('*')
        .eq('pool_id', selectedPool.id);

      if (guessesErr) {
        console.error('Error fetching pool guesses:', guessesErr);
      } else {
        setPoolGuesses(guesses || []);
        
        // Map current user's predictions and tiebreaker picks for quick lookup in UI
        const preds = {};
        const tbPicks = {};
        guesses?.filter(g => g.user_id === session.user.id).forEach(g => {
          preds[g.match_id] = { home: g.home_guess, away: g.away_guess };
          if (g.tiebreaker_pick) tbPicks[g.match_id] = g.tiebreaker_pick;
        });
        setUserPredictions(preds);
        setTiebreakerPicks(tbPicks);
      }
    };

    if (selectedPool) {
      localStorage.setItem('bolao_selected_pool_id', selectedPool.id);
    }
    loadPoolDetails();
  }, [selectedPool, session]);

  const loadPendingApprovals = async () => {
    if (!session || !profile) return;
    const userRole = profile.role || 'user';
    if (userRole === 'user') {
      setPendingApprovals([]);
      return;
    }

    const { data: myPools } = await supabase
      .from('pool_members')
      .select('pool_id')
      .eq('user_id', session.user.id)
      .eq('is_approved', true);

    const poolIds = myPools?.map(mp => mp.pool_id) || [];
    if (poolIds.length === 0) {
      setPendingApprovals([]);
      return;
    }

    const { data: pendings, error } = await supabase
      .from('pool_members')
      .select('pool_id, user_id, joined_at, pools(name), profiles(full_name)')
      .in('pool_id', poolIds)
      .eq('is_approved', false);

    if (error) {
      console.error('Error fetching pending approvals:', error);
    } else {
      setPendingApprovals(pendings || []);
    }
  };

  const handleApproveMember = async (poolId, userId) => {
    try {
      const { error } = await supabase
        .from('pool_members')
        .update({ is_approved: true })
        .eq('pool_id', poolId)
        .eq('user_id', userId);

      if (error) throw error;
      triggerToast('Membro aprovado com sucesso!');
      await loadPendingApprovals();
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao aprovar membro.');
    }
  };

  const handleRejectMember = async (poolId, userId) => {
    try {
      const { error } = await supabase
        .from('pool_members')
        .delete()
        .eq('pool_id', poolId)
        .eq('user_id', userId);

      if (error) throw error;
      triggerToast('Solicitação recusada.');
      await loadPendingApprovals();
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao recusar solicitação.');
    }
  };

  useEffect(() => {
    if (session && profile) {
      loadPendingApprovals();
    }
  }, [session, profile]);

  const loadPoolsData = async () => {
    if (!session) return;

    const { data: memberPools, error: poolsErr } = await supabase
      .from('pool_members')
      .select('pool_id, pools(*)')
      .eq('user_id', session.user.id)
      .eq('is_approved', true);

    if (poolsErr) {
      console.error('Error loading pools:', poolsErr);
      return;
    }

    const poolIds = memberPools?.map(mp => mp.pool_id).filter(Boolean) || [];

    // Fetch member count for these pools
    let memberCounts = {};
    if (poolIds.length > 0) {
      const { data: countData, error: countErr } = await supabase
        .from('pool_members')
        .select('pool_id')
        .in('pool_id', poolIds)
        .eq('is_approved', true);
      
      if (!countErr && countData) {
        countData.forEach(cd => {
          memberCounts[cd.pool_id] = (memberCounts[cd.pool_id] || 0) + 1;
        });
      }
    }

    const loadedPools = memberPools?.map(mp => {
      if (!mp.pools) return null;
      return {
        ...mp.pools,
        participant_count: memberCounts[mp.pool_id] || 1
      };
    }).filter(Boolean) || [];

    setPools(loadedPools);

    if (loadedPools.length > 0) {
      const savedPoolId = localStorage.getItem('bolao_selected_pool_id');
      setSelectedPool(prev => {
        if (savedPoolId && loadedPools.some(p => p.id === savedPoolId)) {
          return loadedPools.find(p => p.id === savedPoolId);
        }
        if (prev && loadedPools.some(p => p.id === prev.id)) {
          return loadedPools.find(p => p.id === prev.id);
        }
        return loadedPools[0];
      });
    } else {
      setSelectedPool(null);
    }
  };

  const loadHistoryGuesses = async () => {
    if (!selectedPool || !session) return;
    setHistoryLoading(true);
    try {
      const { data, error } = await supabase
        .from('guesses')
        .select(`
          id,
          home_guess,
          away_guess,
          points_earned,
          pool_id,
          matches (
            home_team,
            away_team,
            home_score,
            away_score,
            phase,
            is_finished,
            home_team_crest,
            away_team_crest
          )
        `)
        .eq('pool_id', selectedPool.id);
        
      if (error) throw error;
      
      const finishedGuesses = (data || []).filter(g => g.matches && g.matches.is_finished);
      setHistoryGuesses(finishedGuesses);
    } catch (err) {
      console.error('Error fetching history guesses:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPool && activeTab === 'historico') {
      loadHistoryGuesses();
    }
  }, [selectedPool, activeTab]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!session) return;
    setProfileLoading(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    try {
      if (editName.trim() && editName.trim() !== (profile?.full_name || '')) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: editName.trim() })
          .eq('id', session.user.id);
        if (error) throw error;
        setProfile(prev => prev ? { ...prev, full_name: editName.trim() } : null);
        setProfileSuccessMsg('Nome atualizado com sucesso!');
      }

      if (newPassword.trim()) {
        if (!currentPassword.trim()) {
          throw new Error('A senha atual é necessária para definir uma nova senha.');
        }

        const { error: reauthError } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword
        });

        if (reauthError) {
          throw new Error('Senha atual incorreta.');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) throw passwordError;

        setProfileSuccessMsg(prev => prev ? prev + ' E senha atualizada com sucesso!' : 'Senha atualizada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (err) {
      console.error(err);
      setProfileErrorMsg(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !session) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast('A imagem deve ter no máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setProfileLoading(true);
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: base64String })
          .eq('id', session.user.id);
        
        if (error) throw error;
        
        setProfile(prev => prev ? { ...prev, avatar_url: base64String } : null);
        triggerToast('Foto de perfil atualizada com sucesso!');
      } catch (err) {
        console.error('Error updating avatar:', err);
        triggerToast('Erro ao atualizar foto de perfil.');
      } finally {
        setProfileLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePwaInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setIsPwa(true);
        }
        setDeferredPrompt(null);
      });
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        triggerToast('Para instalar: toque em Compartilhar no Safari e selecione "Adicionar à Tela de Início"');
      } else {
        triggerToast('Instalação automática PWA não suportada neste navegador.');
      }
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccessMessage('');
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            avatar_url: ''
          });
        }
        setAuthSuccessMessage('Conta criada com sucesso! Faça login abaixo.');
        triggerToast('Conta criada com sucesso!');
        setIsSignUp(false);
        setPassword(''); // Clear password for security
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        setAuthSuccessMessage('Login realizado com sucesso! Redirecionando...');
        triggerToast('Bem-vindo de volta!');
      }
    } catch (err) {
      setAuthError(err.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    triggerToast('Deslogado com sucesso');
  };

  // Check if a match is locked (kickoff time within 15 minutes of CURRENT_TIME or in the past)
  const isMatchLocked = (kickoffTimeStr) => {
    const kickoff = new Date(kickoffTimeStr);
    const diffMs = kickoff.getTime() - CURRENT_TIME.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins <= 15;
  };

  // Helper to handle incrementing/decrementing prediction scores
  const handleUserPredictionChange = async (matchId, side, action) => {
    if (!selectedPool || !session) return;
    const match = matches.find(m => m.id === matchId);
    if (isMatchLocked(match.kickoff_time)) return;

    const current = userPredictions[matchId] || { home: 0, away: 0 };
    let val = parseInt(current[side], 10);
    if (isNaN(val)) val = 0;
    
    if (action === 'inc') {
      val = Math.min(val + 1, 20);
    }
    if (action === 'dec') {
      val = Math.max(val - 1, 0);
    }

    const updatedPred = {
      ...current,
      [side]: val
    };

    // Optimistic UI update
    setUserPredictions(prev => ({
      ...prev,
      [matchId]: updatedPred
    }));

    try {
      if (replicateGuesses) {
        // Bulk upsert across all user pools
        const upsertPromises = pools.map(pool => {
          return supabase
            .from('guesses')
            .upsert({
              user_id: session.user.id,
              match_id: matchId,
              pool_id: pool.id,
              home_guess: updatedPred.home,
              away_guess: updatedPred.away
            }, { onConflict: 'user_id,match_id,pool_id' });
        });
        await Promise.all(upsertPromises);
      } else {
        const existing = poolGuesses.find(g => g.match_id === matchId && g.user_id === session.user.id && g.pool_id === selectedPool.id);
        if (existing) {
          const { error } = await supabase
            .from('guesses')
            .update({
              home_guess: updatedPred.home,
              away_guess: updatedPred.away
            })
            .eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('guesses')
            .insert({
              user_id: session.user.id,
              match_id: matchId,
              pool_id: selectedPool.id,
              home_guess: updatedPred.home,
              away_guess: updatedPred.away
            });
          if (error) throw error;
        }
      }

      // Reload pool guesses to keep state in sync
      const { data: updatedGuesses } = await supabase
        .from('guesses')
        .select('*')
        .eq('pool_id', selectedPool.id);
      if (updatedGuesses) setPoolGuesses(updatedGuesses);
    } catch (err) {
      console.error('Error saving prediction:', err);
      triggerToast('Erro ao salvar palpite');
    }
  };

  // Handle tiebreaker pick (who advances when user predicts a draw in knockout rounds)
  const handleTiebreakerPick = async (matchId, pick) => {
    if (!selectedPool || !session) return;
    const match = matches.find(m => m.id === matchId);
    if (!match || isMatchLocked(match.kickoff_time)) return;

    // Toggle off if clicking same pick
    const newPick = tiebreakerPicks[matchId] === pick ? null : pick;

    // Optimistic UI update
    setTiebreakerPicks(prev => ({ ...prev, [matchId]: newPick }));

    try {
      const poolsToUpdate = replicateGuesses ? pools : [selectedPool];
      const promises = poolsToUpdate.map(pool =>
        supabase
          .from('guesses')
          .upsert({
            user_id: session.user.id,
            match_id: matchId,
            pool_id: pool.id,
            home_guess: userPredictions[matchId]?.home ?? 0,
            away_guess: userPredictions[matchId]?.away ?? 0,
            tiebreaker_pick: newPick
          }, { onConflict: 'user_id,match_id,pool_id' })
      );
      await Promise.all(promises);
      triggerToast(newPick
        ? `Classificado: ${newPick === 'home' ? translateTeam(match.home_team) : translateTeam(match.away_team)}`
        : 'Palpite de classificado removido');
    } catch (err) {
      console.error('Error saving tiebreaker:', err);
      triggerToast('Erro ao salvar classificado');
    }
  };

  // Handle admin setting advance_team on a match
  const handleSetAdvanceTeam = async (matchId, team) => {
    if (profile?.role !== 'admin') return;
    try {
      const { error } = await supabase
        .from('matches')
        .update({ advance_team: team })
        .eq('id', matchId);
      if (error) throw error;
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, advance_team: team } : m));
      triggerToast('Classificado registrado!');
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao registrar classificado.');
    }
  };
  // Sincronização de placares ao vivo desativada no cliente (gerenciada via API e widget externo)

  // Helper to handle incrementing/decrementing simulated scores
  const handleSimulatedScoreChange = (matchId, side, action) => {
    setSimulatedScores(prev => {
      const current = prev[matchId] || { home: 0, away: 0 };
      let val = current[side];
      if (action === 'inc') val += 1;
      if (action === 'dec' && val > 0) val -= 1;
      return {
        ...prev,
        [matchId]: {
          ...current,
          [side]: val
        }
      };
    });
  };

  // Calculate points based on prediction and actual/simulated score
  // tiebreaker: user's pick of who advances ('home'|'away'|null)
  // advanceTeam: actual team that advanced ('home'|'away'|null) — set by admin after match
  const calculatePointsForPrediction = (predHome, predAway, simHome, simAway, phase, tiebreaker = null, advanceTeam = null) => {
    if (predHome === undefined || predAway === undefined) return 0;
    const mult = PHASE_MAP[phase]?.mult || 1;
    const isKnockout = phase !== 'groups';

    // Exact score check
    if (predHome === simHome && predAway === simAway) {
      // Even on exact score in knockout, no tiebreaker bonus (score already determines winner)
      return 25 * mult;
    }

    // Winner/Draw result check
    const predResult = Math.sign(predHome - predAway); // 1=casa ganha, -1=visitante ganha, 0=empate
    const simResult  = Math.sign(simHome  - simAway);

    if (predResult === simResult) {
      let pts = 10 * mult;
      // Tiebreaker bonus: only in knockout when BOTH predicted AND actual result were draws
      if (isKnockout && predResult === 0 && simResult === 0 && tiebreaker && advanceTeam) {
        if (tiebreaker === advanceTeam) pts += 5 * mult;
      }
      return pts;
    }

    return 0;
  };

  // Compute standings dynamically based on simulated or actual scores
  const getStandings = () => {
    if (!selectedPool) return [];

    const updatedParticipants = poolMembers.map(m => {
      const pProfile = m.profiles;
      if (!pProfile) return null;

      let totalPoints = 0;
      
      matches.forEach(match => {
        // Find guess for this participant
        const guess = poolGuesses.find(g => g.user_id === pProfile.id && g.match_id === match.id);
        if (!guess) return;
        const pred = [guess.home_guess, guess.away_guess];
        
        if (match.is_finished) {
          totalPoints += calculatePointsForPrediction(
            pred[0], pred[1],
            match.home_score ?? 0, match.away_score ?? 0,
            match.phase,
            guess.tiebreaker_pick ?? null,
            match.advance_team ?? null
          );
        } else if (rankingTab === 'simulador') {
          const sim = simulatedScores[match.id] || { home: 0, away: 0 };
          totalPoints += calculatePointsForPrediction(
            pred[0], pred[1],
            sim.home, sim.away,
            match.phase
          );
        }
      });

      // Determine tier dynamically
      let tier = 'Bronze';
      if (totalPoints >= 150) tier = 'Diamante';
      else if (totalPoints >= 100) tier = 'Ouro';
      else if (totalPoints >= 50) tier = 'Prata';

      return {
        id: pProfile.id,
        name: pProfile.full_name,
        isUser: pProfile.id === session.user.id,
        points: totalPoints,
        tier,
        role: pProfile.role || 'user'
      };
    }).filter(Boolean);

    // Sort by points descending
    return updatedParticipants.sort((a, b) => b.points - a.points);
  };

  const standings = getStandings();

  // Create pool handler
  const handleCreatePool = async (e) => {
    e.preventDefault();
    if (!newPoolName.trim() || !session || !profile) return;

    const userRole = profile.role || 'user';

    if (userRole === 'user') {
      triggerToast('Apenas usuários Premium ou Admin podem criar bolões.');
      return;
    }

    if (userRole === 'premium') {
      const { count, error: countErr } = await supabase
        .from('pools')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', session.user.id);

      if (countErr) {
        console.error(countErr);
        triggerToast('Erro ao validar limite de bolões.');
        return;
      }

      if (count && count >= 1) {
        triggerToast('Limite de 1 bolão atingido para contas Premium!');
        return;
      }
    }

    // Generate random 8-character unique Invite Code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomLink = '';
    for (let i = 0; i < 8; i++) {
      randomLink += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const feeVal = newPoolFee ? parseFloat(newPoolFee) : 0;

    try {
      const { data: newPool, error: poolError } = await supabase
        .from('pools')
        .insert({
          name: newPoolName,
          owner_id: session.user.id,
          entry_fee: feeVal,
          invite_code: randomLink
        })
        .select()
        .single();

      if (poolError) throw poolError;

      // Add owner as first member (auto-approved)
      const { error: memberError } = await supabase
        .from('pool_members')
        .insert({
          pool_id: newPool.id,
          user_id: session.user.id,
          is_approved: true
        });

      if (memberError) throw memberError;

      setNewPoolName('');
      setNewPoolFee('');
      setIsCreateModalOpen(false);
      triggerToast(`Bolão "${newPool.name}" criado com sucesso!`);
      
      await loadPoolsData();
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao criar bolão');
    }
  };

  const handleJoinPoolByCode = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim() || !session) return;

    try {
      const { data: pool, error: searchError } = await supabase
        .from('pools')
        .select('*')
        .eq('invite_code', inviteCodeInput.trim())
        .maybeSingle();

      if (searchError || !pool) {
        triggerToast('Código de convite inválido ou não encontrado.');
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('pool_members')
        .select('*')
        .eq('pool_id', pool.id)
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (existingMember) {
        if (existingMember.is_approved) {
          triggerToast('Você já participa deste bolão!');
        } else {
          triggerToast('Sua solicitação de entrada já está pendente.');
        }
        return;
      }

      const { error: joinError } = await supabase
        .from('pool_members')
        .insert({
          pool_id: pool.id,
          user_id: session.user.id,
          is_approved: false
        });

      if (joinError) throw joinError;

      triggerToast(`Solicitação enviada para "${pool.name}"! Aguarde aprovação de um membro Premium/Admin.`);
      setInviteCodeInput('');
      await loadPoolsData();
      setActiveTab('boloes');
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao entrar no bolão.');
    }
  };

  return (
    <div className={`max-w-md w-full min-h-screen mx-auto bg-[#0D0D0D] border-x border-[#262626] text-white flex flex-col justify-between shadow-2xl relative font-sans select-none ${session ? 'pb-[72px]' : ''}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2ECC71] text-black px-4 py-3 rounded-sm shadow-lg flex items-center gap-2 font-semibold text-sm animate-fade-in border border-[#2ECC71]/30">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main View Scrollable Container */}
      <main className={`flex-1 overflow-y-auto px-4 ${session ? 'pt-6 pb-4' : 'flex flex-col justify-center py-12 px-6'}`}>
        
        {!session ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Trophy className="w-8 h-8 text-[#FF7A00]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">Bolão Linka</h1>
              <p className="text-sm text-neutral-400 mt-2">Dê seus palpites e dispute com seus amigos!</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4 text-left">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#151515] border border-[#262626] rounded-sm px-3.5 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-sm px-3.5 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Senha</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#151515] border border-[#262626] rounded-sm px-3.5 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>

              {authError && (
                <div className="bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-md p-3 flex gap-2.5 items-start text-xs text-[#FF4D4D] animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Erro</p>
                    <p className="text-neutral-400 mt-0.5">{authError}</p>
                  </div>
                </div>
              )}

              {authSuccessMessage && (
                <div className="bg-[#2ECC71]/10 border border-[#2ECC71]/20 rounded-md p-3 flex gap-2.5 items-start text-xs text-[#2ECC71] animate-fade-in">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Sucesso</p>
                    <p className="text-neutral-400 mt-0.5">{authSuccessMessage}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-sm h-12 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none mt-6"
              >
                {authLoading ? 'Processando...' : (isSignUp ? 'CRIAR CONTA' : 'ENTRAR')}
              </button>
            </form>

            <p className="text-xs text-neutral-400">
              {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'} {' '}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthSuccessMessage(''); }}
                className="text-[#FF7A00] font-bold hover:underline"
              >
                {isSignUp ? 'Entrar' : 'Cadastre-se'}
              </button>
            </p>
          </div>
        ) : (
          <>
        
        {/* --- VIEW 1: HOME DASHBOARD --- */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            {/* Top Greeting */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Painel de Palpites</p>
                <div className="flex items-center gap-2 mt-1">
                  <h1 className="text-3xl font-bold tracking-tight text-white">Olá, {profile?.full_name || 'Jogador'} 👋</h1>
                  <UserRoleBadge role={profile?.role} />
                </div>
                {!isPwa && (
                  <button
                    onClick={() => {
                      setActiveTab('perfil');
                      triggerToast('Siga as instruções de instalação no seu perfil!');
                    }}
                    className="mt-2 flex items-center gap-1.5 bg-[#1D1D1D] hover:bg-[#262626] border border-[#FF7A00]/40 rounded-full px-2.5 py-1 text-[11px] font-bold text-neutral-300 transition-all active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-[#FF7A00]" />
                    <span>Instalar Aplicativo 📱</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-[#FF7A00] flex items-center justify-center font-bold text-black border-2 border-[#262626] overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.full_name || 'J').charAt(0).toUpperCase()
                  )}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2ECC71] rounded-full border-2 border-[#0D0D0D]"></span>
              </div>
            </div>

            {/* Selected Pool Selection dropdown if multiple */}
            {pools.length > 1 && (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-3">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1.5">Mudar de Grupo/Bolão</label>
                <select
                  value={selectedPool?.id || ''}
                  onChange={(e) => {
                    const found = pools.find(p => p.id === e.target.value);
                    if (found) setSelectedPool(found);
                  }}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Match Card */}
            {(() => {
              const liveMatches = matches.filter(match => !match.is_finished && new Date(match.kickoff_time) <= new Date());
              if (liveMatches.length === 0) return null;
              
              return (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-widest flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#FF4D4D] rounded-full animate-pulse shadow-[0_0_8px_#FF4D4D]"></span>
                    <span>Jogos Ao Vivo</span>
                  </h3>
                  {liveMatches.map(match => {
                    const pred = userPredictions[match.id];
                    return (
                      <div key={match.id} className="bg-gradient-to-r from-[#1A0A0A] to-[#151515] border border-red-900/30 rounded-md p-4 shadow-lg relative overflow-hidden transition-all duration-300 hover:border-red-950/60">
                        {/* Status bar */}
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] bg-[#FF4D4D] text-black font-black px-2 py-0.5 rounded-sm uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_8px_rgba(255,77,77,0.4)]">
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></span>
                            Em Andamento
                          </span>
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            {PHASE_MAP[match.phase]?.label || match.phase}
                          </span>
                        </div>

                        {/* Match Score Display */}
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
                          <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                            <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                            <span className="text-xs font-bold text-white leading-tight truncate w-full">{translateTeam(match.home_team)}</span>
                          </div>

                          <div className="flex items-center gap-3 px-3 py-1.5 bg-[#151515]/80 rounded border border-[#262626]">
                            <span className="text-2xl font-black text-white">{match.home_score ?? 0}</span>
                            <span className="text-neutral-600 font-bold text-sm">×</span>
                            <span className="text-2xl font-black text-white">{match.away_score ?? 0}</span>
                          </div>

                          <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                            <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                            <span className="text-xs font-bold text-white leading-tight truncate w-full">{translateTeam(match.away_team)}</span>
                          </div>
                        </div>

                        {/* User Guess info */}
                        <div className="mt-3 pt-3 border-t border-[#262626]/60 flex items-center justify-between text-xs">
                          <span className="text-neutral-400 font-semibold">Seu Palpite:</span>
                          {pred ? (
                            <span className="font-bold text-[#FF7A00] bg-[#1D1D1D] px-2.5 py-1 rounded border border-[#262626]">
                              {pred.home} × {pred.away}
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic">Sem palpite registrado</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Featured Pool Card ("Seu Melhor Bolão") */}
            <div>
              <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-widest mb-3">Seu Bolão Ativo</h3>
              
              {selectedPool ? (
                <div className="bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card relative overflow-hidden transition-all duration-300 hover:border-neutral-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] bg-[#262626] text-neutral-300 font-bold px-2 py-1 rounded-pill uppercase tracking-wider">
                        Rodada 1/6
                      </span>
                      <h4 className="text-lg font-bold text-white mt-2 tracking-tight">{selectedPool.name}</h4>
                    </div>
                    <Trophy className="w-5 h-5 text-[#FF7A00]" />
                  </div>

                  {/* Avatar Stack */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {poolMembers.slice(0, 8).map((m, i) => (
                        <div key={i} className="inline-block h-7 w-7 rounded-lg bg-[#1D1D1D] ring-2 ring-[#151515] overflow-hidden flex items-center justify-center text-[10px] font-bold text-neutral-300 border border-neutral-800">
                          {m.profiles?.avatar_url ? (
                            <img src={m.profiles.avatar_url} alt="Membro" className="w-full h-full object-cover" />
                          ) : (
                            (m.profiles?.full_name || 'J').charAt(0).toUpperCase()
                          )}
                        </div>
                      ))}
                      {poolMembers.length > 8 && (
                        <div className="inline-block h-7 w-7 rounded-lg bg-[#262626] ring-2 ring-[#151515] flex items-center justify-center text-[9px] font-bold text-[#FF7A00] border border-neutral-800">
                          +{poolMembers.length - 8}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-neutral-400 font-semibold">{poolMembers.length} Participantes</span>
                  </div>

                  {/* Mini Leaderboard showing 1st, 2nd, 3rd places */}
                  {standings.length > 0 && (
                    <div className="border-t border-[#262626] pt-3 mt-1">
                      <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-2">Pódio Provisório</p>
                      <div className="grid grid-cols-3 gap-2">
                        {standings.slice(0, 3).map((item, idx) => (
                          <div key={item.id} className={`bg-[#1D1D1D] p-2 rounded-sm text-center relative ${idx === 0 ? 'border-l-2 border-[#FF7A00]' : ''}`}>
                            {idx === 0 && <span className="absolute -top-1 -right-1 text-[10px]">👑</span>}
                            <p className="text-[10px] text-neutral-400 truncate">{idx + 1}º {item.name}</p>
                            <p className="text-xs font-bold text-white mt-0.5">{item.points} pts</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collapsible Participants List */}
                  <div className="border-t border-[#262626] pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Participantes do Bolão</span>
                      <button 
                        onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                        className="text-[10px] text-[#FF7A00] font-bold uppercase tracking-wider hover:text-[#FF8C1A] active:scale-95 transition-all"
                      >
                        {isMembersExpanded ? 'Ocultar 🔼' : 'Ver Todos 🔽'}
                      </button>
                    </div>
                    
                    {isMembersExpanded && (
                      <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1">
                        {poolMembers.map((member) => {
                          const mProfile = member.profiles;
                          if (!mProfile) return null;
                          
                          const isOwner = selectedPool.owner_id === mProfile.id;
                          const targetRole = mProfile.role || 'user';
                          const currentUserRole = profile?.role || 'user';
                          const isCurrentUserOwner = selectedPool.owner_id === session.user.id;
                          
                          // Can manage logic
                          const canManage = isCurrentUserOwner || currentUserRole === 'admin' || currentUserRole === 'premium';
                          const isTargetAdmin = targetRole === 'admin';
                          const isPremiumLogged = currentUserRole === 'premium';
                          const isSelf = mProfile.id === session.user.id;
                          const isButtonDisabled = (isPremiumLogged && isTargetAdmin) || isSelf;

                          return (
                            <div key={mProfile.id} className="flex items-center justify-between bg-[#1D1D1D] p-2 rounded-sm border border-[#262626] text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <div className="w-7 h-7 rounded bg-[#FF7A00] flex items-center justify-center font-bold text-black text-[10px] overflow-hidden shrink-0">
                                  {mProfile.avatar_url ? (
                                    <img src={mProfile.avatar_url} alt="Membro" className="w-full h-full object-cover" />
                                  ) : (
                                    mProfile.full_name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex flex-col truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-white truncate">{mProfile.full_name}</span>
                                    {isOwner && <span className="text-[8px] bg-[#FF7A00]/20 text-[#FF7A00] px-1 rounded-sm uppercase font-bold">Criador</span>}
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <UserRoleBadge role={targetRole} />
                                  </div>
                                </div>
                              </div>
                              
                              {canManage && (
                                <button
                                  onClick={() => {
                                    setTargetUserToManage(mProfile);
                                    setNewRoleSelected(targetRole);
                                    setIsManageModalOpen(true);
                                  }}
                                  disabled={isButtonDisabled}
                                  className={`px-2.5 py-1 rounded-sm font-bold text-[10px] active:scale-95 transition-all border ${
                                    isButtonDisabled 
                                      ? 'bg-[#151515] border-[#262626] text-neutral-600 cursor-not-allowed' 
                                      : 'bg-[#262626] hover:bg-neutral-800 border-[#333] hover:text-[#FF7A00] text-neutral-300'
                                  }`}
                                >
                                  Gerenciar
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#151515] border border-[#262626] rounded-md p-6 text-center shadow-card">
                  <Trophy className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                  <p className="text-sm text-neutral-400">Você não faz parte de nenhum bolão no momento.</p>
                  <button 
                    onClick={() => setActiveTab('boloes')}
                    className="mt-4 bg-[#FF7A00] text-black font-bold text-xs px-4 py-2.5 rounded-sm hover:bg-[#FF8C1A] active:scale-95 transition-all"
                  >
                    {profile?.role === 'user' ? 'Entrar em um Bolão' : 'Criar ou Entrar em um Bolão'}
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Matches Section */}
            {selectedPool && (() => {
              const activeMatches = matches.filter(match => {
                const isLocked = isMatchLocked(match.kickoff_time);
                const isTbd = isTbdMatch(match);
                const kickoff = dayjs(match.kickoff_time);
                // World Cup 2026: June 11 – July 19, 2026 (months 4=May, 5=June, 6=July in 0-index)
                const isWorldCup2026 = kickoff.year() === 2026 && (kickoff.month() >= 4 && kickoff.month() <= 6);
                return !isLocked && !isTbd && isWorldCup2026;
              });

              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold uppercase text-neutral-400 tracking-widest">Jogos do Bolão</h3>
                    <button
                      onClick={() => setIsRulesModalOpen(true)}
                      className="text-xs text-neutral-400 hover:text-[#FF7A00] transition-colors flex items-center gap-1 font-semibold focus:outline-none"
                    >
                      Como funcionam as pontuações? ❔
                    </button>
                  </div>

                  {activeMatches.length > 0 ? (
                    <>
                      {/* Replicate Toggle Action — only shown when user is in 2+ pools */}
                      {pools.length > 1 && (
                        <>
                          <div className="bg-[#151515] border border-[#262626] rounded-md p-3.5 flex items-center justify-between shadow-sm">
                            <span className="text-xs text-neutral-300 font-semibold">Aplicar palpites em todos os meus bolões</span>
                            <button 
                              onClick={() => {
                                setReplicateGuesses(!replicateGuesses);
                                triggerToast(!replicateGuesses ? 'Palpites serão salvos em todos os seus bolões!' : 'Replicação desativada');
                              }}
                              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none flex items-center px-0.5 ${
                                replicateGuesses ? 'bg-[#FF7A00]' : 'bg-[#262626]'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                                replicateGuesses ? 'translate-x-[22px]' : 'translate-x-0'
                              }`} />
                            </button>
                          </div>

                          {/* Granular Pool Selector when Replicate is OFF */}
                          {!replicateGuesses && (
                            <div className="bg-[#151515] border border-[#262626] rounded-md p-3.5 space-y-2.5 shadow-sm">
                              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Palpitar no Bolão:</span>
                              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {pools.map(pool => {
                                  const isSelected = selectedPool?.id === pool.id;
                                  return (
                                    <button
                                      key={pool.id}
                                      onClick={() => {
                                        setSelectedPool(pool);
                                        triggerToast(`Visualizando palpites do bolão: ${pool.name}`);
                                      }}
                                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all whitespace-nowrap active:scale-95 shrink-0 ${
                                        isSelected 
                                          ? 'bg-[#FF7A00] text-black border-[#FF7A00] shadow-[0_0_10px_rgba(255,122,0,0.3)]' 
                                          : 'bg-[#1D1D1D] text-neutral-400 border-[#262626] hover:text-white'
                                      }`}
                                    >
                                      {pool.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* View Toggle (Carousel vs List) */}
                      <div ref={matchSectionRef} className="flex justify-between items-center bg-[#151515] border border-[#262626] rounded-md p-2 shadow-sm text-xs font-bold my-2">
                        <span className="text-neutral-400 pl-1.5">Visualização de Jogos:</span>
                        <button
                          onClick={() => {
                            const next = !isListExpanded;
                            setIsListExpanded(next);
                            triggerToast(next ? "Visualizando em Lista" : "Visualizando em Carrossel");
                            // Scroll the toggle bar to top of viewport for better UX
                            setTimeout(() => {
                              matchSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }, 80);
                          }}
                          className="text-[#FF7A00] hover:text-[#FF8C1A] active:scale-95 transition-all px-2.5 py-1 bg-[#1D1D1D] border border-[#262626] rounded-sm uppercase tracking-wider"
                        >
                          {isListExpanded ? "⬅️ Carrossel" : "Ver todos os jogos 📋"}
                        </button>
                      </div>

                      <motion.div layout className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                          {!isListExpanded ? (
                            /* HORIZONTAL CAROUSEL VIEW */
                            <motion.div 
                              key="carousel"
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              transition={{ duration: 0.25 }}
                              className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 snap-x"
                            >
                              {activeMatches.map(match => {
                                const locked = isMatchLocked(match.kickoff_time);
                                const tbd = isTbdMatch(match);
                                const pred = userPredictions[match.id] || { home: 0, away: 0 };
                                const kickoffDate = new Date(match.kickoff_time);
                                const timeFormatted = kickoffDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                const isKnockout = match.phase !== 'groups';
                                const isDrawPred = pred.home === pred.away;
                                const showTiebreaker = isKnockout && isDrawPred && !locked && !tbd;
                                const tiePick = tiebreakerPicks[match.id] || null;

                                return (
                                  <div 
                                    key={match.id} 
                                    className={`min-w-[280px] w-[280px] snap-center bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card flex flex-col gap-3 transition-opacity duration-200 ${tbd ? 'opacity-50' : ''}`}
                                  >
                                    {/* Match Phase and Lock Badge */}
                                    <div className="flex flex-col gap-1.5">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold bg-[#1D1D1D] px-2 py-0.5 rounded-full text-neutral-400 uppercase tracking-wider">
                                          {PHASE_MAP[match.phase]?.label || match.phase}
                                        </span>
                                        
                                        {tbd ? (
                                          <span className="text-[9px] font-bold bg-[#FF7A00]/20 text-[#FF7A00] px-2 py-0.5 rounded-full uppercase border border-[#FF7A00]/30 animate-pulse">
                                            A definir
                                          </span>
                                        ) : locked ? (
                                          <span className="flex items-center gap-1 text-[9px] font-bold bg-[#FF4D4D]/10 text-[#FF4D4D] px-2 py-0.5 rounded-full uppercase border border-[#FF4D4D]/20">
                                            <Lock className="w-2.5 h-2.5" /> Fechado
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 text-[9px] font-bold bg-[#2ECC71]/10 text-[#2ECC71] px-2 py-0.5 rounded-full uppercase border border-[#2ECC71]/20">
                                            Aberto
                                          </span>
                                        )}
                                      </div>
                                      {!locked && !tbd && (
                                        <p className="text-[10px] text-neutral-400 font-semibold leading-normal">
                                          Até: <span className="text-[#FF7A00] font-bold">{getFormattedDeadline(match.kickoff_time)}</span>
                                        </p>
                                      )}
                                      {tbd && (
                                        <p className="text-[10px] text-[#FF7A00] font-bold leading-normal">
                                          Confronto a definir
                                        </p>
                                      )}
                                    </div>

                                    {/* Teams + Score Row */}
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                      {/* Home Team */}
                                      <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                                        <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                                        <span className="text-[11px] font-bold text-white leading-tight w-full" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{translateTeam(match.home_team)}</span>
                                      </div>

                                      {/* Score Controls */}
                                      <div className="flex items-center gap-1 bg-[#1D1D1D] px-2 py-1.5 rounded-sm border border-[#262626] shrink-0">
                                        <div className="flex flex-col items-center gap-0.5">
                                          {!locked && !tbd && (
                                            <button 
                                              onClick={() => handleUserPredictionChange(match.id, 'home', 'inc')}
                                              className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          )}
                                          <span className="text-base font-black w-5 text-center text-white">{pred.home}</span>
                                          {!locked && !tbd && (
                                            <button 
                                              onClick={() => handleUserPredictionChange(match.id, 'home', 'dec')}
                                              className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                            >
                                              <Minus className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>

                                        <span className="text-neutral-600 font-bold text-sm px-0.5">×</span>

                                        <div className="flex flex-col items-center gap-0.5">
                                          {!locked && !tbd && (
                                            <button 
                                              onClick={() => handleUserPredictionChange(match.id, 'away', 'inc')}
                                              className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                          )}
                                          <span className="text-base font-black w-5 text-center text-white">{pred.away}</span>
                                          {!locked && !tbd && (
                                            <button 
                                              onClick={() => handleUserPredictionChange(match.id, 'away', 'dec')}
                                              className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                            >
                                              <Minus className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Away Team */}
                                      <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                                        <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                                        <span className="text-[11px] font-bold text-white leading-tight w-full" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{translateTeam(match.away_team)}</span>
                                      </div>
                                    </div>

                                    <div className="text-center pt-1 border-t border-[#1D1D1D] space-y-2">
                                      {/* Tiebreaker selector — knockout + draw prediction */}
                                      {showTiebreaker && (
                                        <div className="space-y-1.5 pt-1">
                                          <p className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider text-center">
                                            🏆 Quem classifica? <span className="text-neutral-500 font-normal">(+5 pts bônus)</span>
                                          </p>
                                          <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                              onClick={() => handleTiebreakerPick(match.id, 'home')}
                                              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-sm border text-[10px] font-bold transition-all active:scale-95 ${
                                                tiePick === 'home'
                                                  ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                                  : 'bg-[#1D1D1D] border-[#262626] text-neutral-400 hover:border-[#FF7A00]/50'
                                              }`}
                                            >
                                              <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                                              <span className="truncate max-w-[60px]">{translateTeam(match.home_team)}</span>
                                            </button>
                                            <button
                                              onClick={() => handleTiebreakerPick(match.id, 'away')}
                                              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-sm border text-[10px] font-bold transition-all active:scale-95 ${
                                                tiePick === 'away'
                                                  ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                                  : 'bg-[#1D1D1D] border-[#262626] text-neutral-400 hover:border-[#FF7A00]/50'
                                              }`}
                                            >
                                              <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                                              <span className="truncate max-w-[60px]">{translateTeam(match.away_team)}</span>
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      <p className="text-[10px] text-neutral-500">
                                        {locked ? 'Palpites encerrados.' : 'Palpite editável.'}
                                      </p>

                                      <button
                                        onClick={() => toggleGuessesExpansion(match.id)}
                                        className="w-full mt-2 py-1 bg-[#1D1D1D] hover:bg-[#262626] border border-[#262626] rounded-sm text-[9px] font-bold text-neutral-400 hover:text-white transition-all flex items-center justify-center gap-1 focus:outline-none"
                                      >
                                        <span>👥 Palpites do grupo</span>
                                        <span>{expandedGuesses[match.id] ? '▲' : '▼'}</span>
                                      </button>
                                      {expandedGuesses[match.id] && renderParticipantGuesses(match.id)}
                                    </div>
                                  </div>
                                );
                              })}
                            </motion.div>
                          ) : (
                            /* VERTICAL LIST VIEW */
                            <motion.div 
                              key="list"
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -30 }}
                              transition={{ duration: 0.25 }}
                              className="space-y-3"
                            >
                              {activeMatches.map(match => {
                                const locked = isMatchLocked(match.kickoff_time);
                                const tbd = isTbdMatch(match);
                                const pred = userPredictions[match.id] || { home: 0, away: 0 };
                                const kickoffDate = new Date(match.kickoff_time);
                                const dateFormatted = kickoffDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                                const timeFormatted = kickoffDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                                const isKnockout = match.phase !== 'groups';
                                const isDrawPred = pred.home === pred.away;
                                const showTiebreaker = isKnockout && isDrawPred && !locked && !tbd;
                                const tiePick = tiebreakerPicks[match.id] || null;

                                return (
                                  <div 
                                    key={match.id} 
                                    className={`bg-[#151515] border border-[#262626] rounded-md p-3.5 shadow-card transition-opacity duration-200 ${tbd ? 'opacity-50' : ''}`}
                                  >
                                    {/* Header row: phase label + date + status */}
                                    <div className="flex items-center justify-between mb-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[9px] font-bold bg-[#1D1D1D] px-2 py-0.5 rounded-sm text-neutral-400 uppercase">
                                          {PHASE_MAP[match.phase]?.label || match.phase}
                                        </span>
                                        <span className="text-[9px] text-neutral-500 font-semibold">
                                          {dateFormatted} · {timeFormatted}
                                        </span>
                                      </div>
                                      {tbd ? (
                                        <span className="text-[8px] font-bold bg-[#FF7A00]/20 text-[#FF7A00] px-1.5 py-0.5 rounded-sm uppercase border border-[#FF7A00]/30 animate-pulse">A definir</span>
                                      ) : locked ? (
                                        <Lock className="w-3 h-3 text-[#FF4D4D] opacity-80" />
                                      ) : (
                                        <Check className="w-3 h-3 text-[#2ECC71] opacity-80" />
                                      )}
                                    </div>

                                    {/* 3-column grid: Home | Score | Away */}
                                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                                      {/* Home Team */}
                                      <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                                        <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                                        <span className="text-[11px] font-bold text-white leading-tight w-full" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{translateTeam(match.home_team)}</span>
                                      </div>

                                      {/* Score controllers */}
                                      <div className="flex items-center gap-1 bg-[#1D1D1D] px-2 py-1.5 rounded-sm border border-[#262626] shrink-0">
                                        <div className="flex flex-col items-center gap-0.5">
                                          {!locked && !tbd && (
                                            <button onClick={() => handleUserPredictionChange(match.id, 'home', 'inc')} className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"><Plus className="w-3 h-3" /></button>
                                          )}
                                          <span className="text-base font-black w-5 text-center text-white">{pred.home}</span>
                                          {!locked && !tbd && (
                                            <button onClick={() => handleUserPredictionChange(match.id, 'home', 'dec')} className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"><Minus className="w-3 h-3" /></button>
                                          )}
                                        </div>
                                        <span className="text-neutral-600 font-bold text-sm px-0.5">×</span>
                                        <div className="flex flex-col items-center gap-0.5">
                                          {!locked && !tbd && (
                                            <button onClick={() => handleUserPredictionChange(match.id, 'away', 'inc')} className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"><Plus className="w-3 h-3" /></button>
                                          )}
                                          <span className="text-base font-black w-5 text-center text-white">{pred.away}</span>
                                          {!locked && !tbd && (
                                            <button onClick={() => handleUserPredictionChange(match.id, 'away', 'dec')} className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"><Minus className="w-3 h-3" /></button>
                                          )}
                                        </div>
                                      </div>

                                      {/* Away Team */}
                                      <div className="flex flex-col items-center gap-1 text-center overflow-hidden">
                                        <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                                        <span className="text-[11px] font-bold text-white leading-tight w-full" style={{overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical'}}>{translateTeam(match.away_team)}</span>
                                      </div>
                                    </div>

                                    {!locked && !tbd && (
                                      <p className="text-[9px] text-neutral-400 font-semibold text-center mt-2 leading-normal">
                                        Palpites até: <span className="text-[#FF7A00] font-bold">{getFormattedDeadline(match.kickoff_time)}</span>
                                      </p>
                                    )}
                                    {tbd && (
                                      <p className="text-[9px] text-[#FF7A00] font-bold text-center mt-2 leading-normal">Confronto a definir</p>
                                    )}
                                    {/* Tiebreaker selector — knockout + draw prediction */}
                                    {showTiebreaker && (
                                      <div className="mt-2 pt-2 border-t border-[#262626] space-y-1.5">
                                        <p className="text-[9px] font-bold text-[#FF7A00] uppercase tracking-wider text-center">
                                          🏆 Quem classifica? <span className="text-neutral-500 font-normal">(+5 pts bônus)</span>
                                        </p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                          <button
                                            onClick={() => handleTiebreakerPick(match.id, 'home')}
                                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-sm border text-[10px] font-bold transition-all active:scale-95 ${
                                              tiePick === 'home'
                                                ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                                : 'bg-[#1D1D1D] border-[#262626] text-neutral-400 hover:border-[#FF7A00]/50'
                                            }`}
                                          >
                                            <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                                            <span className="truncate max-w-[70px]">{translateTeam(match.home_team)}</span>
                                          </button>
                                          <button
                                            onClick={() => handleTiebreakerPick(match.id, 'away')}
                                            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-sm border text-[10px] font-bold transition-all active:scale-95 ${
                                              tiePick === 'away'
                                                ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                                : 'bg-[#1D1D1D] border-[#262626] text-neutral-400 hover:border-[#FF7A00]/50'
                                            }`}
                                          >
                                            <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                                            <span className="truncate max-w-[70px]">{translateTeam(match.away_team)}</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <button
                                      onClick={() => toggleGuessesExpansion(match.id)}
                                      className="w-full mt-2.5 py-1.5 bg-[#1D1D1D] hover:bg-[#262626] border border-[#262626] rounded-sm text-[9px] font-bold text-neutral-400 hover:text-white transition-all flex items-center justify-center gap-1 focus:outline-none"
                                    >
                                      <span>👥 Palpites do grupo</span>
                                      <span>{expandedGuesses[match.id] ? '▲' : '▼'}</span>
                                    </button>
                                    {expandedGuesses[match.id] && renderParticipantGuesses(match.id)}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </>
                  ) : (
                    <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center text-neutral-400 text-xs shadow-card">
                      Nenhum jogo disponível para palpites no momento.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Live Score Widget Embed */}
            <LiveScoreWidget />

            {/* Quick Link Footer */}
            {selectedPool && (
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => { setActiveTab('ranking'); setRankingTab('classificacao'); }}
                  className="w-full bg-[#151515] border border-[#262626] rounded-sm py-3 px-4 flex justify-between items-center text-xs font-bold text-neutral-300 hover:bg-[#1D1D1D] hover:text-[#FF7A00] transition-all"
                >
                  <span>VISUALIZAR RANKING COMPLETO</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => setActiveTab('boloes')}
                  className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-extrabold text-xs h-12 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(255,122,0,0.2)]"
                >
                  <span>EXPLORAR MEUS BOLÕES</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: BOLÕES (POOLS HUB) --- */}
        {activeTab === 'boloes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Meus Grupos</p>
                <h1 className="text-3xl font-bold tracking-tight mt-1">Bolões Ativos</h1>
              </div>
              {profile?.role !== 'user' && (
                <button
                  onClick={async () => {
                    const userRole = profile?.role || 'user';
                    if (userRole === 'user') {
                      triggerToast('Apenas usuários Premium ou Admin podem criar bolões.');
                      return;
                    }
                    if (userRole === 'premium') {
                      const { count } = await supabase
                        .from('pools')
                        .select('*', { count: 'exact', head: true })
                        .eq('owner_id', session.user.id);
                      if (count && count >= 1) {
                        triggerToast('Limite de 1 bolão atingido para contas Premium!');
                        return;
                      }
                    }
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-sm px-4 py-2 rounded-sm active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Criar
                </button>
              )}
            </div>

            {/* Join Pool Form (Always visible at the top of the tab for ease of access) */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-4 space-y-2">
              <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Entrar com Código de Convite</label>
              <form onSubmit={handleJoinPoolByCode} className="flex gap-2">
                <input 
                  type="text" 
                  maxLength="8"
                  required
                  placeholder="Ex: XF92A7B8"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors uppercase"
                />
                <button
                  type="submit"
                  className="bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-xs px-4 py-2.5 rounded-sm active:scale-95 transition-all"
                >
                  Entrar
                </button>
              </form>
            </div>

            {pools.length > 0 ? (
              <div className="space-y-4">
                {pools.map(pool => (
                  <div 
                    key={pool.id} 
                    onClick={() => { setSelectedPool(pool); setActiveTab('inicio'); triggerToast(`Bolão "${pool.name}" carregado!`); }}
                    className={`bg-[#151515] border rounded-md p-4 shadow-card hover:border-neutral-700 transition-all cursor-pointer ${selectedPool?.id === pool.id ? 'border-[#FF7A00]' : 'border-[#262626]'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{pool.name}</h3>
                        <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                          <span className="bg-[#1D1D1D] text-neutral-300 px-2 py-0.5 rounded-sm font-bold uppercase">Rodada 1/6</span>
                          <span className="flex items-center gap-1 font-semibold text-neutral-500">
                            <Coins className="w-3.5 h-3.5 text-[#F1C40F]" /> {pool.entry_fee > 0 ? `R$ ${pool.entry_fee}` : 'Grátis'}
                          </span>
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5 bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded px-2 py-1.5 w-fit shadow-[0_0_10px_rgba(255,122,0,0.15)]">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Prêmio Total:</span>
                          <span className="text-sm font-black text-[#FF7A00] drop-shadow-[0_0_8px_rgba(255,122,0,0.4)]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pool.entry_fee * (pool.participant_count || 1))}
                          </span>
                        </div>
                      </div>
                      <Trophy className={`w-5 h-5 ${selectedPool?.id === pool.id ? 'text-[#FF7A00]' : 'text-neutral-500'}`} />
                    </div>

                    <div className="flex items-center justify-between border-t border-[#262626] pt-3 mt-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 text-xs text-neutral-400 font-semibold">
                        <Users className="w-4 h-4 text-neutral-500" />
                        <span>Código de Convite: <strong className="text-white">{pool.invite_code}</strong></span>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedPool(pool);
                            setIsPoolMembersModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#FF7A00] hover:text-[#FF8C1A] bg-[#FF7A00]/10 px-2.5 py-1 rounded-sm border border-[#FF7A00]/20"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>PARTICIPANTES</span>
                        </button>

                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(pool.invite_code);
                            triggerToast('Código copiado para a área de transferência!');
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#FF7A00] hover:text-[#FF8C1A] bg-[#FF7A00]/10 px-2.5 py-1 rounded-sm border border-[#FF7A00]/20"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>COPIAR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center shadow-card space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#1D1D1D] flex items-center justify-center mx-auto border border-[#262626]">
                  <Trophy className="w-7 h-7 text-neutral-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">Nenhum Bolão Encontrado</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    {profile?.role === 'user' 
                      ? 'Você ainda não participa de nenhuma liga. Entre em uma liga utilizando um código de convite acima!' 
                      : 'Você ainda não participa de nenhuma liga. Crie seu primeiro bolão ou entre em um existente!'}
                  </p>
                </div>
                {profile?.role !== 'user' && (
                  <button 
                    onClick={async () => {
                      const userRole = profile?.role || 'user';
                      if (userRole === 'user') {
                        triggerToast('Apenas usuários Premium ou Admin podem criar bolões.');
                        return;
                      }
                      setIsCreateModalOpen(true);
                    }}
                    className="w-full max-w-xs bg-[#FF7A00] text-black font-bold text-sm h-[52px] rounded-sm hover:bg-[#FF8C1A] active:scale-95 transition-all mt-2 mx-auto block"
                  >
                    Criar Meu Primeiro Bolão
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 3: RANKING & SIMULATOR --- */}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Classificação Geral</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">{selectedPool ? selectedPool.name : 'Leaderboard'}</h1>
            </div>

            {/* Pool Selector Dropdown */}
            {pools.length > 0 && (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-3">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1.5">Selecionar Bolão</label>
                <select
                  value={selectedPool?.id || ''}
                  onChange={(e) => {
                    const found = pools.find(p => p.id === e.target.value);
                    if (found) setSelectedPool(found);
                  }}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedPool ? (
              <>
                {/* Custom Tab Switcher */}
                <div className="flex bg-[#151515] p-1 rounded-sm border border-[#262626]">
                  <button 
                    onClick={() => setRankingTab('classificacao')}
                    className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${rankingTab === 'classificacao' ? 'bg-[#262626] text-[#FF7A00]' : 'text-neutral-400 hover:text-white'}`}
                  >
                    Classificação Atual
                  </button>
                  <button 
                    onClick={() => setRankingTab('simulador')}
                    className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all flex items-center justify-center gap-1 ${rankingTab === 'simulador' ? 'bg-[#262626] text-[#FF7A00]' : 'text-neutral-400 hover:text-white'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Simulador de Ranking</span>
                  </button>
                </div>

                {/* TAB 1: Classificação Atual */}
                {rankingTab === 'classificacao' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 font-bold px-2 uppercase tracking-wider">
                      <span>Posição & Participante</span>
                      <span>Pontos</span>
                    </div>

                    <div className="space-y-2">
                      {standings.map((p, idx) => {
                        const isFirst = idx === 0;
                        const tierColors = {
                          'Diamante': 'bg-[#64D2FF]/10 text-[#64D2FF] border-[#64D2FF]/20',
                          'Ouro': 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20',
                          'Prata': 'bg-[#C0C0C0]/10 text-[#C0C0C0] border-[#C0C0C0]/20',
                          'Bronze': 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20',
                        };

                        return (
                          <div 
                            key={p.id} 
                            className={`bg-[#151515] border rounded-md p-3.5 flex items-center justify-between transition-all ${
                              isFirst 
                                ? 'border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.2)] bg-[#1A130C] border-l-4 border-l-[#FF7A00]' 
                                : 'border-[#262626] hover:border-neutral-800'
                            } ${p.isUser && !isFirst ? 'ring-1 ring-[#FF7A00]/30' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-5 text-center font-bold text-sm ${isFirst ? 'text-[#FF7A00]' : 'text-neutral-500'}`}>
                                {idx + 1}º
                              </span>
                              
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold ${p.isUser ? 'text-[#FF7A00]' : 'text-white'}`}>
                                    {p.name} {p.isUser && '👤'}
                                  </span>
                                  <UserRoleBadge role={p.role} />
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${tierColors[p.tier] || tierColors['Bronze']}`}>
                                    {p.tier}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-base font-black text-white">{p.points}</span>
                              <span className="text-[10px] text-neutral-500 block font-semibold">pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: Simulador de Ranking */}
                {rankingTab === 'simulador' && (
                  <div className="space-y-4">
                    <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-md p-3.5 flex gap-2.5 items-start">
                      <AlertCircle className="w-5 h-5 text-[#FF7A00] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold text-[#FF7A00]">Simulador de Resultados Ativo</p>
                        <p className="text-neutral-400 mt-1 leading-relaxed">
                          Altere o placar final projetado dos jogos abaixo para recalcular instantaneamente as pontuações e ver quem assumiria o topo da tabela!
                        </p>
                      </div>
                    </div>

                    {/* Simulated Matches List */}
                    <div className="space-y-3">
                      {matches.filter(m => !m.is_finished && dayjs(m.kickoff_time).year() === 2026 && (dayjs(m.kickoff_time).month() >= 4 && dayjs(m.kickoff_time).month() <= 6)).map(match => {
                        const sim = simulatedScores[match.id] || { home: 0, away: 0 };
                        
                        return (
                          <div key={match.id} className="bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card hover:border-neutral-800 transition-all">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold bg-[#1D1D1D] px-2 py-0.5 rounded-pill text-neutral-400 uppercase">
                                {PHASE_MAP[match.phase]?.label || match.phase}
                              </span>
                              <span className="text-[9px] font-bold text-[#FF7A00] bg-[#FF7A00]/10 px-2 py-0.5 rounded-sm border border-[#FF7A00]/20">
                                Multiplicador: {PHASE_MAP[match.phase]?.mult || 1}x
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Home Team */}
                              <div className="flex flex-col items-center gap-1.5 w-24 text-center">
                                <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                                <span className="text-xs font-bold text-white truncate max-w-full mt-1">{translateTeam(match.home_team)}</span>
                              </div>

                              {/* Simulation Controls */}
                              <div className="flex items-center gap-2 bg-[#1D1D1D] px-3 py-1.5 rounded-md border border-[#262626]">
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handleSimulatedScoreChange(match.id, 'home', 'dec')}
                                    className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-lg font-bold w-4 text-center text-white">{sim.home}</span>
                                  <button 
                                    onClick={() => handleSimulatedScoreChange(match.id, 'home', 'inc')}
                                    className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <span className="text-neutral-600 font-bold px-1">x</span>

                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => handleSimulatedScoreChange(match.id, 'away', 'dec')}
                                    className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="text-lg font-bold w-4 text-center text-white">{sim.away}</span>
                                  <button 
                                    onClick={() => handleSimulatedScoreChange(match.id, 'away', 'inc')}
                                    className="w-5 h-5 rounded-sm bg-[#262626] hover:bg-[#333] flex items-center justify-center text-neutral-400 active:bg-[#FF7A00] active:text-black transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Away Team */}
                              <div className="flex flex-col items-center gap-1.5 w-24 text-center">
                                <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                                <span className="text-xs font-bold text-white truncate max-w-full mt-1">{translateTeam(match.away_team)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {matches.filter(m => !m.is_finished && dayjs(m.kickoff_time).year() === 2026 && (dayjs(m.kickoff_time).month() >= 4 && dayjs(m.kickoff_time).month() <= 6)).length === 0 && (
                        <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center text-neutral-400 text-xs">
                          Não há jogos futuros disponíveis para simulação.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center shadow-card">
                <p className="text-sm text-neutral-400">Por favor, crie ou entre em um bolão para ver a classificação.</p>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 4: CONVITES (INVITATIONS) --- */}
        {activeTab === 'convites' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Central de Acesso</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">Convites</h1>
            </div>

            {/* Pending approvals section for Premium/Admin users */}
            {(profile?.role === 'premium' || profile?.role === 'admin') && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Solicitações de Entrada</h2>
                
                {pendingApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {pendingApprovals.map((req) => (
                      <div key={`${req.pool_id}-${req.user_id}`} className="bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card flex flex-col justify-between hover:border-neutral-800 transition-all">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Aprovação Necessária</span>
                            <span className="text-[10px] text-neutral-500">
                              {req.joined_at ? new Date(req.joined_at).toLocaleDateString('pt-BR') : ''}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white mt-1.5">{req.profiles?.full_name || 'Jogador'}</h4>
                          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-[#FF7A00]" /> Quer entrar no bolão: <span className="font-bold text-white">{req.pools?.name}</span>
                          </p>
                        </div>

                        <div className="flex gap-2.5 mt-4 pt-3 border-t border-[#1D1D1D]">
                          <button
                            onClick={() => handleRejectMember(req.pool_id, req.user_id)}
                            className="flex-1 bg-[#262626] hover:bg-neutral-800 text-neutral-300 font-bold text-xs py-2.5 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" /> RECUSAR
                          </button>
                          <button
                            onClick={() => handleApproveMember(req.pool_id, req.user_id)}
                            className="flex-1 bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-xs py-2.5 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> APROVAR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center shadow-card text-xs text-neutral-400">
                    <UserCheck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    Nenhuma solicitação de entrada pendente no momento.
                  </div>
                )}
              </div>
            )}

            {profile?.role === 'user' && (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center shadow-card space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1D1D1D] flex items-center justify-center mx-auto border border-[#262626]">
                  <Bell className="w-5 h-5 text-neutral-600" />
                </div>
                <h3 className="text-sm font-bold text-white">Nenhum novo convite pendente</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Todos os convites de entrada que você solicita a outros bolões aguardam a liberação por um membro Premium ou Admin desse grupo.
                </p>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 5: PERFIL & CONFIGURAÇÕES --- */}
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Área do Usuário</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">Seu Perfil</h1>
            </div>

            {/* Profile Intro Card */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <label className="relative cursor-pointer group w-14 h-14 shrink-0 block">
                  <div className="w-14 h-14 rounded-lg bg-[#FF7A00] flex items-center justify-center text-xl font-bold text-black shadow-premium overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (profile?.full_name || 'J').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-white text-center">
                    Alterar
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                    className="hidden" 
                  />
                </label>
                <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{profile?.full_name || 'Participante'}</h3>
                      <UserRoleBadge role={profile?.role} />
                    </div>
                    <p className="text-xs text-[#FF7A00] font-semibold mt-0.5">
                      <span>{session?.user?.email}</span>
                    </p>
                </div>
              </div>
              
              <button 
                onClick={handleSignOut}
                className="bg-[#262626] hover:bg-neutral-800 text-neutral-400 hover:text-white p-2.5 rounded-sm transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <LogOut className="w-4 h-4 text-dangerColor" /> Sair
              </button>
            </div>

            {/* Statistical Cards Grid (3 columns) */}
            <div>
              <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider mb-3">Sua Performance Global</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#151515] border border-[#262626] rounded-md p-3.5 text-center shadow-card">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Bolões</span>
                  <span className="text-lg font-black text-white block mt-1">{pools.length}</span>
                </div>
                <div className="bg-[#151515] border border-[#262626] rounded-md p-3.5 text-center shadow-card">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Palpites</span>
                  <span className="text-lg font-black text-white block mt-1">{Object.keys(userPredictions).length}</span>
                </div>
                <div className="bg-[#151515] border border-[#262626] rounded-md p-3.5 text-center shadow-card">
                  <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">Grupo</span>
                  <span className="text-xs font-bold text-[#FF7A00] block mt-2 truncate">
                    {selectedPool ? selectedPool.name : 'Nenhum'}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Form */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-4 space-y-4">
              <h3 className="text-xs font-semibold uppercase text-neutral-400 tracking-wider">Editar Perfil</h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nome de Usuário</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Seu nome"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Foto de Perfil (Quadrada)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#FF7A00] flex items-center justify-center text-lg font-bold text-black overflow-hidden shrink-0 border border-[#262626]">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        (profile?.full_name || 'J').charAt(0).toUpperCase()
                      )}
                    </div>
                    <label className="flex-1 bg-[#1D1D1D] hover:bg-neutral-800 border border-[#262626] text-neutral-300 text-xs font-bold py-2.5 px-4 rounded-sm cursor-pointer text-center transition-all active:scale-95">
                      <span>Escolher Imagem</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                  <p className="text-[10px] text-neutral-500 font-semibold">Para alterar a senha, preencha os campos abaixo:</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Senha Atual</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                  />
                </div>

                {profileErrorMsg && (
                  <p className="text-xs text-dangerColor flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{profileErrorMsg}</span>
                  </p>
                )}

                {profileSuccessMsg && (
                  <p className="text-xs text-successColor flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>{profileSuccessMsg}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-xs py-2.5 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{profileLoading ? 'Salvando...' : 'SALVAR ALTERAÇÕES'}
                  </span>
                </button>
              </form>
            </div>

            {/* PWA / App Installation Controls */}
            {!isPwa && (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#FF7A00]" />
                  <h4 className="text-sm font-bold text-white">Instalar Aplicativo PWA</h4>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Instale nosso aplicativo diretamente no seu celular para receber lembretes e alertas em tempo real.
                </p>

                {/* Show iOS installation guidelines if iOS platform detected */}
                {/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream ? (
                  <div className="space-y-3">
                    <div className="bg-[#FF7A00]/10 border border-[#FF7A00]/20 rounded-md p-3 text-xs text-[#FF7A00] space-y-1">
                      <p className="font-bold">Como instalar no iPhone (iOS):</p>
                      <p className="text-neutral-400 mt-1 leading-normal">
                        1. Abra esta página no navegador **Safari**.<br/>
                        2. Toque no botão de **Compartilhar** (ícone quadrado com uma seta para cima).<br/>
                        3. Role a lista e selecione **"Adicionar à Tela de Início"**.<br/>
                        4. Toque em **Adicionar** no canto superior direito.
                      </p>
                    </div>
                    <button 
                      onClick={handleIosShare}
                      className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-xs py-2.5 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5 text-black" />
                      <span>Compartilhar e Instalar no iOS 📱</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handlePwaInstallClick}
                    className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-xs py-2.5 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-black" />
                    <span>Instalar Aplicativo 🚀</span>
                  </button>
                )}
              </div>
            )}

            {/* SaaS Toggle Section */}
            <div className="bg-[#151515] border border-[#262626] rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[280px]">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Notificações Push</span>
                    {!isPwa && <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-normal">
                    {isPwa 
                      ? 'Lembrete Push: Faltam 30 minutos para o jogo e você não deu seu palpite!'
                      : 'Disponível apenas instalando e abrindo o aplicativo em modo PWA.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (!isPwa) {
                      triggerToast('Notificações de push estão disponíveis apenas no aplicativo PWA instalado!');
                      return;
                    }
                    setPushReminder(!pushReminder);
                  }}
                  disabled={!isPwa}
                  className={`w-11 h-6 rounded-pill transition-colors relative focus:outline-none flex items-center ${isPwa && pushReminder ? 'bg-[#FF7A00]' : 'bg-[#262626] opacity-50 cursor-not-allowed'}`}
                >
                <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isPwa && pushReminder ? 'translate-x-[22px]' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

            {/* Admin Panel: Set advance_team for knockout matches */}
            {profile?.role === 'admin' && (
              <div className="bg-[#151515] border border-[#FF7A00]/30 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FF7A00]" />
                  <h4 className="text-sm font-bold text-white">Admin — Classificado em Empate</h4>
                </div>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  Defina qual time avançou em jogos de fase eliminatória que terminaram empatados (após prorrogação + pênaltis).
                </p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {matches
                    .filter(m => m.phase !== 'groups' && m.is_finished && m.home_score === m.away_score)
                    .map(match => (
                      <div key={match.id} className="bg-[#1D1D1D] border border-[#262626] rounded-sm p-3 space-y-2">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase">
                          {PHASE_MAP[match.phase]?.label} — {translateTeam(match.home_team)} {match.home_score}×{match.away_score} {translateTeam(match.away_team)}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleSetAdvanceTeam(match.id, 'home')}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-sm border text-[10px] font-bold transition-all ${
                              match.advance_team === 'home'
                                ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                : 'bg-[#262626] border-[#333] text-neutral-400'
                            }`}
                          >
                            <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                            <span>{translateTeam(match.home_team)}</span>
                          </button>
                          <button
                            onClick={() => handleSetAdvanceTeam(match.id, 'away')}
                            className={`flex items-center justify-center gap-1 py-1.5 rounded-sm border text-[10px] font-bold transition-all ${
                              match.advance_team === 'away'
                                ? 'bg-[#FF7A00] border-[#FF7A00] text-black'
                                : 'bg-[#262626] border-[#333] text-neutral-400'
                            }`}
                          >
                            <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                            <span>{translateTeam(match.away_team)}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  {matches.filter(m => m.phase !== 'groups' && m.is_finished && m.home_score === m.away_score).length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-3">Nenhum jogo eliminatório empatado finalizado ainda.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 6: HISTÓRICO DE PALPITES --- */}
        {activeTab === 'historico' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-neutral-400 font-semibold tracking-wider uppercase">Seu Desempenho</p>
              <h1 className="text-3xl font-bold tracking-tight mt-1">Histórico de Palpites</h1>
            </div>

            {/* Pool Selector Dropdown */}
            {pools.length > 0 && (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-3">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1.5">Selecionar Bolão</label>
                <select
                  value={selectedPool?.id || ''}
                  onChange={(e) => {
                    const found = pools.find(p => p.id === e.target.value);
                    if (found) setSelectedPool(found);
                  }}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  {pools.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedPool ? (
              historyLoading ? (
                <div className="text-center py-8 text-neutral-400 text-sm">Carregando histórico...</div>
              ) : historyGuesses.length > 0 ? (
                <div className="space-y-3">
                  {historyGuesses.map((guess) => {
                    const match = guess.matches;
                    if (!match) return null;
                    
                    const pts = guess.points_earned ?? 0;
                    let badgeBg = 'bg-neutral-800 text-neutral-400 border-neutral-700';
                    let badgeText = '0 pts';
                    if (pts >= 25) {
                      badgeBg = 'bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20';
                      badgeText = `+${pts} pts`;
                    } else if (pts === 10) {
                      badgeBg = 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
                      badgeText = `+${pts} pts`;
                    } else if (pts > 0) {
                      badgeBg = 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
                      badgeText = `+${pts} pts`;
                    }

                    return (
                      <div 
                        key={guess.id} 
                        className="bg-[#151515] border border-[#262626] rounded-md p-4 shadow-card flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold bg-[#1D1D1D] px-2 py-0.5 rounded-sm text-neutral-400 uppercase">
                              {PHASE_MAP[match.phase]?.label || match.phase}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 w-[110px] justify-end text-right">
                              <span className="text-xs font-bold text-white truncate">{translateTeam(match.home_team)}</span>
                              <ImageWithFallback src={match.home_team_crest} alt={match.home_team} />
                            </div>

                            <div className="flex flex-col items-center justify-center min-w-[60px]">
                              <div className="text-sm font-black text-[#FF7A00] flex items-center gap-1" title="Seu Palpite">
                                <span>{guess.home_guess}</span>
                                <span className="text-neutral-600 text-xs font-normal">x</span>
                                <span>{guess.away_guess}</span>
                              </div>
                              
                              <div className="text-[10px] text-neutral-500 font-semibold mt-0.5 flex items-center gap-1" title="Placar Oficial">
                                <span>({match.home_score}</span>
                                <span>x</span>
                                <span>{match.away_score})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-[110px] justify-start text-left">
                              <ImageWithFallback src={match.away_team_crest} alt={match.away_team} />
                              <span className="text-xs font-bold text-white truncate">{translateTeam(match.away_team)}</span>
                            </div>
                          </div>
                        </div>

                        <div className={`shrink-0 border px-2.5 py-1.5 rounded-sm font-bold text-xs ${badgeBg}`}>
                          {badgeText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center text-neutral-400 text-xs shadow-card">
                  Nenhum palpite finalizado para este bolão.
                </div>
              )
            ) : (
              <div className="bg-[#151515] border border-[#262626] rounded-md p-8 text-center shadow-card">
                <p className="text-sm text-neutral-400">Por favor, crie ou entre em um bolão para ver o histórico.</p>
              </div>
            )}
          </div>
        )}
      </>
    )}
  </main>

      {/* --- CREATE POOL MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#262626] rounded-md w-full max-w-sm p-6 space-y-5 animate-fade-in shadow-2xl relative">
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Criar Novo Bolão</h2>
              <p className="text-xs text-neutral-400 mt-1">Defina o nome da sua liga e a taxa de entrada.</p>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nome do Bolão</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Bolão dos Amigos do Futebol"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Taxa de Entrada (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="Ex: 20.00 (deixe vazio para Grátis)"
                  value={newPoolFee}
                  onChange={(e) => setNewPoolFee(e.target.value)}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm px-3.5 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF7A00] transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-sm h-12 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>CRIAR BOLÃO</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POOL MEMBERS DETAILS MODAL --- */}
      {isPoolMembersModalOpen && selectedPool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#262626] rounded-md w-full max-w-sm p-6 space-y-5 animate-fade-in shadow-2xl relative">
            <button 
              onClick={() => { setIsPoolMembersModalOpen(false); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Participantes do Bolão</h2>
               <p className="text-xs text-neutral-400 mt-1">Membros do grupo <strong className="text-[#FF7A00]">{selectedPool.name}</strong></p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {poolMembers.map((member) => {
                const mProfile = member.profiles;
                if (!mProfile) return null;
                
                const isOwner = selectedPool.owner_id === mProfile.id;
                const targetRole = mProfile.role || 'user';
                const currentUserRole = profile?.role || 'user';
                const isCurrentUserOwner = selectedPool.owner_id === session.user.id;
                
                // Can manage logic
                const canManage = isCurrentUserOwner || currentUserRole === 'admin' || currentUserRole === 'premium';
                const isTargetAdmin = targetRole === 'admin';
                const isPremiumLogged = currentUserRole === 'premium';
                const isSelf = mProfile.id === session.user.id;
                const isButtonDisabled = (isPremiumLogged && isTargetAdmin) || isSelf;

                return (
                  <div key={mProfile.id} className="flex items-center justify-between bg-[#1D1D1D] p-2.5 rounded-sm border border-[#262626] text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-8 h-8 rounded bg-[#FF7A00] flex items-center justify-center font-bold text-black text-xs overflow-hidden shrink-0">
                        {mProfile.avatar_url ? (
                          <img src={mProfile.avatar_url} alt="Membro" className="w-full h-full object-cover" />
                        ) : (
                          mProfile.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white truncate">{mProfile.full_name}</span>
                          {isOwner && <span className="text-[8px] bg-[#FF7A00]/20 text-[#FF7A00] px-1.5 py-0.5 rounded-sm uppercase font-bold">Criador</span>}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <UserRoleBadge role={targetRole} />
                        </div>
                      </div>
                    </div>
                    
                    {canManage && (
                      <button
                        onClick={() => {
                          setTargetUserToManage(mProfile);
                          setNewRoleSelected(targetRole);
                          setIsManageModalOpen(true);
                        }}
                        disabled={isButtonDisabled}
                        className={`px-2.5 py-1 rounded-sm font-bold text-[10px] active:scale-95 transition-all border ${
                          isButtonDisabled 
                            ? 'bg-[#151515] border-[#262626] text-neutral-600 cursor-not-allowed' 
                            : 'bg-[#262626] hover:bg-neutral-800 border-[#333] hover:text-[#FF7A00] text-neutral-300'
                        }`}
                      >
                        Gerenciar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsPoolMembersModalOpen(false)}
                className="w-full bg-[#262626] hover:bg-neutral-800 text-white font-bold text-sm h-11 rounded-sm active:scale-95 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MANAGE USER ROLE MODAL --- */}
      {isManageModalOpen && targetUserToManage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#262626] rounded-md w-full max-w-sm p-6 space-y-5 animate-fade-in shadow-2xl relative">
            <button 
              onClick={() => { setIsManageModalOpen(false); setTargetUserToManage(null); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white">Gerenciar Usuário</h2>
              <p className="text-xs text-neutral-400 mt-1">Altere a função de <strong className="text-white">{targetUserToManage.full_name}</strong> no sistema.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Nova Função</label>
                <select
                  value={newRoleSelected}
                  onChange={(e) => setNewRoleSelected(e.target.value)}
                  className="w-full bg-[#1D1D1D] border border-[#262626] rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="user">User (Participante Padrão)</option>
                  <option value="premium">Premium (Moderador)</option>
                  {/* Admin option is only available if current logged user is admin */}
                  {profile?.role === 'admin' && (
                    <option value="admin">Admin (Administrador Geral)</option>
                  )}
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={async () => {
                    try {
                      const { error } = await supabase
                        .from('profiles')
                        .update({ role: newRoleSelected })
                        .eq('id', targetUserToManage.id);
                        
                      if (error) throw error;
                      
                      triggerToast(`Função de ${targetUserToManage.full_name} alterada para ${newRoleSelected}!`);
                      
                      // Update local pool members list
                      setPoolMembers(prev => prev.map(m => {
                        if (m.profiles?.id === targetUserToManage.id) {
                          return {
                            ...m,
                            profiles: { ...m.profiles, role: newRoleSelected }
                          };
                        }
                        return m;
                      }));

                      // If target user is the logged user, update global profile state
                      if (targetUserToManage.id === session.user.id) {
                        setProfile(prev => ({ ...prev, role: newRoleSelected }));
                      }
                      
                      setIsManageModalOpen(false);
                      setTargetUserToManage(null);
                    } catch (err) {
                      console.error(err);
                      triggerToast('Erro ao atualizar função');
                    }
                  }}
                  className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-sm h-12 rounded-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>SALVAR ALTERAÇÕES</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RULES EXPLANATION MODAL --- */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#151515] border border-[#262626] rounded-md w-full max-w-sm p-6 space-y-5 animate-fade-in shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setIsRulesModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#FF7A00]" />
                <span>Regras de Pontuação</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">Como seus pontos são calculados em cada partida.</p>
            </div>

            <div className="space-y-4">
              {/* Points Table */}
              <div className="border border-[#262626] rounded-md overflow-hidden bg-[#0D0D0D]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#262626] bg-[#151515] text-neutral-400 font-bold">
                      <th className="p-2.5">Acerto</th>
                      <th className="p-2.5 text-right">Pontos Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#262626] text-neutral-300">
                    <tr>
                      <td className="p-2.5">
                        <p className="font-bold text-white">Placar Exato</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Ex: palpitou 2×1 → saiu 2×1 ✅</p>
                      </td>
                      <td className="p-2.5 text-right text-[#2ECC71] font-black text-base align-top">25 pts</td>
                    </tr>
                    <tr>
                      <td className="p-2.5">
                        <p className="font-bold text-white">Resultado Certo (placar errado)</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Acertou quem vence <span className="italic">ou</span> que seria empate, mesmo errando o placar.</p>
                        <div className="mt-1.5 space-y-0.5">
                          <p className="text-[10px] text-neutral-400">Ex1: palpitou <span className="text-white font-bold">2×2</span> → saiu <span className="text-white font-bold">1×1</span> → acertou empate ✅ = 10 pts</p>
                          <p className="text-[10px] text-neutral-400">Ex2: palpitou <span className="text-white font-bold">1×0</span> → saiu <span className="text-white font-bold">3×1</span> → acertou vencedor ✅ = 10 pts</p>
                        </div>
                      </td>
                      <td className="p-2.5 text-right text-[#3B82F6] font-black text-base align-top">10 pts</td>
                    </tr>
                    <tr className="bg-[#FF7A00]/5">
                      <td className="p-2.5">
                        <p className="font-bold text-[#FF7A00]">Bônus — Classificado em Empate</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Apenas em fases eliminatórias (16-avos em diante).</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">Se você palpitar empate <span className="font-bold">e</span> o jogo terminar empatado, escolha quem classifica. Acertou? +5 pts de bônus!</p>
                        <p className="text-[10px] text-neutral-400 mt-1 italic">Conta o placar final da prorrogação. Se for para pênaltis, o placar registrado é o do final da prorrogação (empate).</p>
                      </td>
                      <td className="p-2.5 text-right text-[#FF7A00] font-black text-base align-top">+5 pts</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Multipliers List */}
              <div className="space-y-2">
                <h4 className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Multiplicadores por Fase</h4>
                <p className="text-[10px] text-neutral-500">Todos os pontos (base + bônus) são multiplicados pela fase da partida.</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">1ª Fase:</span>
                    <strong className="text-white">1x</strong>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">16-avos:</span>
                    <strong className="text-white">2x</strong>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">Oitavas:</span>
                    <strong className="text-white">3x</strong>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">Quartas:</span>
                    <strong className="text-white">4x</strong>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">Semifinal:</span>
                    <strong className="text-white">6x</strong>
                  </div>
                  <div className="bg-[#181818] p-2 rounded-sm border border-[#262626] flex justify-between">
                    <span className="text-neutral-400">Final:</span>
                    <strong className="text-white">10x</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsRulesModalOpen(false)}
                className="w-full bg-[#FF7A00] hover:bg-[#FF8C1A] text-black font-bold text-sm h-11 rounded-sm active:scale-95 transition-all flex items-center justify-center"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PERSISTENT BOTTOM NAVIGATION (Height: 72px) --- */}
      <nav className="fixed bottom-0 max-w-md w-full h-[72px] bg-[#151515] border-t border-[#262626] flex items-center justify-between px-3 z-40">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'inicio' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Início</span>
        </button>

        <button 
          onClick={() => setActiveTab('boloes')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'boloes' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-bold">Bolões</span>
        </button>

        <button 
          onClick={() => setActiveTab('ranking')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'ranking' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-bold">Ranking</span>
        </button>

        <button 
          onClick={() => setActiveTab('historico')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'historico' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-bold">Histórico</span>
        </button>

        <button 
          onClick={() => setActiveTab('convites')}
          className={`flex flex-col items-center gap-1 transition-colors relative ${activeTab === 'convites' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-bold">Convites</span>
        </button>

        <button 
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'perfil' ? 'text-[#FF7A00]' : 'text-neutral-500 hover:text-white'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>

    </div>
  );
}
