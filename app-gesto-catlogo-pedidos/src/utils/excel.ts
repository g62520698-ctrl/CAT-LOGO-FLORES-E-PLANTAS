import * as XLSX from 'xlsx';
import { Order } from '../types';

// ─────────────────────────────────────────────────────────────
// Helper: apply column widths
// ─────────────────────────────────────────────────────────────
function setCols(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map(w => ({ wch: w }));
}

// ─────────────────────────────────────────────────────────────
// 1. EXPORT INDIVIDUAL ORDER
//    Colunas: Código | Produto | Qtd Mínima Camada |
//             Quantidade Pedida | Total | Usuário
// ─────────────────────────────────────────────────────────────
export function exportOrderToExcel(order: Order) {
  const wb = XLSX.utils.book_new();

  // ── Header metadata rows (aoa = array of arrays)
  const aoa: (string | number)[][] = [];

  // Title
  aoa.push(['PEDIDO #' + order.numero]);
  aoa.push([]);
  aoa.push(['Usuário:', order.usuarioNome]);
  aoa.push(['Perfil:', order.usuarioRole === 'admin' ? 'Administrador' : order.usuarioRole === 'loja' ? 'Loja' : 'Analista']);
  aoa.push(['Data:', order.data]);
  aoa.push(['Hora:', order.hora]);
  aoa.push([]);

  // Column headers
  const COL_HEADERS = [
    'Código',
    'Produto',
    'Qtd Mínima Camada',
    'Quantidade Pedida',
    'Total',
    'Usuário',
  ];
  aoa.push(COL_HEADERS);

  const dataStartRow = aoa.length; // 0-indexed

  // Data rows
  let totalGeral = 0;
  order.itens.forEach(item => {
    totalGeral += item.quantidade;
    aoa.push([
      item.codigo_produto,
      item.nome,
      item.quantidade_minima_camada,
      item.quantidade,
      item.quantidade,   // Total = mesma quantidade (pedido individual)
      order.usuarioNome,
    ]);
  });

  // Blank + totals row
  aoa.push([]);
  aoa.push(['', 'TOTAL GERAL', '', '', totalGeral, '']);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  setCols(ws, [14, 32, 20, 20, 14, 24]);

  // Merge title cell A1 across all columns
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
  ];

  // Mark header row bold via cell comment trick (visual only in xlsx)
  // We bold by writing the header row index to !freeze
  ws['!freeze'] = { xSplit: 0, ySplit: dataStartRow + 1 } as any;

  XLSX.utils.book_append_sheet(wb, ws, 'Pedido');

  const dateStr = order.data.replace(/\//g, '-');
  XLSX.writeFile(wb, `pedido_${order.usuario}_${dateStr}_#${order.numero}.xlsx`);
}

