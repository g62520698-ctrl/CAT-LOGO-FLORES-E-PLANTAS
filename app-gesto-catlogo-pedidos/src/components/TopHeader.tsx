import { User, UserRole, TabId } from '../types';
import { Crown, ShoppingBag, BarChart2, Flower2, ShoppingCart, Wifi, WifiOff, Loader2 } from 'lucide-react';
import { FIREBASE_ENABLED } from '../firebase/config';

interface Props {
  currentUser: User;
  activeTab: TabId;
  cartCount: number;
  darkMode?: boolean;
  onCartClick?: () => void;
  firebaseStatus?: 'offline' | 'online' | 'syncing';
}

const roleConfig: Record<UserRole, {
  label: string; icon: React.ReactNode;
  color: string; bg: string; border: string; avatar: string; glow: string;
}> = {
  admin: {
    label: 'Admin',
    icon: <Crown className="w-3 h-3" />,
    color: '#c084fc', bg: 'rgba(192,132,252,0.15)', border: 'rgba(192,132,252,0.35)',
    avatar: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.3)',
  },
  loja: {
    label: 'Loja',
    icon: <ShoppingBag className="w-3 h-3" />,
    color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.35)',
    avatar: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', glow: 'rgba(59,130,246,0.3)',
  },
  analista: {
    label: 'Analista',
    icon: <BarChart2 className="w-3 h-3" />,
    color: '#4ade80', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.35)',
    avatar: 'linear-gradient(135deg,#22c55e,#15803d)', glow: 'rgba(34,197,94,0.3)',
  },
};

const tabTitles: Record<TabId, { emoji: string; label: string }> = {
  catalogo:      { emoji: '🌸', label: 'Catálogo'      },
  carrinho:      { emoji: '🛒', label: 'Carrinho'      },
  pedidos:       { emoji: '📋', label: 'Pedidos'       },
  relatorios:    { emoji: '📊', label: 'Relatórios'    },
  usuarios:      { emoji: '👥', label: 'Usuários'      },
  configuracoes: { emoji: '⚙️', label: 'Configurações' },
};

export default function TopHeader({
  currentUser, activeTab, cartCount, onCartClick, firebaseStatus = 'offline',
}: Props) {
  const role = roleConfig[currentUser.role];
  const tab  = tabTitles[activeTab];

  const initials = currentUser.nome
    .split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

  const fbCfg = {
    online:  { dot: '#4ade80', Icon: Wifi,    spin: false },
    syncing: { dot: '#60a5fa', Icon: Loader2, spin: true  },
    offline: { dot: '#6b7280', Icon: WifiOff, spin: false },
  }[firebaseStatus];

  return (
    <header
      className="top-header"
      style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: '100%',
        background: 'linear-gradient(180deg,#0b2016 0%,#081710 100%)',
        borderBottom: '1.5px solid rgba(34,197,94,0.2)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      {/* ── Row 1: Brand + Firebase + Cart ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '10px 12px 8px',
        gap: 8, width: '100%', maxWidth: '100%', overflow: 'hidden',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg,#22c55e,#15803d)',
              boxShadow: '0 2px 10px rgba(34,197,94,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Flower2 style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <p style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#4ade80', margin: 0, whiteSpace: 'nowrap' }}>
              Catálogo de
            </p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#e8fdf0', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Flores e Plantas
            </p>
          </div>
        </div>

        {/* Right: Firebase + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Firebase dot */}
          {FIREBASE_ENABLED && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 8px', borderRadius: 8,
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(30,69,48,0.5)',
              }}
              title={`Firebase ${firebaseStatus}`}
            >
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: fbCfg.dot,
                  boxShadow: firebaseStatus === 'online' ? `0 0 6px ${fbCfg.dot}` : 'none',
                }}
              />
              <fbCfg.Icon
                className={fbCfg.spin ? 'animate-spin' : ''}
                style={{ width: 12, height: 12, color: fbCfg.dot }}
              />
            </div>
          )}

          {/* Cart shortcut */}
          {activeTab !== 'carrinho' && (
            <button
              onClick={onCartClick}
              style={{
                position: 'relative', padding: 8, borderRadius: 10,
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShoppingCart style={{ width: 16, height: 16, color: '#4ade80' }} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ef4444', color: 'white',
                    fontWeight: 800, borderRadius: '50%',
                    minWidth: 16, height: 16,
                    fontSize: 8, padding: '0 3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Row 2: User identity bar ── */}
      <div
        style={{
          margin: '0 10px 10px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.28)',
          border: `1.5px solid ${role.border}`,
          boxShadow: `0 0 10px ${role.glow}`,
          overflow: 'hidden',
          maxWidth: 'calc(100% - 20px)',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: role.avatar,
            boxShadow: `0 2px 6px ${role.glow}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 11,
          }}
        >
          {initials}
        </div>

        {/* Name + login */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p style={{
            fontWeight: 700, fontSize: 12, color: '#f0fdf4', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentUser.nome}
          </p>
          <p style={{
            fontSize: 10, color: 'rgba(134,239,172,0.7)', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            @{currentUser.login}
          </p>
        </div>

        {/* Role badge */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 8px', borderRadius: 20, flexShrink: 0,
            background: role.bg, border: `1.5px solid ${role.border}`,
          }}
        >
          <span style={{ color: role.color, display: 'flex' }}>{role.icon}</span>
          <span style={{ fontWeight: 700, fontSize: 10, color: role.color, whiteSpace: 'nowrap' }}>
            {role.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(34,197,94,0.2)', flexShrink: 0 }} />

        {/* Active tab */}
        <div style={{ flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 11, color: '#86efac', whiteSpace: 'nowrap', margin: 0 }}>
            {tab.emoji} {tab.label}
          </p>
        </div>
      </div>
    </header>
  );
}
