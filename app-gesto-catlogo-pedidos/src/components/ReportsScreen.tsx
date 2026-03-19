import { useState, useMemo } from 'react';
import { Order, User } from '../types';
import {
  BarChart2, Download, User as UserIcon,
  TrendingUp, Package, ShoppingCart
} from 'lucide-react';
import { exportReportToExcel } from '../utils/excel';

interface Props {
  orders: Order[];
  currentUser: User;
  users: { login: string; nome: string }[];
}

type PeriodType = '7dias' | '30dias' | 'mes';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function ReportsScreen({ orders, users }: Props) {
  const [period, setPeriod]             = useState<PeriodType>('7dias');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());
  const [userFilter, setUserFilter]       = useState<string>('todos');
  const [toast, setToast]               = useState('');

  // All roles (admin, loja, analista) see all data - no filtering by own user
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const filteredOrders = useMemo(() => {
    const now = new Date();
    let filtered = orders;

    // User filter (available to all roles)
    if (userFilter !== 'todos') {
      filtered = filtered.filter(o => o.usuario === userFilter);
    }

    // Period filter
    if (period === '7dias') {
      const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.dataISO) >= cutoff);
    } else if (period === '30dias') {
      const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.dataISO) >= cutoff);
    } else if (period === 'mes') {
      filtered = filtered.filter(o => {
        const d = new Date(o.dataISO);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      });
    }

    return filtered;
  }, [orders, period, selectedMonth, selectedYear, userFilter]);

  // Stats
  const stats = useMemo(() => {
    const productMap = new Map<string, { nome: string; totalPedidos: number; totalQtd: number }>();
    const userMap    = new Map<string, { nome: string; totalPedidos: number; totalQtd: number }>();

    filteredOrders.forEach(order => {
      const uExist = userMap.get(order.usuario);
      const orderQtd = order.itens.reduce((s, i) => s + i.quantidade, 0);
      if (uExist) {
        uExist.totalPedidos += 1;
        uExist.totalQtd += orderQtd;
      } else {
        userMap.set(order.usuario, { nome: order.usuarioNome, totalPedidos: 1, totalQtd: orderQtd });
      }

      order.itens.forEach(item => {
        const pExist = productMap.get(item.codigo_produto);
        if (pExist) {
          pExist.totalPedidos += 1;
          pExist.totalQtd += item.quantidade;
        } else {
          productMap.set(item.codigo_produto, { nome: item.nome, totalPedidos: 1, totalQtd: item.quantidade });
        }
      });
    });

    const topByPedidos     = Array.from(productMap.entries()).sort((a, b) => b[1].totalPedidos - a[1].totalPedidos).slice(0, 5);
    const topByQtd         = Array.from(productMap.entries()).sort((a, b) => b[1].totalQtd    - a[1].totalQtd).slice(0, 5);
    const topUsersByPedidos = Array.from(userMap.entries()).sort((a, b) => b[1].totalPedidos - a[1].totalPedidos).slice(0, 5);
    const topUsersByQtd    = Array.from(userMap.entries()).sort((a, b) => b[1].totalQtd    - a[1].totalQtd).slice(0, 5);

    const totalPedidos  = filteredOrders.length;
    const totalVasos    = filteredOrders.reduce((s, o) => s + o.itens.reduce((si, i) => si + i.quantidade, 0), 0);
    const totalProdutos = productMap.size;

    return { topByPedidos, topByQtd, topUsersByPedidos, topUsersByQtd, totalPedidos, totalVasos, totalProdutos };
  }, [filteredOrders]);

  const periodLabel = period === '7dias' ? '7 dias' : period === '30dias' ? '30 dias' : `${MONTHS[selectedMonth]}/${selectedYear}`;

  // ── Stat Card ──
  const StatCard = ({ label, value, icon, bg, color }: {
    label: string; value: string | number;
    icon: React.ReactNode; bg: string; color: string;
  }) => (
    <div
      className="rounded-2xl p-4"
      style={{ background: '#ffffff', border: '1.5px solid #d1eedd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: bg, color }}>
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1a3d28' }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#6b9e7e' }}>{label}</p>
    </div>
  );

  // ── Rank List ──
  const RankList = ({
    title, icon, items, valueKey, valueLabel,
  }: {
    title: string;
    icon: React.ReactNode;
    items: [string, { nome: string; totalPedidos: number; totalQtd: number }][];
    valueKey: 'totalPedidos' | 'totalQtd';
    valueLabel: string;
  }) => {
    if (items.length === 0) return null;
    const max = items[0][1][valueKey];
    return (
      <div
        className="rounded-3xl p-4"
        style={{ background: '#ffffff', border: '1.5px solid #d1eedd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-bold text-sm" style={{ color: '#1a3d28' }}>{title}</h3>
        </div>
        <div className="space-y-2">
          {items.map(([key, info], idx) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500'
                  }`}>{idx + 1}</span>
                   <span className="text-sm font-medium truncate" style={{ color: '#374151', maxWidth: '40vw' }}>
                    {info.nome}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#15803d' }}>
                  {info[valueKey]} {valueLabel}
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: '#e8f5ee' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(info[valueKey] / max) * 100}%`,
                    background: 'linear-gradient(90deg,#22c55e,#4ade80)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden', background: '#f5faf7' }}>

      {/* ── Toolbar (dark green) ── */}
      <div className="flex-shrink-0 toolbar w-full">
        {/* Top row: label + export */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 gap-2">
          <p className="text-xs font-medium flex-1 min-w-0 truncate" style={{ color: '#86efac' }}>
            Período: <span className="text-white font-bold">{periodLabel}</span>
          </p>
          <button
            onClick={() => {
              exportReportToExcel(filteredOrders, periodLabel, userFilter !== 'todos' ? userFilter : undefined);
              showToast('📊 Relatório exportado!');
            }}
            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold active:scale-95 text-white"
            style={{ background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 2px 10px rgba(34,197,94,0.3)' }}
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </button>
        </div>

        {/* Period chips */}
        <div className="flex gap-2 px-3 pb-2">
          {([['7dias','7 Dias'],['30dias','30 Dias'],['mes','Por Mês']] as [PeriodType, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={period === p
                ? { background: 'linear-gradient(135deg,#22c55e,#15803d)', color: '#fff', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }
                : { background: 'rgba(34,197,94,0.08)', color: '#86efac', border: '1px solid rgba(34,197,94,0.15)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* Month selector */}
        {period === 'mes' && (
          <div className="px-3 pb-2 flex gap-2">
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="flex-1 min-w-0 rounded-xl px-3 py-2 text-sm"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#e8fdf0' }}
            >
              {MONTHS.map((m, i) => <option key={i} value={i} style={{ background: '#0d2318' }}>{m}</option>)}
            </select>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              className="rounded-xl px-2 py-2 text-sm flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#e8fdf0', minWidth: 0, flex: '0 0 auto' }}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y} style={{ background: '#0d2318' }}>{y}</option>)}
            </select>
          </div>
        )}

        {/* User filter — visible to all roles */}
        <div className="px-3 pb-3">
          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 text-sm"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#e8fdf0' }}
          >
            <option value="todos" style={{ background: '#0d2318' }}>👥 Todos os usuários</option>
            {users.map(u => (
              <option key={u.login} value={u.login} style={{ background: '#0d2318' }}>{u.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Content (white) ── */}
      <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: '100%' }}>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Pedidos"  value={stats.totalPedidos}  icon={<ShoppingCart className="w-5 h-5" />} bg="#eff6ff" color="#2563eb" />
          <StatCard label="Vasos"    value={stats.totalVasos}    icon={<Package      className="w-5 h-5" />} bg="#f0fdf4" color="#16a34a" />
          <StatCard label="Produtos" value={stats.totalProdutos} icon={<BarChart2    className="w-5 h-5" />} bg="#faf5ff" color="#9333ea" />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{ background: '#e8f5ee', border: '1.5px solid #c6e8d3' }}
            >
              <BarChart2 className="w-10 h-10" style={{ color: '#86c9a3' }} />
            </div>
            <div className="text-center">
              <p className="font-bold" style={{ color: '#1a3d28' }}>Sem dados</p>
              <p className="text-sm mt-1" style={{ color: '#6b9e7e' }}>Nenhum pedido no período selecionado</p>
            </div>
          </div>
        ) : (
          <>
            <RankList
              title="🏆 Top Produtos (Nº de Pedidos)"
              icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
              items={stats.topByPedidos}
              valueKey="totalPedidos"
              valueLabel="ped."
            />
            <RankList
              title="📦 Top Produtos (Quantidade)"
              icon={<Package className="w-4 h-4 text-blue-500" />}
              items={stats.topByQtd}
              valueKey="totalQtd"
              valueLabel="vasos"
            />
            <RankList
              title="👤 Top Usuários (Nº de Pedidos)"
              icon={<UserIcon className="w-4 h-4 text-purple-500" />}
              items={stats.topUsersByPedidos}
              valueKey="totalPedidos"
              valueLabel="ped."
            />
            <RankList
              title="👤 Top Usuários (Quantidade)"
              icon={<UserIcon className="w-4 h-4 text-emerald-500" />}
              items={stats.topUsersByQtd}
              valueKey="totalQtd"
              valueLabel="vasos"
            />

            {/* Detailed table */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: '#ffffff', border: '1.5px solid #d1eedd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <div className="p-4" style={{ borderBottom: '1px solid #e8f3ec' }}>
                <h3 className="font-bold text-sm" style={{ color: '#1a3d28' }}>📋 Consolidado por Produto</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: '#f8fdf9' }}>
                      <th className="text-left px-4 py-2.5 text-xs font-bold uppercase" style={{ color: '#6b9e7e' }}>Produto</th>
                      <th className="text-center px-2 py-2.5 text-xs font-bold uppercase" style={{ color: '#6b9e7e' }}>Ped.</th>
                      <th className="text-center px-2 py-2.5 text-xs font-bold uppercase" style={{ color: '#6b9e7e' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      filteredOrders.reduce((map, order) => {
                        order.itens.forEach(item => {
                          const ex = map.get(item.codigo_produto);
                          if (ex) { ex.totalPedidos++; ex.totalQtd += item.quantidade; }
                          else map.set(item.codigo_produto, { nome: item.nome, totalPedidos: 1, totalQtd: item.quantidade });
                        });
                        return map;
                      }, new Map<string, { nome: string; totalPedidos: number; totalQtd: number }>()).entries()
                    )
                      .sort((a, b) => b[1].totalQtd - a[1].totalQtd)
                      .map(([cod, info], idx) => (
                        <tr
                          key={cod}
                          style={{
                            borderTop: '1px solid #f0f9f4',
                            background: idx % 2 === 0 ? '#ffffff' : '#f8fdf9',
                          }}
                        >
                          <td className="px-4 py-3">
                            <p className="font-semibold text-xs" style={{ color: '#1a3d28' }}>{info.nome}</p>
                            <p className="text-xs font-mono" style={{ color: '#9ca3af' }}>{cod}</p>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="text-xs font-bold" style={{ color: '#2563eb' }}>{info.totalPedidos}</span>
                          </td>
                          <td className="px-2 py-3 text-center">
                            <span className="text-xs font-bold" style={{ color: '#15803d' }}>{info.totalQtd}</span>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        <div className="h-4" />
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-20 left-3 right-3 z-50 pointer-events-none animate-toast">
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
