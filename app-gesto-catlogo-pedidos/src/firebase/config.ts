// =====================================================
// CONFIGURAÇÃO FIREBASE – Catálogo de Flores e Plantas
// =====================================================

import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
  DocumentData,
  QuerySnapshot,
  enableIndexedDbPersistence,
} from 'firebase/firestore';

// ─── Credenciais do projeto Firebase ───────────────────────────────────────
const firebaseConfig = {
  apiKey:            'AIzaSyBJJ9E0_NvOihd2nKIClRzcmpvndeK6L2o',
  authDomain:        'catalog-82ce0.firebaseapp.com',
  projectId:         'catalog-82ce0',
  storageBucket:     'catalog-82ce0.firebasestorage.app',
  messagingSenderId: '494897729548',
  appId:             '1:494897729548:web:58ccf777ea558d02e8de29',
};

export const FIREBASE_ENABLED = true;

// ─── Inicialização segura ────────────────────────────────────────────────────
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let _dbReady = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);

  // Habilita persistência offline (IndexedDB) – ignora erros se já habilitado
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open — persistence only available in one tab at a time
      console.warn('[Firebase] Persistence unavailable (multiple tabs)');
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support it
      console.warn('[Firebase] Persistence not supported in this browser');
    }
  });

  _dbReady = true;
  console.log('[Firebase] ✅ Inicializado —', firebaseConfig.projectId);
} catch (e) {
  console.error('[Firebase] ❌ Falha na inicialização:', e);
  _dbReady = false;
}

export function isDbReady(): boolean {
  return _dbReady && db !== null;
}

// ─── Coleções ──────────────────────────────────────────────────────────────
export const COLLECTIONS = {
  PRODUCTS : 'produtos',
  USERS    : 'usuarios',
  ORDERS   : 'pedidos',
  SETTINGS : 'configuracoes',
} as const;

// ─── Guard interno ─────────────────────────────────────────────────────────
function getDb(): Firestore {
  if (!db) throw new Error('Firestore não inicializado');
  return db;
}

// ─── CRUD helpers ──────────────────────────────────────────────────────────

/** Salva / atualiza um documento completo */
export async function fbSet(col: string, id: string, data: object): Promise<boolean> {
  try {
    await setDoc(doc(getDb(), col, id), data);
    return true;
  } catch (e) {
    console.error('[Firebase] fbSet error:', col, id, e);
    return false;
  }
}

/** Merge parcial */
export async function fbMerge(col: string, id: string, data: object): Promise<boolean> {
  try {
    await setDoc(doc(getDb(), col, id), data, { merge: true });
    return true;
  } catch (e) {
    console.error('[Firebase] fbMerge error:', col, id, e);
    return false;
  }
}

/** Lê um único documento */
export async function fbGet<T>(col: string, id: string): Promise<T | null> {
  try {
    const snap = await getDoc(doc(getDb(), col, id));
    return snap.exists() ? (snap.data() as T) : null;
  } catch (e) {
    console.error('[Firebase] fbGet error:', e);
    return null;
  }
}

/** Lista todos os documentos de uma coleção */
export async function fbGetAll<T>(col: string): Promise<T[]> {
  try {
    const snap = await getDocs(collection(getDb(), col));
    return snap.docs.map(d => d.data() as T);
  } catch (e) {
    console.error('[Firebase] fbGetAll error:', e);
    return [];
  }
}

/** Exclui um documento */
export async function fbDelete(col: string, id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(getDb(), col, id));
    return true;
  } catch (e) {
    console.error('[Firebase] fbDelete error:', e);
    return false;
  }
}

/**
 * Escuta mudanças em tempo real numa coleção.
 * Retorna unsubscribe function.
 */
export function fbListen<T>(
  col: string,
  callback: (items: T[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  try {
    return onSnapshot(
      collection(getDb(), col),
      (snap: QuerySnapshot<DocumentData>) => {
        try {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
          callback(items);
        } catch (e) {
          console.error('[Firebase] fbListen callback error:', col, e);
        }
      },
      (error) => {
        console.error('[Firebase] fbListen stream error:', col, error);
        onError?.(error);
      }
    );
  } catch (e) {
    console.error('[Firebase] fbListen setup error:', col, e);
    return () => {};
  }
}

export { db };