// ─────────────────────────────────────────────────────────────
// 2. EXPORT CONSOLIDATED (all pending orders)
//
//  Estrutura da planilha (UMA ÚNICA ABA):
//
//  PEDIDOS PENDENTES — CONSOLIDADO  (título)
//  Gerado em: DD/MM/AAAA HH:MM
//  [linha em branco]
//  ── USUÁRIO: Nome (Loja) ─────────────────────
//  Código | Produto | Qtd Mín Camada | Qtd Pedida | Total | Usuário
//  ...linhas do usuário...
//  Subtotal usuário: X vasos
//  [linha em branco]
//  ── USUÁRIO: Nome2 (Loja) ────────────────────
//  ...
//  [linha em branco]
//  ═══════════════════════════════════════════
//  SOMA CONSOLIDADA POR PRODUTO (todos os usuários)
//  Código | Produto | Qtd Mín Camada | [usr1] | [usr2] | ... | SOMA TOTAL
//  ...um produto por linha com qty de cada user e soma final
// ─────────────────────────────────────────────────────────────
export function exportConsolidatedOrdersToExcel(orders: Order[]) {
  const pendingOrders = orders.filter(o => o.status === 'pendente');
  if (pendingOrders.length === 0) return;

  const wb = XLSX.utils.book_new();

  // ── Collect unique users that have pending orders
  const userMap = new Map<string, { nome: string; role: string; orders: Order[] }>();
  pendingOrders.forEach(order => {
    if (!userMap.has(order.usuario)) {
      const roleLabel =
        order.usuarioRole === 'admin' ? 'Administrador' :
        order.usuarioRole === 'loja' ? 'Loja' : 'Analista';
      userMap.set(order.usuario, { nome: order.usuarioNome, role: roleLabel, orders: [] });
    }
    userMap.get(order.usuario)!.orders.push(order);
  });

  // ── Collect all unique product codes across all orders (for soma final)
  // productTotals: { codigo → { nome, qtdMin, totals: { userLogin → qty } } }
  const productTotals = new Map<string, {
    nome: string;
    qtdMin: number;
    totals: Map<string, number>;
  }>();

  pendingOrders.forEach(order => {
    order.itens.forEach(item => {
      if (!productTotals.has(item.codigo_produto)) {
        productTotals.set(item.codigo_produto, {
          nome: item.nome,
          qtdMin: item.quantidade_minima_camada,
          totals: new Map(),
        });
      }
      const prod = productTotals.get(item.codigo_produto)!;
      const cur = prod.totals.get(order.usuario) ?? 0;
      prod.totals.set(order.usuario, cur + item.quantidade);
    });
  });

  const userLogins = Array.from(userMap.keys());
  const FIXED_COLS = 6; // Código | Produto | Qtd Mín | Qtd Pedida | Total | Usuário

  // ════════════════════════════════════════════
  //  BUILD SHEET 1 — Detalhe por Usuário
  // ════════════════════════════════════════════
  const aoa: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];

  const now = new Date();
  const nowStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // Title
  aoa.push(['PEDIDOS PENDENTES — CONSOLIDADO POR USUÁRIO']);
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: FIXED_COLS - 1 } });
  aoa.push([`Gerado em: ${nowStr}`]);
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: FIXED_COLS - 1 } });

  const COL_HEADERS = ['Código', 'Produto', 'Qtd Mín Camada', 'Quantidade Pedida', 'Total', 'Usuário'];

  userMap.forEach((userData, _userLogin) => {
    // ── Section separator: user block header
    aoa.push([]); // blank
    const sepRow = aoa.length;
    aoa.push([`► USUÁRIO: ${userData.nome} (${userData.role})`]);
    merges.push({ s: { r: sepRow, c: 0 }, e: { r: sepRow, c: FIXED_COLS - 1 } });

    // Column headers
    aoa.push(COL_HEADERS);

    // ── All items from all orders of this user
    let userTotal = 0;

    // Aggregate items by product for this user
    const userProductMap = new Map<string, {
      nome: string;
      qtdMin: number;
      quantidade: number;
    }>();

    userData.orders.forEach(order => {
      order.itens.forEach(item => {
        const key = item.codigo_produto;
        if (!userProductMap.has(key)) {
          userProductMap.set(key, {
            nome: item.nome,
            qtdMin: item.quantidade_minima_camada,
            quantidade: 0,
          });
        }
        userProductMap.get(key)!.quantidade += item.quantidade;
      });
    });

    userProductMap.forEach((item, codigo) => {
      userTotal += item.quantidade;
      aoa.push([
        codigo,
        item.nome,
        item.qtdMin,
        item.quantidade,
        item.quantidade,  // Total column = quantidade (por usuário)
        userData.nome,
      ]);
    });

    // Subtotal row
    aoa.push(['', `Subtotal — ${userData.nome}`, '', '', userTotal, '']);
    aoa.push([]); // spacer
  });

  // ── SOMA CONSOLIDADA POR PRODUTO
  aoa.push([]); // blank
  const somaHeaderRow = aoa.length;
  aoa.push(['SOMA CONSOLIDADA POR PRODUTO (todos os usuários)']);
  merges.push({ s: { r: somaHeaderRow, c: 0 }, e: { r: somaHeaderRow, c: FIXED_COLS - 1 + userLogins.length } });

  // Dynamic headers: Código | Produto | Qtd Mín | [user1] | [user2] | ... | SOMA TOTAL
  const somaColHeaders: string[] = ['Código', 'Produto', 'Qtd Mín Camada'];
  userLogins.forEach(ul => {
    somaColHeaders.push(userMap.get(ul)!.nome);
  });
  somaColHeaders.push('SOMA TOTAL');
  aoa.push(somaColHeaders);

  // One row per product
  productTotals.forEach((prod, codigo) => {
    const row: (string | number)[] = [codigo, prod.nome, prod.qtdMin];
    let soma = 0;
    userLogins.forEach(ul => {
      const qty = prod.totals.get(ul) ?? 0;
      soma += qty;
      row.push(qty > 0 ? qty : '');
    });
    row.push(soma);
    aoa.push(row);
  });

  // Grand total row
  const grandRow: (string | number)[] = ['', 'TOTAL GERAL', ''];
  let grandTotal = 0;
  userLogins.forEach(ul => {
    let userSum = 0;
    productTotals.forEach(prod => {
      userSum += prod.totals.get(ul) ?? 0;
    });
    grandTotal += userSum;
    grandRow.push(userSum);
  });
  grandRow.push(grandTotal);
  aoa.push(grandRow);

  // Build worksheet
  const ws1 = XLSX.utils.aoa_to_sheet(aoa);
  ws1['!merges'] = merges;

  // Column widths: Código(14) | Produto(30) | QtdMin(20) | QtdPedida(18) | Total(14) | Usuário(22) | extra user cols | SOMA(14)
  const colWidths = [14, 32, 20, 18, 14, 24];
  userLogins.forEach(() => colWidths.push(20)); // dynamic user columns in soma table
  colWidths.push(14); // SOMA TOTAL
  setCols(ws1, colWidths);

  ws1['!freeze'] = { xSplit: 0, ySplit: 3 } as any;

  XLSX.utils.book_append_sheet(wb, ws1, 'Consolidado por Usuário');

  // ════════════════════════════════════════════
  //  BUILD SHEET 2 — Soma Final por Produto
  //  (resumo limpo: Código | Produto | QtdMin | [users] | SOMA TOTAL)
  // ════════════════════════════════════════════
  const aoa2: (string | number)[][] = [];

  aoa2.push(['RESUMO — SOMA POR PRODUTO']);
  aoa2.push([`Gerado em: ${nowStr}`]);
  aoa2.push([]);

  const resumoHeaders: string[] = ['Código', 'Produto', 'Qtd Mín Camada'];
  userLogins.forEach(ul => resumoHeaders.push(userMap.get(ul)!.nome));
  resumoHeaders.push('SOMA TOTAL');
  aoa2.push(resumoHeaders);

  productTotals.forEach((prod, codigo) => {
    const row: (string | number)[] = [codigo, prod.nome, prod.qtdMin];
    let soma = 0;
    userLogins.forEach(ul => {
      const qty = prod.totals.get(ul) ?? 0;
      soma += qty;
      row.push(qty > 0 ? qty : '');
    });
    row.push(soma);
    aoa2.push(row);
  });

  // Grand totals
  const gRow: (string | number)[] = ['', 'TOTAL GERAL', ''];
  let gTotal = 0;
  userLogins.forEach(ul => {
    let s = 0;
    productTotals.forEach(p => { s += p.totals.get(ul) ?? 0; });
    gTotal += s;
    gRow.push(s);
  });
  gRow.push(gTotal);
  aoa2.push(gRow);

  const ws2 = XLSX.utils.aoa_to_sheet(aoa2);
  const ws2Widths = [14, 32, 20];
  userLogins.forEach(() => ws2Widths.push(20));
  ws2Widths.push(14);
  setCols(ws2, ws2Widths);
  ws2['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: resumoHeaders.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: resumoHeaders.length - 1 } },
  ];
  ws2['!freeze'] = { xSplit: 0, ySplit: 4 } as any;

  XLSX.utils.book_append_sheet(wb, ws2, 'Resumo por Produto');

  const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  XLSX.writeFile(wb, `pedidos_consolidados_${dateStr}.xlsx`);
}

