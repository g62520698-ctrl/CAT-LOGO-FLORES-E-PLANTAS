import { User, AppSettings, UserRole } from '../types';
import {
  LogOut, Smartphone, Crown,
  ShoppingBag, BarChart2, Mail,
  Globe, Download, ChevronRight
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  currentUser: User;
  onUpdateSettings: (s: AppSettings) => void;
  onLogout: () => void;
  darkMode?: boolean;
}

const roleConfig: Record<UserRole, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  admin:    { label: 'Administrador', icon: <Crown      className="w-4 h-4" />, color: '#7c3aed', bg: '#f5f3ff', border: '#e9d5ff' },
  loja:     { label: 'Loja',          icon: <ShoppingBag className="w-4 h-4" />, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  analista: { label: 'Analista',      icon: <BarChart2  className="w-4 h-4" />, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
};

export default function SettingsScreen({ currentUser, onLogout }: Props) {
  const role = roleConfig[currentUser.role];

  const SectionTitle = ({ title }: { title: string }) => (
    <p className="text-xs font-bold uppercase tracking-wider mb-2 px-1" style={{ color: '#6b9e7e' }}>{title}</p>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: '#ffffff', border: '1.5px solid #d1eedd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
    >
      {children}
    </div>
  );

  const Row = ({ icon, label, sublabel, right, danger, divider }: {
    icon: React.ReactNode; label: string; sublabel?: string;
    right?: React.ReactNode; danger?: boolean; divider?: boolean;
  }) => (
    <div
      className="flex items-center gap-3 p-4"
      style={divider ? { borderBottom: '1px solid #f0f9f4' } : {}}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: danger ? '#fee2e2' : '#f0fdf4', color: danger ? '#ef4444' : '#16a34a' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? '#ef4444' : '#1a3d28' }}>{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{sublabel}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: '#f5faf7' }}>

      {/* ── Toolbar (dark green) ── */}
      <div
        className="flex-shrink-0"
        style={{ background: 'linear-gradient(180deg,#0d2318 0%,#0a1d14 100%)', borderBottom: '1px solid #1e4530' }}
      >
        <div className="px-4 pt-3 pb-3">
          <p className="text-xs" style={{ color: '#86efac' }}>
            Configurações e informações do perfil
          </p>
        </div>
      </div>

      {/* ── Content (white bg) ── */}
      <div className="flex-1 overflow-y-auto scroll-container px-4 py-4 space-y-5 pb-6">

        {/* User profile card */}
        <div>
          <SectionTitle title="Meu Perfil" />
          <Card>
            <div className="p-5">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: role.bg, color: role.color, border: `1.5px solid ${role.border}` }}
                >
                  <span className="text-2xl font-bold">{currentUser.nome.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-base" style={{ color: '#1a3d28' }}>{currentUser.nome}</h2>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>@{currentUser.login}</p>
                  <span
                    className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: role.bg, color: role.color, border: `1px solid ${role.border}` }}
                  >
                    {role.icon} {role.label}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div
                className="mt-4 p-3 rounded-2xl flex items-center gap-2"
                style={{ background: '#f8fdf9', border: '1px solid #e8f3ec' }}
              >
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#86c9a3' }} />
                <p className="text-sm" style={{ color: '#6b9e7e' }}>{currentUser.email || 'Sem e-mail cadastrado'}</p>
              </div>
            </div>
          </Card>
        </div>



        {/* Install instructions */}
        <div>
          <SectionTitle title="Instalar como App" />
          <Card>
            {/* Android */}
            <div className="p-4" style={{ borderBottom: '1px solid #f0f9f4' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                  <span className="text-lg">🤖</span>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1a3d28' }}>Android (Chrome)</p>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#9ca3af' }} />
              </div>
              <div className="space-y-2 pl-2">
                {[
                  '1. Abra o Chrome no Android',
                  '2. Toque no menu ⋮ (3 pontos)',
                  '3. Selecione "Adicionar à tela inicial"',
                  '4. Confirme tocando em "Adicionar"',
                  '5. O app aparece na tela como ícone 🌸',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#22c55e' }} />
                    <p className="text-xs" style={{ color: '#6b7280' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* iOS */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f8fafc' }}>
                  <span className="text-lg">🍎</span>
                </div>
                <p className="font-semibold text-sm" style={{ color: '#1a3d28' }}>iOS (Safari)</p>
                <ChevronRight className="w-4 h-4 ml-auto" style={{ color: '#9ca3af' }} />
              </div>
              <div className="space-y-2 pl-2">
                {[
                  '1. Abra o Safari no iPhone/iPad',
                  '2. Toque no ícone de compartilhamento 📤',
                  '3. Role e toque em "Adicionar à Tela Inicial"',
                  '4. Confirme tocando em "Adicionar"',
                  '5. O app aparece na tela como ícone 🌸',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#6b7280' }} />
                    <p className="text-xs" style={{ color: '#6b7280' }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>



        {/* About */}
        <div>
          <SectionTitle title="Sobre o App" />
          <Card>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)' }}
                >
                  <span className="text-2xl">🌸</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: '#1a3d28' }}>Catálogo de Flores e Plantas</p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>Versão 2.0 · Firebase Sync · PWA</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>catalog-82ce0.web.app</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: <Globe className="w-4 h-4" style={{ color: '#22c55e' }} />, text: 'Gerenciamento de catálogo e pedidos' },
                  { icon: <Download className="w-4 h-4" style={{ color: '#3b82f6' }} />, text: 'Exportação de pedidos em Excel (.xlsx)' },
                  { icon: <Smartphone className="w-4 h-4" style={{ color: '#a855f7' }} />, text: 'PWA · funciona offline · instalável' },
                  { icon: <BarChart2 className="w-4 h-4" style={{ color: '#f97316' }} />, text: 'Relatórios com rankings e exportação' },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {icon}
                    <span className="text-xs" style={{ color: '#6b7280' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Logout */}
        <div>
          <SectionTitle title="Sessão" />
          <Card>
            <button
              onClick={onLogout}
              className="w-full active:scale-98 transition-transform"
            >
              <Row
                icon={<LogOut className="w-5 h-5" />}
                label="Sair do Sistema"
                sublabel="Encerrar sessão atual"
                danger
                right={<ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#fca5a5' }} />}
              />
            </button>
          </Card>
        </div>

        {/* Developer credit */}
        <div className="flex flex-col items-center gap-2 py-4">
          <div
            className="flex items-center gap-2 px-5 py-3 rounded-2xl"
            style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #bbf7d0' }}
          >
            <span className="text-lg">🌿</span>
            <div className="text-center">
              <p className="text-xs font-bold" style={{ color: '#15803d' }}>Desenvolvido por</p>
              <p className="text-sm font-extrabold tracking-wide" style={{ color: '#0d4f26' }}>Guilherme Lopes</p>
            </div>
            <span className="text-lg">🌸</span>
          </div>
          <p className="text-xs" style={{ color: '#9ca3af' }}>Catálogo de Flores e Plantas © 2025</p>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
