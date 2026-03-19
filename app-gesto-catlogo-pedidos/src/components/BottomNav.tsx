import { TabId, UserRole } from '../types';
import { BookOpen, ShoppingCart, ClipboardList, BarChart2, Users, Settings } from 'lucide-react';

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  cartCount: number;
  userRole: UserRole;
}

const allTabs: { id: TabId; label: string; icon: React.ReactNode; roles: UserRole[] }[] = [
  { id: 'catalogo',      label: 'Catálogo',   icon: <BookOpen      size={19} />, roles: ['admin','loja','analista'] },
  { id: 'carrinho',      label: 'Carrinho',   icon: <ShoppingCart  size={19} />, roles: ['admin','loja'] },
  { id: 'pedidos',       label: 'Pedidos',    icon: <ClipboardList size={19} />, roles: ['admin','loja','analista'] },
  { id: 'relatorios',    label: 'Relatórios', icon: <BarChart2     size={19} />, roles: ['admin','loja','analista'] },
  { id: 'usuarios',      label: 'Usuários',   icon: <Users         size={19} />, roles: ['admin'] },
  { id: 'configuracoes', label: 'Config',     icon: <Settings      size={19} />, roles: ['admin','loja','analista'] },
];

export default function BottomNav({ activeTab, onTabChange, cartCount, userRole }: Props) {
  const visible = allTabs.filter(t => t.roles.includes(userRole));
  const tabW    = Math.floor(100 / visible.length);

  return (
    <nav
      className="bottom-nav"
      style={{
        flexShrink: 0,
        width: '100%',
        maxWidth: '100%',
        background: 'linear-gradient(180deg,#091c10 0%,#050f09 100%)',
        borderTop: '1px solid rgba(30,69,48,0.8)',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: 60,
          alignItems: 'stretch',
        }}
      >
        {visible.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: `0 0 ${tabW}%`,
                maxWidth: `${tabW}%`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                position: 'relative',
                color: isActive ? '#4ade80' : '#3d6b50',
                border: 'none',
                background: 'transparent',
                padding: '4px 2px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Active top indicator */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute', top: 0,
                    left: '50%', transform: 'translateX(-50%)',
                    width: 28, height: 3, borderRadius: '0 0 4px 4px',
                    background: 'linear-gradient(90deg,#22c55e,#4ade80)',
                  }}
                />
              )}

              {/* Icon container */}
              <div
                style={{
                  position: 'relative',
                  width: 34, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 10,
                  ...(isActive ? {
                    background: 'rgba(34,197,94,0.14)',
                    boxShadow: '0 0 10px rgba(34,197,94,0.18)',
                  } : {}),
                }}
              >
                {tab.icon}

                {/* Cart badge */}
                {tab.id === 'carrinho' && cartCount > 0 && (
                  <span
                    style={{
                      position: 'absolute', top: -4, right: -4,
                      background: '#ef4444', color: 'white',
                      fontWeight: 800, borderRadius: '50%',
                      minWidth: 15, height: 15,
                      fontSize: 7.5, padding: '0 2px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: visible.length > 5 ? 7.5 : 8.5,
                  fontWeight: 600,
                  lineHeight: 1,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  paddingLeft: 2,
                  paddingRight: 2,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
