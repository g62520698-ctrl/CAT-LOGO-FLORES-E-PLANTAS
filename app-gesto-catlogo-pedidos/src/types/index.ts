export type Category = 'Flor' | 'Planta';
export type UserRole = 'admin' | 'loja' | 'analista';
export type OrderStatus = 'pendente' | 'concluido';

export interface Product {
  codigo: string;
  nome: string;
  descricao: string;
  categoria: Category;
  imagem: string;
  quantidade_minima_camada: number;
  vasos_bandeja: number;
}

export interface User {
  id: string;
  nome: string;
  login: string;
  senha: string;
  email: string;
  role: UserRole;
}

export interface CartItem {
  produto: Product;
  quantidade: number;
}

export interface OrderItem {
  codigo_produto: string;
  nome: string;
  descricao: string;
  quantidade: number;
  quantidade_minima_camada: number;
  vasos_bandeja: number;
  bandejas: number;
  imagem: string;
}

export interface Order {
  id: string;
  numero: number;
  usuario: string;
  usuarioNome: string;
  usuarioRole: UserRole;
  data: string;
  hora: string;
  dataISO: string;
  itens: OrderItem[];
  status: OrderStatus;
}

export type TabId = 'catalogo' | 'carrinho' | 'pedidos' | 'relatorios' | 'usuarios' | 'configuracoes';

export interface AppSettings {
  emailLogistica: string;
  nomeEmpresa: string;
  darkMode: boolean;
}
