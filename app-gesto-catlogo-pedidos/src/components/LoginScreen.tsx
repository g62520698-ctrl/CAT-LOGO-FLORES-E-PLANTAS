import { useState, useEffect } from 'react';
import { User } from '../types';
import { Eye, EyeOff, Flower2, Leaf, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { FIREBASE_ENABLED } from '../firebase/config';

interface Props {
  users: User[];
  onLogin: (user: User, keepLoggedIn: boolean) => void;
  firebaseStatus: 'offline' | 'online' | 'syncing';
}

const petals = ['🌸', '🌺', '🌼', '🌻', '🌹', '🌷', '🍃', '🌿'];

export default function LoginScreen({ users, onLogin, firebaseStatus }: Props) {
  const [login, setLogin]               = useState('');
  const [senha, setSenha]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => {
    try { return JSON.parse(localStorage.getItem('catalog_keep_logged') ?? 'false'); }
    catch { return false; }
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [floatingPetals, setFloatingPetals] = useState<
    { id: number; emoji: string; left: number; delay: number; duration: number; size: number }[]
  >([]);

  // Generate floating petals once
  useEffect(() => {
    const p = Array.from({ length: 16 }, (_, i) => ({
      id:       i,
      emoji:    petals[i % petals.length],
      left:     Math.random() * 100,
      delay:    Math.random() * 8,
      duration: 7 + Math.random() * 7,
      size:     0.9 + Math.random() * 0.9,
    }));
    setFloatingPetals(p);
  }, []);

  const handleLogin = async () => {
    if (!login.trim() || !senha.trim()) {
      setError('Preencha todos os campos');
      return;
    }
    setLoading(true);
    setError('');

    // Small UX delay for visual feedback
    await new Promise(r => setTimeout(r, 350));

    const trimmedLogin = login.trim().toLowerCase();

    // Try against current users list (may already be loaded from Firebase)
    let user = users.find(
      u => u.login.toLowerCase() === trimmedLogin && u.senha === senha
    );

    // If not found and Firebase is syncing, try localStorage fallback
    if (!user && firebaseStatus === 'syncing') {
      try {
        const cached = JSON.parse(localStorage.getItem('catalog_users') ?? '[]') as unknown[];
        const cachedUser = cached.find((u: unknown) => {
          if (!u || typeof u !== 'object') return false;
          const x = u as Record<string, unknown>;
          return (
            typeof x.login === 'string' &&
            x.login.toLowerCase() === trimmedLogin &&
            x.senha === senha
          );
        });
        if (cachedUser && typeof cachedUser === 'object') {
          user = cachedUser as unknown as typeof user;
        }
      } catch { /* ignore */ }
    }

    if (user) {
      onLogin(user, keepLoggedIn);
    } else {
      if (firebaseStatus === 'syncing') {
        setError('Aguarde — sincronizando dados do servidor...');
      } else {
        setError('Login ou senha incorretos');
      }
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  // Firebase status pill
  const fbPill = () => {
    if (!FIREBASE_ENABLED) return null;
    const cfg = {
      online:  { bg: 'bg-emerald-500/20 border-emerald-400/40', dot: 'bg-emerald-400 animate-pulse', text: 'text-emerald-200', label: 'Online', Icon: Wifi },
      syncing: { bg: 'bg-blue-500/20 border-blue-400/40',       dot: 'bg-blue-400',                  text: 'text-blue-200',    label: 'Sincronizando', Icon: Loader2 },
      offline: { bg: 'bg-gray-500/20 border-gray-400/30',       dot: 'bg-gray-400',                  text: 'text-gray-300',    label: 'Offline', Icon: WifiOff },
    }[firebaseStatus];

    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${firebaseStatus === 'syncing' ? 'animate-spin' : ''}`} />
        <cfg.Icon className={`w-3 h-3 ${firebaseStatus === 'syncing' ? 'animate-spin' : ''}`} />
        Firebase {cfg.label}
      </div>
    );
  };

  return (
    <div className="relative min-h-full flex flex-col overflow-hidden login-bg">
      {/* Floating petals */}
      {floatingPetals.map(p => (
        <span
          key={p.id}
          className="petal select-none pointer-events-none"
          style={{
            left:              `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay:    `${p.delay}s`,
            fontSize:          `${p.size}rem`,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-10">
        <div className="animate-login-float w-full max-w-sm">

          {/* ── Logo cluster ─────────────────────────────────────────── */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative">
              {/* Main icon */}
              <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/30">
                <span className="text-6xl animate-float">🌸</span>
              </div>
              {/* Leaf badge */}
              <div className="absolute -top-2 -right-2 w-9 h-9 rounded-2xl bg-emerald-400/90 flex items-center justify-center shadow-lg border border-white/20">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              {/* Flower badge */}
              <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-2xl bg-pink-400/90 flex items-center justify-center shadow-lg border border-white/20">
                <Flower2 className="w-4 h-4 text-white" />
              </div>
              {/* Firebase status dot */}
              {FIREBASE_ENABLED && (
                <div className={`absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white/50 shadow ${
                  firebaseStatus === 'online'  ? 'bg-emerald-400 animate-pulse' :
                  firebaseStatus === 'syncing' ? 'bg-blue-400' :
                  'bg-gray-400'
                }`} title={`Firebase ${firebaseStatus}`} />
              )}
            </div>
          </div>

          {/* ── App name ──────────────────────────────────────────────── */}
          <div className="text-center mb-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-lg">
              Catálogo de Flores
            </h1>
            <h1 className="text-3xl font-extrabold text-emerald-300 tracking-tight drop-shadow-lg">
              e Plantas
            </h1>
          </div>

          {/* ── Welcome message ───────────────────────────────────────── */}
          <div className="text-center mb-6 mt-3">
            <div className="inline-flex flex-col items-center gap-1 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/20">
              <p className="text-white font-semibold text-sm">
                👋 Bem-vindo de volta!
              </p>
              <p className="text-white/70 text-xs">
                Gerencie seu catálogo com facilidade
              </p>
            </div>
          </div>

          {/* Firebase pill */}
          <div className="flex justify-center mb-4">
            {fbPill()}
          </div>

          {/* ── Login card ────────────────────────────────────────────── */}
          <div className="bg-white/12 backdrop-blur-xl rounded-3xl p-6 border border-white/25 shadow-2xl">

            {/* Login field */}
            <div className="mb-4">
              <label className="block text-white/80 text-xs font-bold mb-1.5 uppercase tracking-widest">
                Usuário
              </label>
              <input
                type="text"
                value={login}
                onChange={e => setLogin(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite seu login"
                className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/70 focus:bg-white/28 transition-all duration-200"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="username"
              />
            </div>

            {/* Password field */}
            <div className="mb-4">
              <label className="block text-white/80 text-xs font-bold mb-1.5 uppercase tracking-widest">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3.5 pr-12 text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/70 focus:bg-white/28 transition-all duration-200"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* ── Permanecer conectado toggle ───────────────────────── */}
            <div className="mb-5">
              <button
                onClick={() => setKeepLoggedIn(!keepLoggedIn)}
                className="flex items-center gap-3 w-full group"
              >
                {/* Toggle switch */}
                <div className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                  keepLoggedIn ? 'bg-emerald-400 shadow-emerald-400/40 shadow-lg' : 'bg-white/20 border border-white/30'
                }`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
                    keepLoggedIn
                      ? 'left-[22px] bg-white'
                      : 'left-0.5 bg-white/70'
                  }`} />
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  keepLoggedIn ? 'text-emerald-300' : 'text-white/70'
                }`}>
                  Permanecer conectado
                </span>
                {keepLoggedIn && (
                  <span className="ml-auto text-emerald-400 text-xs font-bold animate-pulse">✓</span>
                )}
              </button>
              {keepLoggedIn && (
                <p className="text-white/40 text-xs mt-1.5 pl-14">
                  Você não precisará fazer login novamente
                </p>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-2.5 animate-slide-down">
                <p className="text-red-200 text-sm text-center">⚠️ {error}</p>
              </div>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all duration-200 active:scale-95 disabled:opacity-60 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🌸 Entrar
                </span>
              )}
            </button>
          </div>

          {/* Developer credit */}
          <div className="mt-5 flex flex-col items-center gap-1.5">
            <div
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}
            >
              <span className="text-base">🌿</span>
              <div className="text-center">
                <p className="text-white/50 text-xs">Desenvolvido por</p>
                <p className="text-white font-extrabold text-sm tracking-wide">Guilherme Lopes</p>
              </div>
              <span className="text-base">🌸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative z-10 pb-safe">
        <svg viewBox="0 0 480 60" className="w-full" preserveAspectRatio="none" style={{ height: 40 }}>
          <path d="M0,30 C120,60 360,0 480,30 L480,60 L0,60 Z" fill="rgba(255,255,255,0.05)" />
        </svg>
        <p className="text-center text-white/25 text-xs pb-4">
          Catálogo de Flores e Plantas © 2025 · Guilherme Lopes
        </p>
      </div>
    </div>
  );
}
