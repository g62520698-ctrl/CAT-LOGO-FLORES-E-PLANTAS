import { useEffect } from 'react';
import { Order } from '../types';
import { CheckCircle2, Download, X } from 'lucide-react';
import { exportOrderToExcel } from '../utils/excel';

interface Props {
  order: Order;
  onClose: () => void;
}

export default function OrderSuccessToast({ order, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="absolute top-4 left-4 right-4 z-50 animate-bounce-in">
      <div className="bg-gray-900 rounded-3xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Pedido #{order.numero} criado!</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {order.itens.length} produto(s) · {order.itens.reduce((s, i) => s + i.quantidade, 0)} vasos
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => exportOrderToExcel(order)}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar Excel do Pedido
        </button>
      </div>
    </div>
  );
}
