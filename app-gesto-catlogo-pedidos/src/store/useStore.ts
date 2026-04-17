import { useState, useCallback, useEffect, useRef } from 'react';
import { Product, User, CartItem, Order, OrderItem, AppSettings } from '../types';
import {
  FIREBASE_ENABLED,
  COLLECTIONS,
  fbSet,
  fbGetAll,
  fbDelete,
  fbListen,
  isDbReady,
} from '../firebase/config';

// ─── Storage keys ────────────────────────────────────────────────────────────
const SK = {
  PRODUCTS:      'catalog_products',
  USERS:         'catalog_users',
  CART:          'catalog_cart',
  ORDERS:        'catalog_orders',
  CURRENT_USER:  'catalog_current_user',
  SETTINGS:      'catalog_settings',
  ORDER_COUNTER: 'catalog_order_counter',
  KEEP_LOGGED:   'catalog_keep_logged',
};

// ─── Default data ─────────────────────────────────────────────────────────────
export const defaultProducts: Product[] = [
  { codigo: 'FL001', nome: 'Rosa Vermelha',        descricao: 'Rosa vermelha premium, pétalas aveludadas',         categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1548460781-c5c5d27f1a7b?w=400&q=80', quantidade_minima_camada: 12, vasos_bandeja: 6 },
  { codigo: 'FL002', nome: 'Girassol Amarelo',      descricao: 'Girassol vibrante, ideal para decoração',           categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80', quantidade_minima_camada: 10, vasos_bandeja: 5 },
  { codigo: 'FL003', nome: 'Orquídea Phalaenopsis', descricao: 'Orquídea branca elegante, longa durabilidade',      categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1615819316200-6a5fcdb47e69?w=400&q=80', quantidade_minima_camada: 8,  vasos_bandeja: 4 },
  { codigo: 'FL004', nome: 'Lírio do Vale',         descricao: 'Lírio delicado, perfume suave',                     categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1490750967868-88df5691cc54?w=400&q=80', quantidade_minima_camada: 15, vasos_bandeja: 5 },
  { codigo: 'FL005', nome: 'Margarida Branca',      descricao: 'Margarida clássica, ideal para jardins',            categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', quantidade_minima_camada: 20, vasos_bandeja: 10 },
  { codigo: 'FL006', nome: 'Lavanda Provence',      descricao: 'Lavanda aromática, relaxante natural',              categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?w=400&q=80', quantidade_minima_camada: 12, vasos_bandeja: 6 },
  { codigo: 'FL007', nome: 'Tulipa Holandesa',      descricao: 'Tulipa colorida importada da Holanda',              categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=400&q=80', quantidade_minima_camada: 10, vasos_bandeja: 5 },
  { codigo: 'FL008', nome: 'Antúrio Vermelho',      descricao: 'Antúrio tropical, resistente e bonito',             categoria: 'Flor',   imagem: 'https://images.unsplash.com/photo-1612804726699-b5f40c43eed4?w=400&q=80', quantidade_minima_camada: 6,  vasos_bandeja: 3 },
  { codigo: 'PL001', nome: 'Suculenta Echeveria',   descricao: 'Suculenta compacta, baixa manutenção',              categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&q=80', quantidade_minima_camada: 20, vasos_bandeja: 10 },
  { codigo: 'PL002', nome: 'Samambaia Nephrolepis', descricao: 'Samambaia exuberante para ambientes internos',      categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80', quantidade_minima_camada: 8,  vasos_bandeja: 4 },
  { codigo: 'PL003', nome: 'Cacto Columnar',        descricao: 'Cacto resistente, decorativo e elegante',           categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80', quantidade_minima_camada: 15, vasos_bandeja: 5 },
  { codigo: 'PL004', nome: 'Bromelia Imperialis',   descricao: 'Bromelia tropical de grande beleza',                categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=400&q=80', quantidade_minima_camada: 6,  vasos_bandeja: 3 },
  { codigo: 'PL005', nome: 'Espada de São Jorge',   descricao: 'Planta de sorte, purifica o ar',                   categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&q=80', quantidade_minima_camada: 10, vasos_bandeja: 5 },
  { codigo: 'PL006', nome: 'Singônio Verde',        descricao: 'Folhagem tropical, ideal para interiores',          categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1620803366004-119b57f54cd6?w=400&q=80', quantidade_minima_camada: 12, vasos_bandeja: 6 },
  { codigo: 'PL007', nome: 'Palmeira Areca',        descricao: 'Palmeira elegante, umidificador natural',           categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1544931170-8ca39f00e9b8?w=400&q=80', quantidade_minima_camada: 6,  vasos_bandeja: 3 },
  { codigo: 'PL008', nome: 'Begônia Dupla',         descricao: 'Begônia florida, cores vibrantes',                  categoria: 'Planta', imagem: 'https://images.unsplash.com/photo-1616411550839-54e4b0ded81b?w=400&q=80', quantidade_minima_camada: 18, vasos_bandeja: 6 },
];

export const defaultUsers: User[] = [
  { id: 'u1', nome: 'Administrador',   login: 'admin',    senha: 'admin123',    email: 'admin@catalogo.com',    role: 'admin'    },
  { id: 'u2', nome: 'Loja Central',    login: 'loja',     senha: 'loja123',     email: 'loja@catalogo.com',     role: 'loja'     },
  { id: 'u3', nome: 'Analista Flores', login: 'analista', senha: 'analista123', email: 'analista@catalogo.com', role: 'analista' },
];

const defaultSettings: AppSettings = {
  emailLogistica: 'logistica@catalogo.com',
  nomeEmpresa:    'Catálogo de Flores e Plantas',
  darkMode:       false,
};

// ─── localStorage helpers ────────────────────────────────────────────────────
function load<T>(key: string, def: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return def;
    return JSON.parse(v) as T;
  } catch {
    return def;
  }
}

function save<T>(key: string, v: T) {
  try { localStorage.setItem(key, JSON.stringify(v)); }
  catch (e) { console.error('Storage error:', e); }
}

// ─── Validators ───────────────────────────────────────────────────────────────
function isValidProduct(p: unknown): p is Product {
  if (!p || typeof p !== 'object') return false;
  const x = p as Record<string, unknown>;
  return (
    typeof x.codigo === 'string' && x.codigo.length > 0 &&
    typeof x.nome === 'string' && x.nome.length > 0 &&
    typeof x.descricao === 'string' &&
    (x.categoria === 'Flor' || x.categoria === 'Planta') &&
    typeof x.quantidade_minima_camada === 'number' &&
    typeof x.vasos_bandeja === 'number'
  );
}

function isValidUser(u: unknown): u is User {
  if (!u || typeof u !== 'object') return false;
  const x = u as Record<string, unknown>;
  return (
    typeof x.id === 'string' && x.id.length > 0 &&
    typeof x.nome === 'string' && x.nome.length > 0 &&
    typeof x.login === 'string' && x.login.length > 0 &&
    typeof x.senha === 'string' &&
    (x.role === 'admin' || x.role === 'loja' || x.role === 'analista')
  );
}

function isValidOrder(o: unknown): o is Order {
  if (!o || typeof o !== 'object') return false;
  const x = o as Record<string, unknown>;
  return (
    typeof x.id === 'string' && x.id.length > 0 &&
    typeof x.numero === 'number' &&
    typeof x.usuario === 'string' &&
    Array.isArray(x.itens) &&
    (x.status === 'pendente' || x.status === 'concluido')
  );
}

// ─── Singleton guard — prevents double-init in React StrictMode ──────────────
let _firebaseInitDone = false;

// ─── Main store hook ─────────────────────────────────────────────────────────
export function useStore() {
  const [products, setProductsState] = useState<Product[]>(() =>
    load<Product[]>(SK.PRODUCTS, defaultProducts).filter(isValidProduct)
  );
  const [users, setUsersState] = useState<User[]>(() =>
    load<User[]>(SK.USERS, defaultUsers).filter(isValidUser)
  );
  const [cart, setCartState] = useState<CartItem[]>(() =>
    load<CartItem[]>(SK.CART, [])
  );
  const [orders, setOrdersState] = useState<Order[]>(() =>
    load<Order[]>(SK.ORDERS, []).filter(isValidOrder)
  );
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      if (load<boolean>(SK.KEEP_LOGGED, false)) {
        const u = load<User | null>(SK.CURRENT_USER, null);
        return u && isValidUser(u) ? u : null;
      }
    } catch { /* ignore */ }
    return null;
  });
  const [settings, setSettingsState] = useState<AppSettings>(() =>
    load<AppSettings>(SK.SETTINGS, defaultSettings)
  );
  const [orderCounter, setOrderCounterState] = useState<number>(() =>
    load<number>(SK.ORDER_COUNTER, 1)
  );
  const [firebaseStatus, setFirebaseStatus] = useState<'offline' | 'online' | 'syncing'>(
    FIREBASE_ENABLED && isDbReady() ? 'syncing' : 'offline'
  );

  // Use ref so callbacks always have latest setters
  const setProducts = useRef(setProductsState);
  const setUsers    = useRef(setUsersState);
  const setOrders   = useRef(setOrdersState);
  setProducts.current = setProductsState;
  setUsers.current    = setUsersState;
  setOrders.current   = setOrdersState;

  const seedingRef = useRef(false);
  const mountedRef = useRef(true);

  // ── Firebase init ──────────────────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;

    if (!FIREBASE_ENABLED || !isDbReady()) {
      setFirebaseStatus('offline');
      return;
    }

    // Only init once globally across StrictMode double-renders
    if (_firebaseInitDone) {
      setFirebaseStatus('online');
      return;
    }

    const init = async () => {
      if (!mountedRef.current) return;
      setFirebaseStatus('syncing');

      try {
        // Step 1: Pull existing data
        const [fbProds, fbUsers, fbOrds] = await Promise.all([
          fbGetAll<Product>(COLLECTIONS.PRODUCTS),
          fbGetAll<User>(COLLECTIONS.USERS),
          fbGetAll<Order>(COLLECTIONS.ORDERS),
        ]);

        if (!mountedRef.current) return;

        const vProds = fbProds.filter(isValidProduct);
        const vUsers  = fbUsers.filter(isValidUser);
        const vOrds   = fbOrds.filter(isValidOrder);

        // Step 2: Seed if empty, else apply Firebase data
        seedingRef.current = true;

        if (vProds.length === 0) {
          const local = load<Product[]>(SK.PRODUCTS, defaultProducts).filter(isValidProduct);
          const toSeed = local.length > 0 ? local : defaultProducts;
          await Promise.all(toSeed.map(p => fbSet(COLLECTIONS.PRODUCTS, p.codigo, p)));
        } else {
          if (mountedRef.current) {
            setProducts.current(vProds);
            save(SK.PRODUCTS, vProds);
          }
        }

       if (vUsers.length === 0) {
  console.log("Criando usuários no Firebase...");
  await Promise.all(defaultUsers.map(u => 
    fbSet(COLLECTIONS.USERS, u.id, u)
  ));
} else {
          if (mountedRef.current) {
            setUsers.current(vUsers);
            save(SK.USERS, vUsers);
          }
        }

        if (vOrds.length > 0 && mountedRef.current) {
          setOrders.current(vOrds);
          save(SK.ORDERS, vOrds);
        }

        seedingRef.current = false;
        if (!mountedRef.current) return;

        // Step 3: Set up real-time listeners
        const unsubProds = fbListen<Product>(
          COLLECTIONS.PRODUCTS,
          (items) => {
            if (seedingRef.current) return;
            const valid = items.filter(isValidProduct);
            if (valid.length > 0) {
              setProducts.current(valid);
              save(SK.PRODUCTS, valid);
            }
          },
          () => setFirebaseStatus('offline')
        );

        const unsubUsers = fbListen<User>(
          COLLECTIONS.USERS,
          (items) => {
            if (seedingRef.current) return;
            const valid = items.filter(isValidUser);
            if (valid.length > 0) {
              setUsers.current(valid);
              save(SK.USERS, valid);
            }
          }
        );

        const unsubOrds = fbListen<Order>(
          COLLECTIONS.ORDERS,
          (items) => {
            const valid = items.filter(isValidOrder);
            setOrders.current(valid);
            save(SK.ORDERS, valid);
          }
        );

        // Store unsubs for cleanup (unused var suppressed)
        void [unsubProds, unsubUsers, unsubOrds];
        _firebaseInitDone = true;

        if (mountedRef.current) {
          setFirebaseStatus('online');
          console.log('[Store] ✅ Firebase sync ativo');
        }
      } catch (e) {
        console.error('[Store] Firebase init error:', e);
        if (mountedRef.current) {
          setFirebaseStatus('offline');
          seedingRef.current = false;
        }
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      // Don't unsub on StrictMode unmount — only on real unmount
      // _unsubscribers will persist across re-mounts
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────────
  const setCurrentUser = useCallback((u: User | null, keepLoggedIn = false) => {
    setCurrentUserState(u);
    save(SK.CURRENT_USER, u);
    save(SK.KEEP_LOGGED, keepLoggedIn);
  }, []);

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s);
    save(SK.SETTINGS, s);
    if (FIREBASE_ENABLED && isDbReady()) {
      fbSet(COLLECTIONS.SETTINGS, 'global', s);
    }
  }, []);

  // ── Cart ───────────────────────────────────────────────────────────────────
  const addToCart = useCallback((product: Product, quantidade: number) => {
    setCartState(prev => {
      const existing = prev.find(i => i.produto.codigo === product.codigo);
      let updated: CartItem[];
      if (existing) {
        const newQty = existing.quantidade + quantidade;
        if (newQty <= 0) {
          updated = prev.filter(i => i.produto.codigo !== product.codigo);
        } else {
          updated = prev.map(i =>
            i.produto.codigo === product.codigo ? { ...i, quantidade: newQty } : i
          );
        }
      } else if (quantidade > 0) {
        updated = [...prev, { produto: product, quantidade }];
      } else {
        updated = prev;
      }
      save(SK.CART, updated);
      return updated;
    });
  }, []);

  const updateCartItem = useCallback((codigo: string, quantidade: number) => {
    setCartState(prev => {
      const updated = quantidade <= 0
        ? prev.filter(i => i.produto.codigo !== codigo)
        : prev.map(i => i.produto.codigo === codigo ? { ...i, quantidade } : i);
      save(SK.CART, updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((codigo: string) => {
    setCartState(prev => {
      const updated = prev.filter(i => i.produto.codigo !== codigo);
      save(SK.CART, updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartState([]);
    save(SK.CART, []);
  }, []);

  // ── Orders ─────────────────────────────────────────────────────────────────
const finalizeOrder = useCallback((user: User, cartItems: CartItem[]): Order | null => {
  if (!user || cartItems.length === 0) return null;

  const now = new Date();
  const data = now.toLocaleDateString('pt-BR');
  const hora = now.toLocaleTimeString('pt-BR');

  const counter = load<number>(SK.ORDER_COUNTER, 1);
  const newCounter = counter + 1;

  save(SK.ORDER_COUNTER, newCounter);
  setOrderCounterState(newCounter);

  const itens: OrderItem[] = cartItems.map(item => ({
    codigo_produto: item.produto.codigo,
    nome: item.produto.nome,
    quantidade: item.quantidade,
    quantidade_minima_camada: item.produto.quantidade_minima_camada,
    vasos_bandeja: item.produto.vasos_bandeja,
    bandejas: Math.ceil(item.quantidade / (item.produto.vasos_bandeja || 1)),
  }));

  const order: Order = {
    id:`ORD-${Date.now()}`,
    numero: counter,
    usuario: user.login,
    usuarioNome: user.nome,
    usuarioRole: user.role,
    data,
    hora,
    dataISO: now.toISOString(),
    itens,
    status: 'pendente',
  };

  console.log("PEDIDO ENVIADO:", JSON.stringify(order));

  if (FIREBASE_ENABLED && isDbReady()) {
    fbSet(COLLECTIONS.ORDERS, order.id, order)
      .then(() => {
        setOrdersState(prev => {
          const updated = [order, ...prev];
          save(SK.ORDERS, updated);
          return updated;
        });
      })
      .catch(err => {
        console.error("ERRO AO SALVAR PEDIDO:", err);

        setOrdersState(prev => {
          const updated = [order, ...prev];
          save(SK.ORDERS, updated);
          return updated;
        });
      });
  } else {
    setOrdersState(prev => {
      const updated = [order, ...prev];
      save(SK.ORDERS, updated);
      return updated;
    });
  }

  setCartState([]);
  save(SK.CART, []);

  return order;

}, []);

// 🔍 DEBUG
console.log("PEDIDO ENVIADO:", JSON.stringify(order));

if (FIREBASE_ENABLED && isDbReady()) {
  fbSet(COLLECTIONS.ORDERS, order.id, order)
    .then(ok => {
      console.log("SALVOU NO FIREBASE?", ok);

      if (!ok) {
        console.warn("Firebase falhou, salvando local");
        setOrdersState(prev => [order, ...prev.slice(0, 20)]);
      } else {
        setOrdersState(prev => {
          const updated = [order, ...prev];
          save(SK.ORDERS, updated);
          return updated;
        });
      }
    })
    .catch(err => {
      console.error("ERRO AO SALVAR PEDIDO:", err);
      setOrdersState(prev => [order, ...prev.slice(0, 20)]);
    });

} else {
  setOrdersState(prev => {
    const updated = [order, ...prev];
    save(SK.ORDERS, updated);
    return updated;
  });
}

setCartState([]);
save(SK.CART, []);

return order;

}, []);
  // ── Products ───────────────────────────────────────────────────────────────
const addProduct = useCallback((product) => {
  if (FIREBASE_ENABLED && isDbReady()) {
    fbSet(COLLECTIONS.PRODUCTS, product.codigo, product);
  } else {
    setProductsState(prev => {
      const updated = [
        ...prev.filter(p => p.codigo !== product.codigo),
        product
      ];
      save(SK.PRODUCTS, updated);
      return updated;
    });
  }
}, []);

const updateProduct = useCallback((product) => {
  if (FIREBASE_ENABLED && isDbReady()) {
    fbSet(COLLECTIONS.PRODUCTS, product.codigo, product);
  } else {
    setProductsState(prev => {
      const updated = prev.map(p =>
        p.codigo === product.codigo ? product : p
      );
      save(SK.PRODUCTS, updated);
      return updated;
    });
  }
}, []);

  const deleteProduct = useCallback((codigo: string) => {
    if (FIREBASE_ENABLED && isDbReady()) {
      fbDelete(COLLECTIONS.PRODUCTS, codigo);
    } else {
      setProductsState(prev => {
        const updated = prev.filter(p => p.codigo !== codigo);
        save(SK.PRODUCTS, updated);
        return updated;
      });
    }
  }, []);

  // ── Users ──────────────────────────────────────────────────────────────────
const addUser = useCallback((user: User) => {
  const newUser = {
  ...user,
  id: user.id || `user-${Date.now()}`
};

  if (FIREBASE_ENABLED && isDbReady()) {
    fbSet(COLLECTIONS.USERS, newUser.id, newUser);
  } else {
    setUsersState(prev => {
      const updated = [...prev, newUser];
      save(SK.USERS, updated);
      return updated;
    });
  }
}, []);

  const updateUser = useCallback((user: User) => {
    if (FIREBASE_ENABLED && isDbReady()) {
      fbSet(COLLECTIONS.USERS, user.id, user);
    } else {
      setUsersState(prev => {
        const updated = prev.map(u => u.id === user.id ? user : u);
        save(SK.USERS, updated);
        return updated;
      });
    }
  }, []);

  const deleteUser = useCallback((id: string) => {
    if (FIREBASE_ENABLED && isDbReady()) {
      fbDelete(COLLECTIONS.USERS, id);
    } else {
      setUsersState(prev => {
        const updated = prev.filter(u => u.id !== id);
        save(SK.USERS, updated);
        return updated;
      });
    }
  }, []);

  // ── Order status ───────────────────────────────────────────────────────────
  const completeOrder = useCallback((id: string) => {
    setOrdersState(prev => {
      const order = prev.find(o => o.id === id);
      if (!order) return prev;
      const updated_order = { ...order, status: 'concluido' as const };
      const updated = prev.map(o => o.id === id ? updated_order : o);
      save(SK.ORDERS, updated);
      if (FIREBASE_ENABLED && isDbReady()) {
        fbSet(COLLECTIONS.ORDERS, id, updated_order);
      }
      return updated;
    });
  }, []);

  const deleteOrder = useCallback((id: string) => {
    if (FIREBASE_ENABLED && isDbReady()) {
      fbDelete(COLLECTIONS.ORDERS, id);
    } else {
      setOrdersState(prev => {
        const updated = prev.filter(o => o.id !== id);
        save(SK.ORDERS, updated);
        return updated;
      });
    }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const cartCount     = cart.reduce((sum, i) => sum + i.quantidade, 0);
  const cartItemCount = cart.length;

  return {
    products, addProduct, updateProduct, deleteProduct,
    users, addUser, updateUser, deleteUser,
    cart, cartCount, cartItemCount, addToCart, updateCartItem, removeFromCart, clearCart,
    orders, finalizeOrder, completeOrder, deleteOrder,
    currentUser, setCurrentUser,
    settings, setSettings,
    firebaseStatus,
    orderCounter,
  };
}
