import { useState } from 'react';
import { User, UserRole } from '../types';
import {
  Plus, Edit2, Trash2, X, Check,
  Eye, EyeOff, ShoppingBag, BarChart2, Crown
} from 'lucide-react';

interface Props {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  darkMode?: boolean;
}

const roleConfig: Record<UserRole, {
  label: string; icon: React.ReactNode;
  color: string; bgColor: string; description: string;
  pillBg: string; pillText: string; pillBorder: string;
}> = {
  admin: {
    label: 'Administrador',
    icon: <Crown className="w-4 h-4" />,
    color: '#7c3aed', bgColor: '#f5f3ff',
    pillBg: '#faf5ff', pillText: '#7c3aed', pillBorder: '#e9d5ff',
    description: 'Acesso total ao sistema',
  },
  loja: {
    label: 'Loja',
    icon: <ShoppingBag className="w-4 h-4" />,
    color: '#2563eb', bgColor: '#eff6ff',
    pillBg: '#eff6ff', pillText: '#2563eb', pillBorder: '#bfdbfe',
    description: 'Catálogo, pedidos e relatórios',
  },
  analista: {
    label: 'Analista',
    icon: <BarChart2 className="w-4 h-4" />,
    color: '#15803d', bgColor: '#f0fdf4',
    pillBg: '#f0fdf4', pillText: '#15803d', pillBorder: '#bbf7d0',
    description: 'Visualizar catálogo e relatórios',
  },
};

