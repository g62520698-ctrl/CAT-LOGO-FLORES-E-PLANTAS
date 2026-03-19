import { useState } from 'react';
import { CartItem, User } from '../types';
import { ShoppingCart, Trash2, AlertCircle, CheckCircle2, X, Minus, Plus, ClipboardCheck, Package } from 'lucide-react';

interface Props {
  cart: CartItem[];
  currentUser: User;
  onUpdateItem: (codigo: string, qty: number) => void;
  onRemoveItem: (codigo: string) => void;
  onClearCart: () => void;
  onFinalizeOrder: () => void;
}

export default function CartScreen({ cart, currentUser, onUpdateItem, onRemoveItem, onClearCart, onFinalizeOrder }: Props) {
  const [showReview,       setShowReview]       = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalVasos  = cart.reduce((s, i) => s + i.quantidade, 0);
  const allWarnings = cart.filter(
    i => i.produto.quantidade_minima_camada > 0 && i.quantidade < i.produto.quantidade_minima_camada
  );

  const adjust = (item: CartItem, delta: number) => {
    const step   = Math.max(1, item.produto.vasos_bandeja);
    const newQty = Math.max(step, item.quantidade + delta * step);
    onUpdateItem(item.produto.codigo, newQty);
  };

  /* ── Empty state ── */
  if (cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', background: '#f5faf7' }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5ee', border: '1.5px solid #c6e8d3' }}>
          <ShoppingCart size={44} style={{ color: '#86c9a3' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#1a3d28' }}>Carrinho vazio</p>
          <p style={{ fontSize: 13, color: '#6b9e7e' }}>Adicione produtos do catálogo para criar um pedido</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden', background: '#f5faf7' }}>

      {/* ── Toolbar ── */}
      <div className="toolbar" style={{ width: '100%', maxWidth: '100%', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px 8px', width: '100%', maxWidth: '100%' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cart.length} produto(s) · {totalVasos} vasos
            </p>
          </div>
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', whiteSpace: 'nowrap' }}
          >
            <Trash2 size={13} /> Limpar
          </button>
        </div>

        {allWarnings.length > 0 && (
          <div style={{ margin: '0 12px 12px', display: 'flex', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: '8px 12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
            <AlertCircle size={15} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#fcd34d', margin: 0 }}>{allWarnings.length} item(ns) abaixo do mínimo logístico</p>
          </div>
        )}
      </div>

      {/* ── Item list ── */}
      <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: '100%' }}>
        {cart.map(item => {
          const belowMin = item.produto.quantidade_minima_camada > 0 &&
            item.quantidade < item.produto.quantidade_minima_camada;
          const bandejas = Math.ceil(item.quantidade / Math.max(1, item.produto.vasos_bandeja));

          return (
            <div
              key={item.produto.codigo}
              style={{ borderRadius: 16, overflow: 'hidden', width: '100%', background: '#ffffff', border: belowMin ? '1.5px solid #fde68a' : '1.5px solid #d1eedd', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
            >
              {/* Top: image + info + remove */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 12px 8px' }}>
                {/* Image */}
                <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5ee' }}>
                  {item.produto.imagem ? (
                    <img src={item.produto.imagem} alt={item.produto.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  ) : (
                    <span style={{ fontSize: 26 }}>{item.produto.categoria === 'Flor' ? '🌸' : '🌿'}</span>
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#1a3d28', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.produto.nome}</p>
                  <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b9e7e', margin: '2px 0 6px' }}>{item.produto.codigo}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#f0faf4', color: '#15803d', border: '1px solid #c6e8d1' }}>
                      Mín: {item.produto.quantidade_minima_camada}
                    </span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
                      {bandejas} bandeja(s)
                    </span>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemoveItem(item.produto.codigo)}
                  style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Bottom: stepper + warning */}
              <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {belowMin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', margin: 0 }}>
                      Abaixo do mínimo de {item.produto.quantidade_minima_camada} vasos
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #22c55e', background: '#f0faf4' }}>
                  <button
                    onClick={() => adjust(item, -1)}
                    style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#dc2626', border: 'none' }}
                  >
                    <Minus size={18} />
                  </button>
                  <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px' }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: '#15803d', margin: 0, lineHeight: 1 }}>{item.quantidade}</p>
                    <p style={{ fontSize: 10, color: '#4b7a5c', margin: 0 }}>{bandejas} bandeja(s)</p>
                  </div>
                  <button
                    onClick={() => adjust(item, 1)}
                    style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7', color: '#15803d', border: 'none' }}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ height: 8 }} />
      </div>

      {/* ── Footer ── */}
      <div
        style={{ flexShrink: 0, width: '100%', maxWidth: '100%', padding: '12px', display: 'flex', flexDirection: 'column', gap: 10, background: 'linear-gradient(180deg,#0d2318 0%,#091a10 100%)', borderTop: '1.5px solid rgba(34,197,94,0.2)' }}
      >
        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {[
            { label: 'Produtos',  value: cart.length,       color: '#4ade80' },
            { label: 'Vasos',     value: totalVasos,         color: '#4ade80' },
            { label: 'Alertas',   value: allWarnings.length, color: allWarnings.length > 0 ? '#fbbf24' : '#4ade80' },
          ].map(s => (
            <div key={s.label} style={{ borderRadius: 12, padding: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid #1e4530' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: '#6b9e7e', margin: '3px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Finalize button */}
        <button
          onClick={() => setShowReview(true)}
          style={{ width: '100%', padding: '14px', borderRadius: 14, fontWeight: 700, fontSize: 15, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 4px 20px rgba(34,197,94,0.4)', border: 'none' }}
        >
          <ClipboardCheck size={18} />
          Revisar e Finalizar Pedido
        </button>
      </div>

      {/* ── Review Modal ── */}
      {showReview && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-sheet animate-slide-up" style={{ background: '#ffffff' }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: '#d1eedd' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px', borderBottom: '1px solid #e8f5ee' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#15803d', margin: 0 }}>Revisão do Pedido</p>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: '#1a3d28', margin: 0 }}>📋 Confirmar Pedido</h2>
              </div>
              <button
                onClick={() => setShowReview(false)}
                style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#ef4444', border: 'none' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0faf4', borderBottom: '1px solid #e8f5ee' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 13, flexShrink: 0, background: 'linear-gradient(135deg,#22c55e,#15803d)' }}>
                {currentUser.nome.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a3d28', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.nome}</p>
                <p style={{ fontSize: 11, color: '#6b9e7e', margin: 0 }}>@{currentUser.login} · {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Items */}
            <div className="scroll-container" style={{ overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '38dvh' }}>
              {cart.map(item => {
                const warn = item.produto.quantidade_minima_camada > 0 && item.quantidade < item.produto.quantidade_minima_camada;
                return (
                  <div key={item.produto.codigo} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, padding: '10px 12px', background: warn ? '#fffbeb' : '#f8faf9', border: `1px solid ${warn ? '#fde68a' : '#e0ede6'}` }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5ee' }}>
                      {item.produto.imagem
                        ? <img src={item.produto.imagem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 18 }}>{item.produto.categoria === 'Flor' ? '🌸' : '🌿'}</span>
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 12, color: '#1a3d28', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.produto.nome}</p>
                      <p style={{ fontSize: 12, color: '#6b9e7e', margin: 0 }}>{item.quantidade} vasos</p>
                    </div>
                    {warn
                      ? <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      : <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                    }
                  </div>
                );
              })}
            </div>

            {/* Warnings */}
            {allWarnings.length > 0 && (
              <div style={{ margin: '0 16px 12px', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8, background: '#fffbeb', border: '1px solid #fde68a' }}>
                <AlertCircle size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', margin: 0 }}>
                  {allWarnings.length} item(ns) não respeitam o mínimo logístico. Deseja continuar?
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, padding: '8px 16px 24px' }}>
              <button
                onClick={() => setShowReview(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}
              >
                Voltar
              </button>
              <button
                onClick={() => { onFinalizeOrder(); setShowReview(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 3px 12px rgba(34,197,94,0.3)', border: 'none' }}
              >
                <Package size={15} /> Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Confirm ── */}
      {showClearConfirm && (
        <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: '0 16px' }}>
          <div className="animate-bounce-in" style={{ borderRadius: 24, padding: 20, width: '100%', maxWidth: 300, background: '#fff', border: '1px solid #e0ede6' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 38, marginBottom: 8 }}>🗑️</div>
              <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: '#1a1a1a' }}>Limpar carrinho?</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Todos os itens serão removidos.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => { onClearCart(); setShowClearConfirm(false); }}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, color: 'white', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none' }}
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
