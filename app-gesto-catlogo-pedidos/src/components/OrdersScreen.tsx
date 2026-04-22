import { useState } from 'react';
import { Order, User } from '../types';
import {
  ClipboardList, X, Download, CheckCircle2, Trash2,
  ChevronRight, Package, Clock, User as UserIcon,
  FileSpreadsheet, BarChart2, Eye,
} from 'lucide-react';
import { exportOrderToExcel, exportConsolidatedOrdersToExcel } from '../utils/excel';

interface Props {
  orders: Order[];
  currentUser: User;
  onCompleteOrder: (id: string) => void;
  onDeleteOrder: (id: string) => void;
}

export default function OrdersScreen({ orders, currentUser, onCompleteOrder, onDeleteOrder }: Props) {
  const [selectedOrder,      setSelectedOrder]      = useState<Order | null>(null);
  const [confirmAction,      setConfirmAction]      = useState<{ type: 'complete' | 'delete'; id: string } | null>(null);
  const [toast,              setToast]              = useState('');
  const [showConsolidateInfo,setShowConsolidateInfo] = useState(false);

  const isAdmin    = currentUser.role === 'admin';
  const isReadOnly = !isAdmin;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const visibleOrders = Array.isArray(orders) ? orders : [];
const pendingOrders = visibleOrders.filter(o => o && o.status === 'pendente');
const completedOrders = visibleOrders.filter(o => o && o.status === 'concluido');
  const pendingUsers    = new Set(pendingOrders.map(o => o.usuario)).size;
   const pendingItems = pendingOrders.reduce(
  (s, o) => s + (Array.isArray(o.itens)
    ? o.itens.reduce((ss, i) => ss + i.quantidade, 0)
    : 0),
  0
);
  const isPending       = (o: Order) => o.status === 'pendente';

  const OrderCard = ({ order }: { order: Order }) => (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: '#ffffff',
        border: `1.5px solid ${isPending(order) ? '#fde68a' : '#d1eedd'}`,
        boxShadow: isPending(order) ? '0 2px 10px rgba(251,191,36,0.1)' : '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      {/* Clickable top */}
      <button onClick={() => setSelectedOrder(order)} className="w-full text-left p-3">
        <div className="flex items-start gap-3">
          {/* Status icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isPending(order) ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)' }}
          >
            {isPending(order)
              ? <Clock className="w-4 h-4 text-amber-500" />
              : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            }
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isPending(order) ? '#fffbeb' : '#f0fdf4',
                  color: isPending(order) ? '#92400e' : '#166534',
                  border: `1px solid ${isPending(order) ? '#fde68a' : '#bbf7d0'}`,
                }}
              >
                {isPending(order) ? 'Pendente' : 'Concluído'}
              </span>
              <span className="text-xs font-mono" style={{ color: '#9ca3af' }}>#{order.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3 flex-shrink-0" style={{ color: '#6b9e7e' }} />
              <p className="text-sm font-bold truncate" style={{ color: '#1a3d28' }}>{order.usuarioNome}</p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: '#9ca3af' }} />
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: '#6b9e7e' }}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{order.data}</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>{Array.isArray(order.itens) ? order.itens.length : 0} item(ns)</span>
          </div>
          <span className="font-semibold" style={{ color: '#15803d' }}>
            {Array.isArray(order.itens)
  ? order.itens.reduce((s, i) => s + i.quantidade, 0)
  : 0} vasos
          </span>
        </div>
      </button>

      {/* Actions row */}
      <div className="flex items-center gap-2 px-3 pb-3 flex-wrap" style={{ borderTop: '1px solid #f0f9f4' }}>
        {/* Export */}
        <button
          onClick={e => { e.stopPropagation(); exportOrderToExcel(order); showToast('📊 Exportado!'); }}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95"
          style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
        >
          <Download className="w-3.5 h-3.5" /> Exportar
        </button>

        {/* Read-only */}
        {isReadOnly && (
          <span
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ml-auto"
            style={{ background: '#f3f4f6', color: '#9ca3af', border: '1px solid #e5e7eb' }}
          >
            <Eye className="w-3.5 h-3.5" /> Visualização
          </span>
        )}

        {/* Admin: complete */}
        {isAdmin && isPending(order) && (
          <button
            onClick={e => { e.stopPropagation(); setConfirmAction({ type: 'complete', id: order.id }); }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold active:scale-95"
            style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
          </button>
        )}

        {/* Admin: delete */}
        {isAdmin && (
          <button
            onClick={e => { e.stopPropagation(); setConfirmAction({ type: 'delete', id: order.id }); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-95 ml-auto"
            style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden', background: '#f5faf7' }}>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 toolbar w-full">

        {/* Stats */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          {[
            { label: 'Pendentes', value: pendingOrders.length,   color: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)' },
            { label: 'Concluídos',value: completedOrders.length, color: '#4ade80', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
            { label: 'Total',     value: orders.length,          color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',border: 'rgba(96,165,250,0.15)' },
          ].map(s => (
            <div key={s.label} className="flex-1 flex flex-col items-center py-2 rounded-xl" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <span className="text-base font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs" style={{ color: '#86efac', fontSize: 10 }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Consolidated export */}
        {pendingOrders?.length > 0 && (
          <div className="px-3 pb-3 space-y-1">
            <button
              onClick={() => { exportConsolidatedOrdersToExcel(pendingOrders); showToast('📊 Planilha consolidada exportada!'); }}
              className="w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold active:scale-95 text-white"
              style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}
            >
              <FileSpreadsheet className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold leading-tight">Exportar Consolidada</p>
                <p className="leading-tight" style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>
                  {pendingUsers} usuário(s) · {pendingItems} vasos
                </p>
              </div>
              <BarChart2 className="w-4 h-4 opacity-75 flex-shrink-0" />
            </button>

            <button
              onClick={() => setShowConsolidateInfo(v => !v)}
              className="w-full text-center py-0.5"
              style={{ fontSize: 11, color: '#4ade80' }}
            >
              {showConsolidateInfo ? '▲ fechar' : '▼ o que inclui?'}
            </button>

            {showConsolidateInfo && (
              <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', color: '#86efac' }}>
                <p>📋 <strong>Aba 1:</strong> Itens por usuário com subtotais</p>
                <p>📊 <strong>Aba 2:</strong> Resumo com SOMA TOTAL por código</p>
                <p>⚠️ Apenas pedidos <strong>pendentes</strong></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: '100%' }}>

  {visibleOrders?.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: '#e8f5ee', border: '1.5px solid #c6e8d3' }}>
        <ClipboardList className="w-10 h-10" style={{ color: '#86c9a3' }} />
      </div>
      <div className="text-center">
        <p className="font-bold text-base" style={{ color: '#1a3d28' }}>Nenhum pedido</p>
        <p className="text-sm mt-1" style={{ color: '#6b9e7e' }}>Os pedidos aparecerão aqui</p>
      </div>
    </div>
  ) : (
    <>
      {pendingOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-bold" style={{ color: '#92400e' }}>
              Pendentes ({pendingOrders.length})
            </p>
          </div>
          {pendingOrders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}

      {completedOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-sm font-bold" style={{ color: '#166534' }}>
              Concluídos ({completedOrders.length})
            </p>
          </div>
          {completedOrders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </>
  )}

  <div className="h-4" />
</div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="modal-overlay animate-fade-in" style={{ alignItems: 'flex-end' }}>
          <div
            className="modal-sheet animate-slide-up"
            style={{ background: '#ffffff', boxShadow: '0 -8px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ background: '#d1d5db' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid #e8f3ec' }}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-sm" style={{ color: '#1a3d28' }}>Detalhes do Pedido</h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{
                      background: isPending(selectedOrder) ? '#fffbeb' : '#f0fdf4',
                      color: isPending(selectedOrder) ? '#92400e' : '#166534',
                      border: `1px solid ${isPending(selectedOrder) ? '#fde68a' : '#bbf7d0'}`,
                    }}
                  >
                    {isPending(selectedOrder) ? 'Pendente' : 'Concluído'}
                  </span>
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: '#6b9e7e' }}>
                  {selectedOrder.usuarioNome} · {selectedOrder.data} {selectedOrder.hora}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-2 active:scale-90"
                style={{ background: '#f3f4f6', color: '#6b7280' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scroll-container min-h-0">
              {/* Column headers */}
              <div
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide sticky top-0"
                style={{ background: '#f8fdf9', borderBottom: '1px solid #e8f3ec', color: '#6b9e7e', zIndex: 1 }}
              >
                <span className="w-8 flex-shrink-0" />
                <span className="flex-1">Produto</span>
                <span className="w-12 text-center flex-shrink-0">Qtd</span>
                <span className="w-14 text-center flex-shrink-0">Bandeja</span>
              </div>

              <div className="divide-y" style={{ borderColor: '#f0f9f4' }}>
                {Array.isArray(selectedOrder.itens) &&
  selectedOrder.itens.map(item => {
                  const step    = item.vasos_bandeja || 1;
                  const bandeja = step > 0 ? Math.ceil(item.quantidade / step) : 0;
                  return (
                    <div key={item.codigo_produto} className="flex items-center gap-2 px-4 py-2.5">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: '#e8f5ee' }}>
                        {item.imagem
                          ? <img src={item.imagem} alt="" className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4" style={{ color: '#86c9a3' }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#1a3d28' }}>{item.nome}</p>
                        <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>#{item.codigo_produto}</p>
                      </div>
                      <div className="w-12 text-center flex-shrink-0">
                        <span className="text-sm font-bold" style={{ color: '#15803d' }}>{item.quantidade}</span>
                      </div>
                      <div className="w-14 text-center flex-shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          {bandeja}x
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-3" style={{ background: '#f8fdf9', borderTop: '1px solid #e8f3ec' }}>
                <span className="text-sm font-bold" style={{ color: '#1a3d28' }}>Total de vasos</span>
                <span className="text-lg font-bold" style={{ color: '#15803d' }}>
                  {Array.isArray(selectedOrder.itens)
  ? selectedOrder.itens.reduce((s, i) => s + i.quantidade, 0)
  : 0}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-6 pt-3 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #e8f3ec' }}>
              <button
                onClick={() => { exportOrderToExcel(selectedOrder); showToast('📊 Exportado!'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold active:scale-95"
                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
              >
                <Download className="w-4 h-4" /> Excel
              </button>
              {isAdmin && isPending(selectedOrder) && (
                <button
                  onClick={() => { setConfirmAction({ type: 'complete', id: selectedOrder.id }); setSelectedOrder(null); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold active:scale-95"
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Concluir
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full rounded-3xl p-5 animate-bounce-in" style={{ background: '#ffffff', maxWidth: 320, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: confirmAction.type === 'complete' ? '#f0fdf4' : '#fee2e2' }}
            >
              {confirmAction.type === 'complete'
                ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                : <Trash2 className="w-6 h-6 text-red-500" />
              }
            </div>
            <h3 className="font-bold text-base text-center mb-1" style={{ color: '#1a3d28' }}>
              {confirmAction.type === 'complete' ? 'Concluir pedido?' : 'Excluir pedido?'}
            </h3>
            <p className="text-sm text-center mb-5" style={{ color: '#6b9e7e' }}>
              {confirmAction.type === 'complete' ? 'O pedido será marcado como concluído.' : 'Esta ação não pode ser desfeita.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: '#f3f4f6', color: '#374151' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'complete') { onCompleteOrder(confirmAction.id); showToast('✅ Pedido concluído!'); }
                  else { onDeleteOrder(confirmAction.id); showToast('🗑️ Pedido excluído!'); }
                  setConfirmAction(null);
                }}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: confirmAction.type === 'complete' ? 'linear-gradient(135deg,#22c55e,#15803d)' : '#ef4444' }}
              >
                {confirmAction.type === 'complete' ? 'Concluir' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-20 left-3 right-3 z-50 pointer-events-none">
          <div className="rounded-2xl px-4 py-3 text-sm font-semibold text-center shadow-2xl animate-toast"
            style={{ background: 'linear-gradient(135deg,#0d2318,#163525)', color: '#4ade80', border: '1px solid #1e4530' }}>
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