// ─────────────────────────────────────────────────────────────
// 3. EXPORT REPORT
// ─────────────────────────────────────────────────────────────
export function exportReportToExcel(
  orders: Order[],
  period: string,
  userFilter?: string
) {
  const filteredOrders = userFilter
    ? orders.filter(o => o.usuario === userFilter)
    : orders;

  const wb = XLSX.utils.book_new();

  // Summary sheet
  const productMap = new Map<string, { nome: string; qtdMin: number; total: number; pedidos: number }>();
  filteredOrders.forEach(order => {
    order.itens.forEach(item => {
      const existing = productMap.get(item.codigo_produto);
      if (existing) {
        existing.total += item.quantidade;
        existing.pedidos += 1;
      } else {
        productMap.set(item.codigo_produto, {
          nome: item.nome,
          qtdMin: item.quantidade_minima_camada,
          total: item.quantidade,
          pedidos: 1,
        });
      }
    });
  });

  const summaryData = Array.from(productMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cod, info]) => ({
      'Código': cod,
      'Produto': info.nome,
      'Qtd Mínima Camada': info.qtdMin,
      'Nº de Pedidos': info.pedidos,
      'Total Pedido': info.total,
    }));

  const ws = XLSX.utils.json_to_sheet(summaryData);
  ws['!cols'] = [
    { wch: 12 }, { wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, `Relatório ${period}`);

  const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const userSuffix = userFilter ? `_${userFilter}` : '';
  XLSX.writeFile(wb, `relatorio_${period}${userSuffix}_${dateStr}.xlsx`);
}

// ─────────────────────────────────────────────────────────────
// 4. IMPORT PRODUCTS FROM EXCEL
// ─────────────────────────────────────────────────────────────
export function importProductsFromExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
