import { useState, useRef } from 'react';
import { Product, User, Category } from '../types';
import {
  Search, Plus, Edit2, Trash2, ShoppingCart, X,
  Upload, Image as ImageIcon,
  Package, Flower2, Leaf, Check, AlertCircle, Minus, ChevronDown, ChevronUp,
} from 'lucide-react';
import { importProductsFromExcel } from '../utils/excel';

interface Props {
  products: Product[];
  currentUser: User;
  cart: { produto: Product; quantidade: number }[];
  onAddToCart: (product: Product, qty: number) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (codigo: string) => void;
  darkMode?: boolean;
}

type FilterCategory = 'Todas' | Category;

const emptyProduct: Product = {
  codigo: '', nome: '', descricao: '', categoria: 'Flor',
  imagem: '', quantidade_minima_camada: 0, vasos_bandeja: 0,
};

const S = {
  /* shared inline styles */
  inputBase: {
    background: 'rgba(5,15,9,0.6)',
    border: '1px solid #1e4530',
    color: '#e8fdf0',
    borderRadius: '0.75rem',
    padding: '0.75rem 0.9rem',
    fontSize: '16px',          /* >= 16px prevents iOS auto-zoom on focus */
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    display: 'block',
    WebkitAppearance: 'none',
  } as React.CSSProperties,
};

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange }: {
  label: string; value: number; onChange: (v: number) => void;
}) {
  // Use controlled string state so user can clear the field and type freely
  const [raw, setRaw] = useState(String(value));

  // Keep raw in sync when value changes externally (e.g. +/- buttons)
  const prevValue = useRef(value);
  if (prevValue.current !== value) {
    prevValue.current = value;
    setRaw(String(value));
  }

  const commit = (str: string) => {
    const parsed = parseInt(str.replace(/[^0-9]/g, ''), 10);
    const next = isNaN(parsed) ? 0 : Math.max(0, parsed);
    onChange(next);
    setRaw(String(next));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits while typing
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    setRaw(cleaned);
    if (cleaned !== '') {
      const parsed = parseInt(cleaned, 10);
      if (!isNaN(parsed)) onChange(Math.max(0, parsed));
    }
  };

  const dec = () => { const next = Math.max(0, value - 1); onChange(next); setRaw(String(next)); };
  const inc = () => { const next = value + 1;               onChange(next); setRaw(String(next)); };

  return (
    <div style={{ width: '100%' }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.05em',
        color: '#86efac', marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', borderRadius: 12,
        border: '1.5px solid #1e4530',
        background: 'rgba(0,0,0,0.3)', width: '100%', overflow: 'hidden',
      }}>
        {/* − button */}
        <button
          type="button"
          onClick={dec}
          style={{
            width: 52, height: 52, flexShrink: 0,
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderRight: '1px solid #1e4530',
            fontSize: 22, fontWeight: 700,
          }}
        >
          <Minus size={18} />
        </button>

        {/* Editable input — mobile-safe: text + inputMode numeric */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          className="stepper-input"
          value={raw}
          onChange={handleChange}
          onFocus={e => e.target.select()}
          onBlur={e => commit(e.target.value)}
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 22,        /* >= 16px prevents iOS auto-zoom */
            fontWeight: 800,
            color: '#e8fdf0',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '0 4px',
            height: 52,
            width: '100%',
            minWidth: 0,
            caretColor: '#4ade80',
          } as React.CSSProperties}
        />

        {/* + button */}
        <button
          type="button"
          onClick={inc}
          style={{
            width: 52, height: 52, flexShrink: 0,
            background: 'rgba(34,197,94,0.15)', color: '#4ade80',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderLeft: '1px solid #1e4530',
            fontSize: 22, fontWeight: 700,
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      <p style={{ fontSize: 10, color: '#4d7a5e', marginTop: 4, textAlign: 'center' }}>
        Toque no número para digitar · Use + e − para ajustar
      </p>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel }: {
  initial: Product; onSave: (p: Product) => void; onCancel: () => void;
}) {
  const [form, setForm]     = useState<Product>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef             = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => setForm(f => ({ ...f, imagem: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.codigo.trim()) e.codigo = 'Código obrigatório';
    if (!form.nome.trim())   e.nome   = 'Nome obrigatório';
    // descrição é opcional — sem validação
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle: React.CSSProperties = {
    ...S.inputBase,
    outline: 'none',
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div
        className="modal-sheet animate-slide-up"
        style={{ background: 'linear-gradient(180deg,#0f2d1a 0%,#0a1d14 100%)', border: '1px solid #1e4530' }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: '#2a5c40' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px', borderBottom: '1px solid #1e4530' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80', margin: 0 }}>
              {initial.codigo ? 'Editar' : 'Cadastrar'}
            </p>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8fdf0', margin: 0 }}>
              {initial.codigo ? '✏️ Editar Produto' : '➕ Novo Produto'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', flexShrink: 0, color: '#f87171' }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24, overflowX: 'hidden' }}>
          {/* Image */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div
              style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', border: '2px dashed #2a5c40' }}
            >
              {form.imagem ? (
                <img src={form.imagem} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <ImageIcon size={28} style={{ color: '#2a5c40' }} />
                  <span style={{ fontSize: 10, color: '#4d7a5e' }}>Sem foto</span>
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}
              >
                <Upload size={15} /> Carregar Foto da Galeria
              </button>
              <input
                type="url"
                value={form.imagem.startsWith('data:') ? '' : form.imagem}
                onChange={e => setForm(f => ({ ...f, imagem: e.target.value }))}
                placeholder="URL da imagem..."
                style={{ ...inputStyle, fontSize: '0.8rem' }}
              />
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
              />
            </div>
          </div>

          {/* Código + Categoria */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86efac', marginBottom: 6 }}>Código *</label>
              <input
                value={form.codigo}
                onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                placeholder="FL001"
                style={{ ...inputStyle, borderColor: errors.codigo ? '#f87171' : '#1e4530' }}
              />
              {errors.codigo && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.codigo}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86efac', marginBottom: 6 }}>Categoria *</label>
              <select
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value as Category }))}
                style={{ ...inputStyle, background: 'rgba(5,15,9,0.8)' }}
              >
                <option value="Flor">🌸 Flor</option>
                <option value="Planta">🌿 Planta</option>
              </select>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86efac', marginBottom: 6 }}>Nome *</label>
            <input
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Rosa Vermelha"
              style={{ ...inputStyle, borderColor: errors.nome ? '#f87171' : '#1e4530' }}
            />
            {errors.nome && <p style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>{errors.nome}</p>}
          </div>

          {/* Descrição — opcional */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#86efac', marginBottom: 6 }}>
              Descrição <span style={{ fontWeight: 400, color: '#4d7a5e', textTransform: 'none', fontSize: 10 }}>(opcional)</span>
            </label>
            <textarea
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              placeholder="Descrição do produto (opcional)..."
              rows={2}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Steppers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Stepper label="Qtd Mín." value={form.quantidade_minima_camada} onChange={v => setForm(f => ({ ...f, quantidade_minima_camada: v }))} />
            <Stepper label="Vasos/Bandeja" value={form.vasos_bandeja} onChange={v => setForm(f => ({ ...f, vasos_bandeja: v }))} />
          </div>

          {/* Hint */}
          <div style={{ borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <AlertCircle size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: '#6b9e7e', margin: 0, lineHeight: 1.5 }}>
              Use <strong style={{ color: '#4ade80' }}>+</strong> e <strong style={{ color: '#4ade80' }}>−</strong> para ajustar, ou <strong style={{ color: '#4ade80' }}>toque no número</strong> para digitar diretamente. Valor inicial é <strong style={{ color: '#4ade80' }}>0</strong>.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: 'rgba(0,0,0,0.3)', border: '1px solid #1e4530', color: '#86efac' }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => { if (validate()) onSave(form); }}
              style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 3px 14px rgba(34,197,94,0.3)' }}
            >
              <Check size={16} />
              {initial.codigo ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quantity Control ─────────────────────────────────────────────────────────
function QuantityControl({ product, currentQty, onAdd, onRemove }: {
  product: Product; currentQty: number;
  onAdd: (qty: number) => void; onRemove: (qty: number) => void;
}) {
  const step     = Math.max(1, product.vasos_bandeja);
  const meetsMin = currentQty >= product.quantidade_minima_camada || product.quantidade_minima_camada === 0;

  if (currentQty === 0) {
    return (
      <button
        onClick={() => onAdd(step)}
        style={{ width: '100%', padding: '12px', fontWeight: 700, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#22c55e,#15803d)', color: 'white', fontSize: 14, boxShadow: '0 3px 12px rgba(34,197,94,0.3)', border: 'none' }}
      >
        <ShoppingCart size={16} />
        Adicionar ao Carrinho
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {!meetsMin && product.quantidade_minima_camada > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a' }}>
          <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
          <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', margin: 0 }}>Mínimo: {product.quantidade_minima_camada} vasos</p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', borderRadius: 12, overflow: 'hidden', border: '2px solid #22c55e', background: '#f0faf4', width: '100%' }}>
        <button
          onClick={() => onRemove(step)}
          style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fee2e2', color: '#dc2626', border: 'none' }}
        >
          <Minus size={18} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px' }}>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#15803d', margin: 0, lineHeight: 1 }}>{currentQty}</p>
          <p style={{ fontSize: 10, color: '#4b7a5c', margin: 0 }}>
            {Math.ceil(currentQty / Math.max(1, product.vasos_bandeja))} bandeja(s)
          </p>
        </div>
        <button
          onClick={() => onAdd(step)}
          style={{ width: 48, height: 48, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#dcfce7', color: '#15803d', border: 'none' }}
        >
          <Plus size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px', borderRadius: 10, background: '#f0faf4', border: '1px solid #c6e8d1' }}>
        <ShoppingCart size={13} style={{ color: '#15803d' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#15803d' }}>{currentQty} vasos no carrinho</span>
      </div>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ p, inCartQty, isAdmin, canOrder, onEdit, onDelete, onAdd, onRemove }: {
  p: Product; inCartQty: number; isAdmin: boolean; canOrder: boolean;
  onEdit: () => void; onDelete: () => void;
  onAdd: (step: number) => void; onRemove: (step: number) => void;
}) {
  const inCart  = inCartQty > 0;
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      className="animate-scale-in"
      style={{
        borderRadius: 16, overflow: 'hidden', width: '100%',
        background: '#ffffff',
        border: inCart ? '2px solid #22c55e' : '1.5px solid #e0ede6',
        boxShadow: inCart ? '0 4px 18px rgba(34,197,94,0.18)' : '0 2px 10px rgba(0,0,0,0.07)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#f0faf4', overflow: 'hidden' }}>
        {p.imagem && !imgErr ? (
          <img
            src={p.imagem} alt={p.nome}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'center',
              background: '#f0faf4',
              display: 'block',
            }}
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f0faf4' }}>
            <span style={{ fontSize: 72, lineHeight: 1 }}>{p.categoria === 'Flor' ? '🌸' : '🌿'}</span>
            <span style={{ fontSize: 11, color: '#6b9e7e', fontWeight: 500 }}>Sem imagem</span>
          </div>
        )}

        {/* Category badge */}
        <div
          style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, color: 'white', fontWeight: 700, fontSize: 11, background: p.categoria === 'Flor' ? '#ec4899' : '#059669', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
        >
          {p.categoria === 'Flor' ? <Flower2 size={11} /> : <Leaf size={11} />}
          {p.categoria}
        </div>

        {/* Code */}
        <div
          style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'monospace', padding: '3px 8px', borderRadius: 8, background: 'rgba(0,0,0,0.72)', color: '#e8fdf0', fontSize: 11, backdropFilter: 'blur(4px)' }}
        >
          {p.codigo}
        </div>

        {/* Cart badge */}
        {inCart && (
          <div
            style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontWeight: 700, fontSize: 11, background: '#22c55e', color: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
          >
            <ShoppingCart size={11} />
            {inCartQty} vasos
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 6 }}>
            <button
              onClick={onEdit}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.92)', backdropFilter: 'blur(4px)', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
            >
              <Edit2 size={15} color="white" />
            </button>
            <button
              onClick={onDelete}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.92)', backdropFilter: 'blur(4px)', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
            >
              <Trash2 size={15} color="white" />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a2e1e', margin: 0 }}>{p.nome}</h3>
          {p.descricao && (
            <p style={{ fontSize: 13, color: '#4b7a5c', margin: '3px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.descricao}</p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={{ borderRadius: 10, padding: '8px', textAlign: 'center', background: '#f0faf4', border: '1px solid #c6e8d1' }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4b7a5c', margin: 0 }}>Qtd Mín.</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#15803d', margin: 0 }}>{p.quantidade_minima_camada}</p>
          </div>
          <div style={{ borderRadius: 10, padding: '8px', textAlign: 'center', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3b5a8a', margin: 0 }}>Vasos/Bandeja</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', margin: 0 }}>{p.vasos_bandeja}</p>
          </div>
        </div>

        {/* Quantity control */}
        {canOrder && (
          <QuantityControl
            product={p}
            currentQty={inCartQty}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        )}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, count, isFlor, collapsed, onToggle }: {
  icon: React.ReactNode; label: string; count: number;
  isFlor: boolean; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 12px', borderRadius: 12, marginBottom: 4,
        background: isFlor ? '#fdf2f8' : '#f0faf4',
        border: `1px solid ${isFlor ? '#fbcfe8' : '#bbf7d0'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: isFlor ? '#be185d' : '#15803d' }}>
          {label}
        </span>
        <span
          style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isFlor ? '#fbcfe8' : '#bbf7d0', color: isFlor ? '#9d174d' : '#166534' }}
        >
          {count}
        </span>
      </div>
      {collapsed
        ? <ChevronDown size={16} style={{ color: isFlor ? '#be185d' : '#15803d', flexShrink: 0 }} />
        : <ChevronUp   size={16} style={{ color: isFlor ? '#be185d' : '#15803d', flexShrink: 0 }} />
      }
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CatalogScreen({
  products, currentUser, cart,
  onAddToCart, onAddProduct, onUpdateProduct, onDeleteProduct,
}: Props) {
  const [search,        setSearch]        = useState('');
  const [filter,        setFilter]        = useState<FilterCategory>('Todas');
  const [showForm,      setShowForm]      = useState(false);
  const [editProduct,   setEditProduct]   = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast,         setToast]         = useState('');
  const [showImport,    setShowImport]    = useState(false);
  const [floresCollapsed,  setFloresCollapsed]  = useState(false);
  const [plantasCollapsed, setPlantasCollapsed] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const isAdmin  = currentUser.role === 'admin';
  const canOrder = currentUser.role !== 'analista';

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const cartMap = cart.reduce<Record<string, number>>((acc, item) => {
    acc[item.produto.codigo] = item.quantidade; return acc;
  }, {});

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      return (filter === 'Todas' || p.categoria === filter) &&
        (p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || (p.descricao ?? '').toLowerCase().includes(q));
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const flores  = filtered.filter(p => p.categoria === 'Flor');
  const plantas = filtered.filter(p => p.categoria === 'Planta');

  const handleSave = (p: Product) => {
    if (editProduct && editProduct.codigo) {
      onUpdateProduct(p); showToast('✅ Produto atualizado!');
    } else {
      if (products.find(x => x.codigo === p.codigo)) { alert('Código já cadastrado!'); return; }
      onAddProduct(p); showToast('✅ Produto cadastrado!');
    }
    setShowForm(false); setEditProduct(null);
  };

  const handleAdd    = (product: Product, step: number) => { onAddToCart(product, step);  showToast(`🛒 +${step} ${product.nome}`); };
  const handleRemove = (product: Product, step: number) => {
    const next = (cartMap[product.codigo] ?? 0) - step;
    onAddToCart(product, -step);
    if (next <= 0) showToast(`🗑️ ${product.nome} removido`);
  };

  const handleImport = async (file: File) => {
    try {
      const rows = await importProductsFromExcel(file);
      let added = 0;
      rows.forEach((row: Record<string, unknown>) => {
        const codigo    = String(row['Código'] || row['codigo'] || '').trim().toUpperCase();
        const nome      = String(row['Nome'] || row['nome'] || row['Produto'] || '').trim();
        const descricao = String(row['Descrição'] || row['descricao'] || row['Descricao'] || '').trim();
        const catStr    = String(row['Categoria'] || row['categoria'] || 'Flor').trim();
        const categoria: Category = catStr === 'Planta' ? 'Planta' : 'Flor';
        const imagem    = String(row['Imagem'] || row['imagem'] || '').trim();
        const qtdMin    = parseInt(String(row['Qtd Mínima'] || row['quantidade_minima_camada'] || '0'));
        const vasos     = parseInt(String(row['Vasos Bandeja'] || row['vasos_bandeja'] || '0'));
        if (!codigo || !nome) return;
        const product: Product = {
          codigo, nome, descricao, categoria, imagem,
          quantidade_minima_camada: isNaN(qtdMin) ? 0 : qtdMin,
          vasos_bandeja: isNaN(vasos) ? 0 : vasos,
        };
        if (products.find(pr => pr.codigo === codigo)) { onUpdateProduct(product); }
        else { onAddProduct(product); added++; }
      });
      showToast(`✅ ${added} produto(s) importado(s)!`);
    } catch { showToast('❌ Erro ao importar planilha'); }
    setShowImport(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '100%', overflow: 'hidden', background: '#ffffff' }}>

      {/* ── Toolbar — dark green ── */}
      <div className="toolbar" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>

        {/* Admin buttons row */}
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 12px 8px', width: '100%', maxWidth: '100%' }}>
            <span style={{ fontSize: 12, fontWeight: 600, flex: 1, minWidth: 0, color: '#86efac', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {products.length} produto(s)
            </span>
            <button
              onClick={() => setShowImport(true)}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)', color: '#93c5fd', whiteSpace: 'nowrap' }}
            >
              <Upload size={14} /> Importar
            </button>
            <button
              onClick={() => { setEditProduct(null); setShowForm(true); }}
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 10px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'white', background: 'linear-gradient(135deg,#22c55e,#15803d)', boxShadow: '0 2px 10px rgba(34,197,94,0.35)', whiteSpace: 'nowrap' }}
            >
              <Plus size={14} /> Produto
            </button>
          </div>
        )}

        {/* Search */}
        <div style={{ padding: isAdmin ? '0 12px 8px' : '12px 12px 8px', width: '100%', maxWidth: '100%' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4ade80', flexShrink: 0 }} />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome ou código..."
              style={{ width: '100%', maxWidth: '100%', padding: '10px 36px', fontSize: 16, borderRadius: 12, background: 'rgba(0,0,0,0.35)', border: '1px solid #2a5c40', color: '#e8fdf0', outline: 'none', boxSizing: 'border-box' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', padding: 0 }}>
                <X size={15} style={{ color: '#4ade80' }} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '0 12px 12px', overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
          {(['Todas', 'Flor', 'Planta'] as FilterCategory[]).map(f => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  ...(active
                    ? { background: 'linear-gradient(135deg,#22c55e,#15803d)', color: 'white', boxShadow: '0 2px 8px rgba(34,197,94,0.35)', border: 'none' }
                    : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#86efac' }
                  ),
                }}
              >
                {f === 'Todas' ? '🌱' : f === 'Flor' ? '🌸' : '🌿'} {f}
                <span style={{ opacity: 0.7 }}>
                  ({f === 'Todas' ? products.length : products.filter(p => p.categoria === f).length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product list ── */}
      <div className="scroll-container" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#f8faf9', width: '100%', maxWidth: '100%' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12, padding: '0 24px' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8f5ee' }}>
              <Package size={36} style={{ color: '#22c55e' }} />
            </div>
            <p style={{ fontWeight: 600, textAlign: 'center', color: '#4b7a5c' }}>Nenhum produto encontrado</p>
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ fontSize: 14, padding: '10px 20px', borderRadius: 12, fontWeight: 600, background: '#22c55e', color: 'white', border: 'none' }}
              >
                Limpar busca
              </button>
            )}
          </div>
        ) : (
          <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

            {/* Flores */}
            {flores.length > 0 && (filter === 'Todas' || filter === 'Flor') && (
              <div>
                <SectionHeader
                  icon={<Flower2 size={15} style={{ color: '#ec4899' }} />}
                  label="🌸 FLORES" count={flores.length}
                  isFlor={true} collapsed={floresCollapsed}
                  onToggle={() => setFloresCollapsed(v => !v)}
                />
                {!floresCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    {flores.map(p => (
                      <ProductCard
                        key={p.codigo} p={p}
                        inCartQty={cartMap[p.codigo] ?? 0}
                        isAdmin={isAdmin} canOrder={canOrder}
                        onEdit={() => { setEditProduct(p); setShowForm(true); }}
                        onDelete={() => setDeleteConfirm(p.codigo)}
                        onAdd={step => handleAdd(p, step)}
                        onRemove={step => handleRemove(p, step)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Plantas */}
            {plantas.length > 0 && (filter === 'Todas' || filter === 'Planta') && (
              <div>
                <SectionHeader
                  icon={<Leaf size={15} style={{ color: '#059669' }} />}
                  label="🌿 PLANTAS" count={plantas.length}
                  isFlor={false} collapsed={plantasCollapsed}
                  onToggle={() => setPlantasCollapsed(v => !v)}
                />
                {!plantasCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                    {plantas.map(p => (
                      <ProductCard
                        key={p.codigo} p={p}
                        inCartQty={cartMap[p.codigo] ?? 0}
                        isAdmin={isAdmin} canOrder={canOrder}
                        onEdit={() => { setEditProduct(p); setShowForm(true); }}
                        onDelete={() => setDeleteConfirm(p.codigo)}
                        onAdd={step => handleAdd(p, step)}
                        onRemove={step => handleRemove(p, step)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            <div style={{ height: 16 }} />
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{ position: 'absolute', bottom: 80, left: 12, right: 12, zIndex: 40 }} className="animate-toast pointer-events-none">
          <div
            style={{ borderRadius: 16, padding: '12px 16px', fontSize: 14, fontWeight: 700, textAlign: 'center', background: 'linear-gradient(135deg,#0f2d1a,#163a22)', border: '1px solid #22c55e', color: '#4ade80', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            {toast}
          </div>
        </div>
      )}

      {/* ── Product Form ── */}
      {showForm && (
        <ProductForm
          initial={editProduct ?? { ...emptyProduct }}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (() => {
        const prod = products.find(p => p.codigo === deleteConfirm);
        return (
          <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: '0 16px' }}>
            <div
              className="animate-bounce-in"
              style={{ borderRadius: 24, padding: 20, width: '100%', maxWidth: 320, background: '#fff', border: '1px solid #e0ede6', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
            >
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🗑️</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4, color: '#1a1a1a' }}>Excluir produto?</h3>
                {prod && <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#15803d' }}>{prod.nome}</p>}
                <p style={{ fontSize: 13, color: '#6b7280' }}>Esta ação não pode ser desfeita.</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 600, fontSize: 14, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { onDeleteProduct(deleteConfirm); setDeleteConfirm(null); showToast('🗑️ Removido!'); }}
                  style={{ flex: 1, padding: '12px', borderRadius: 12, fontWeight: 700, fontSize: 14, color: 'white', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', border: 'none' }}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Import Modal ── */}
      {showImport && (
        <div className="modal-overlay animate-fade-in">
          <div
            className="modal-sheet animate-slide-up"
            style={{ background: '#0d2318', border: '1px solid #1e4530' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: '#2a5c40' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px', borderBottom: '1px solid #1e4530' }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: '#e8fdf0', margin: 0 }}>📊 Importar Planilha</h2>
              <button
                onClick={() => setShowImport(false)}
                style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.12)', border: 'none', color: '#f87171' }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 32 }}>
              <p style={{ fontSize: 13, color: '#6b9e7e', margin: 0 }}>Colunas esperadas na planilha:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Código', 'Nome', 'Descrição', 'Categoria', 'Imagem', 'Qtd Mínima', 'Vasos Bandeja'].map(col => (
                  <span key={col} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, fontWeight: 600, background: 'rgba(34,197,94,0.12)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {col}
                  </span>
                ))}
              </div>
              <button
                onClick={() => importRef.current?.click()}
                style={{ width: '100%', padding: '40px 0', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, border: '2px dashed #2a5c40', background: 'rgba(34,197,94,0.04)', color: '#4ade80', cursor: 'pointer' }}
              >
                <Upload size={36} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Selecionar arquivo Excel</span>
                <span style={{ fontSize: 12, color: '#6b9e7e' }}>.xlsx, .xls</span>
              </button>
              <input ref={importRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