function UserForm({
  initial, onSave, onCancel, isEditing,
}: {
  initial: Partial<User> & { id?: string };
  onSave: (user: User) => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [form, setForm] = useState({
    nome:  initial.nome  || '',
    login: initial.login || '',
    senha: initial.senha || '',
    email: initial.email || '',
    role:  (initial.role  || 'loja') as UserRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nome.trim())  e.nome  = 'Nome obrigatório';
    if (!form.login.trim()) e.login = 'Login obrigatório';
    if (!isEditing && !form.senha.trim()) e.senha = 'Senha obrigatória';
    if (!form.email.trim()) e.email = 'E-mail obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const user: User = {
      id: initial.id || `user-${Date.now()}`,
      nome:  form.nome.trim(),
      login: form.login.trim().toLowerCase(),
      senha: form.senha || initial.senha || '',
      email: form.email.trim(),
      role:  form.role,
    };
    onSave(user);
  };

  const inputCls = 'w-full border rounded-2xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-emerald-500 transition-colors';

  return (
    <div className="modal-overlay animate-fade-in">
      <div
        className="modal-sheet animate-slide-up"
        style={{ background: '#ffffff' }}
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1.5 rounded-full" style={{ background: '#d1d5db' }} />
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: '#1a3d28' }}>
            {isEditing ? '✏️ Editar Usuário' : '➕ Novo Usuário'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#f3f4f6', color: '#6b7280' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Nome */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b9e7e' }}>
              Nome Completo *
            </label>
            <input
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Nome do usuário"
              className={inputCls}
              style={{ borderColor: errors.nome ? '#f87171' : '#d1eedd', color: '#1a3d28' }}
            />
            {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
          </div>

          {/* Login + Senha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b9e7e' }}>
                Login *
              </label>
              <input
                value={form.login}
                onChange={e => setForm(f => ({ ...f, login: e.target.value }))}
                placeholder="login"
                disabled={isEditing}
                className={inputCls}
                style={{
                  borderColor: errors.login ? '#f87171' : '#d1eedd',
                  color: '#1a3d28',
                  opacity: isEditing ? 0.6 : 1,
                }}
                autoCapitalize="none"
              />
              {errors.login && <p className="text-red-500 text-xs mt-1">{errors.login}</p>}
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b9e7e' }}>
                {isEditing ? 'Nova Senha' : 'Senha *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  placeholder={isEditing ? 'Opcional' : 'Senha'}
                  className={inputCls}
                  style={{ borderColor: errors.senha ? '#f87171' : '#d1eedd', color: '#1a3d28', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-red-500 text-xs mt-1">{errors.senha}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b9e7e' }}>
              E-mail *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="email@empresa.com"
              className={inputCls}
              style={{ borderColor: errors.email ? '#f87171' : '#d1eedd', color: '#1a3d28' }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide mb-1.5 block" style={{ color: '#6b9e7e' }}>
              Perfil *
            </label>
            <div className="space-y-2">
              {(Object.keys(roleConfig) as UserRole[]).map(r => {
                const cfg = roleConfig[r];
                const selected = form.role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-98"
                    style={{
                      borderColor: selected ? '#22c55e' : '#e5e7eb',
                      background: selected ? '#f0fdf4' : '#fafafa',
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: cfg.bgColor, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-sm" style={{ color: '#1a3d28' }}>{cfg.label}</p>
                      <p className="text-xs" style={{ color: '#6b9e7e' }}>{cfg.description}</p>
                    </div>
                    {selected && <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: '#f3f4f6', color: '#374151', border: '1.5px solid #e5e7eb' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
          >
            <Check className="w-4 h-4 inline mr-1" />
            {isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UsersScreen({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }: Props) {
  const [showForm,     setShowForm]     = useState(false);
  const [editUser,     setEditUser]     = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast,        setToast]        = useState('');

  const isAdmin = currentUser.role === 'admin';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = (user: User) => {
    if (editUser) { onUpdateUser(user); showToast('✅ Usuário atualizado!'); }
    else          { onAddUser(user);    showToast('✅ Usuário criado!');     }
    setShowForm(false);
    setEditUser(null);
  };

  const handleDelete = (id: string) => {
    onDeleteUser(id);
    setDeleteConfirm(null);
    showToast('🗑️ Usuário removido!');
  };

  const admins   = users.filter(u => u.role === 'admin');
  const lojas    = users.filter(u => u.role === 'loja');
  const analistas = users.filter(u => u.role === 'analista');

  const renderUser = (u: User) => {
    const cfg   = roleConfig[u.role];
    const isSelf = u.id === currentUser.id;
    return (
      <div
        key={u.id}
        className="rounded-3xl p-4"
        style={{
          background: '#ffffff',
          border: `1.5px solid ${isSelf ? '#bbf7d0' : '#e5e7eb'}`,
          boxShadow: isSelf ? '0 2px 12px rgba(34,197,94,0.1)' : '0 2px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.bgColor, color: cfg.color }}
          >
            <span className="text-xl font-bold">{u.nome.charAt(0).toUpperCase()}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm" style={{ color: '#1a3d28' }}>{u.nome}</p>
              {isSelf && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
                >
                  Você
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>@{u.login}</p>
            <p className="text-xs truncate" style={{ color: '#9ca3af' }}>{u.email}</p>
            <span
              className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: cfg.pillBg, color: cfg.pillText, border: `1px solid ${cfg.pillBorder}` }}
            >
              {cfg.icon} {cfg.label}
            </span>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => { setEditUser(u); setShowForm(true); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: '#eff6ff', color: '#2563eb' }}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              {!isSelf && (
                <button
                  onClick={() => setDeleteConfirm(u.id)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                  style={{ background: '#fee2e2', color: '#ef4444' }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const GroupSection = ({ title, icon, items }: { title: string; icon: React.ReactNode; items: User[] }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          {icon}
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6b9e7e' }}>
            {title} ({items.length})
          </p>
        </div>
        <div className="space-y-3">{items.map(renderUser)}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden" style={{ background: '#f5faf7' }}>

      {/* ── Toolbar (dark green) ── */}
      <div className="flex-shrink-0 toolbar w-full">
        <div className="flex items-center justify-between px-3 pt-3 pb-3 gap-2">
          <p className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: '#86efac' }}>
            <span className="text-white font-bold">{users.length}</span> usuário(s)
          </p>
          {isAdmin && (
            <button
              onClick={() => { setEditUser(null); setShowForm(true); }}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95"
              style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 2px 10px rgba(34,197,94,0.3)' }}
            >
              <Plus className="w-4 h-4" /> Novo Usuário
            </button>
          )}
        </div>
      </div>

      {/* ── Content (white) ── */}
      <div className="flex-1 overflow-y-auto scroll-container px-3 py-3 space-y-4 pb-4 w-full">

        {!isAdmin && (
          <div
            className="rounded-2xl p-4"
            style={{ background: '#fffbeb', border: '1.5px solid #fde68a' }}
          >
            <p className="text-sm font-medium" style={{ color: '#92400e' }}>
              🔒 Apenas administradores podem gerenciar usuários.
            </p>
          </div>
        )}

        <GroupSection
          title="Administradores"
          icon={<Crown className="w-4 h-4" style={{ color: '#7c3aed' }} />}
          items={admins}
        />
        <GroupSection
          title="Lojas"
          icon={<ShoppingBag className="w-4 h-4" style={{ color: '#2563eb' }} />}
          items={lojas}
        />
        <GroupSection
          title="Analistas"
          icon={<BarChart2 className="w-4 h-4" style={{ color: '#15803d' }} />}
          items={analistas}
        />
        <div className="h-4" />
      </div>

      {/* ── Permissions legend (dark green footer) ── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ background: 'linear-gradient(0deg,#071810 0%,#0d2318 100%)', borderTop: '1px solid #1e4530' }}
      >
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#4ade80' }}>Permissões</p>
        <div className="space-y-1.5">
          {(Object.keys(roleConfig) as UserRole[]).map(r => (
            <div key={r} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: roleConfig[r].bgColor, color: roleConfig[r].color }}
              >
                {roleConfig[r].icon}
              </div>
              <p className="text-xs" style={{ color: '#86efac' }}>
                <strong style={{ color: '#e8fdf0' }}>{roleConfig[r].label}:</strong>{' '}
                {roleConfig[r].description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <UserForm
          initial={editUser || {}}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditUser(null); }}
          isEditing={!!editUser}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div
            className="rounded-3xl p-6 w-full max-w-sm"
            style={{ background: '#ffffff', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: '#fee2e2' }}
            >
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1" style={{ color: '#1a3d28' }}>Excluir usuário?</h3>
            <p className="text-sm text-center mb-5" style={{ color: '#6b9e7e' }}>
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold text-white"
                style={{ background: '#ef4444' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-20 left-4 right-4 z-50">
          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold text-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#0d2318,#163525)', color: '#4ade80', border: '1px solid #1e4530' }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
