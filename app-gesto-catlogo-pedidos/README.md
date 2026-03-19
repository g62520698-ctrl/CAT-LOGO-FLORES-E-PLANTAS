# 🌸 Catálogo de Flores e Plantas

Aplicativo web progressivo (PWA) para gerenciamento de catálogo de plantas e criação de pedidos de loja.

---

## 🚀 Deploy no Vercel

### Opção 1 — Deploy via GitHub (Recomendado)

1. **Faça upload do projeto para o GitHub:**
   ```bash
   git init
   git add .
   git commit -m "feat: catálogo de flores e plantas"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```

2. **Conecte ao Vercel:**
   - Acesse [vercel.com](https://vercel.com) e faça login
   - Clique em **"Add New Project"**
   - Importe o repositório do GitHub
   - Vercel detecta automaticamente que é Vite → clique **Deploy**

3. **Variáveis de ambiente (opcional):**
   - No painel Vercel → Settings → Environment Variables
   - Não há variáveis obrigatórias (Firebase já está configurado no código)

### Opção 2 — Deploy via Vercel CLI

```bash
# Instalar CLI
npm install -g vercel

# Na pasta do projeto
vercel

# Para produção
vercel --prod
```

### Opção 3 — Deploy direto (drag & drop)

1. Execute `npm run build` localmente
2. Acesse [vercel.com/new](https://vercel.com/new)
3. Arraste a pasta `dist/` para a área de upload

---

## 📱 Instalar como App (PWA)

### Android (Chrome)
1. Abra o site no Chrome
2. Toque nos **3 pontos** (menu) → **"Adicionar à tela inicial"**
3. Confirme → o app aparece como ícone na tela inicial

### iOS (Safari)
1. Abra o site no Safari
2. Toque no botão **Compartilhar** (ícone de caixinha com seta)
3. Role para baixo → **"Adicionar à Tela de Início"**
4. Confirme → o app aparece como ícone na tela inicial

### Vantagens do PWA instalado:
- ✅ Funciona offline
- ✅ Tela cheia sem barra do navegador
- ✅ Ícone na tela inicial como app nativo
- ✅ Sincronização automática quando voltar online

---

## 🛠 Desenvolvimento local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

---

## 🔥 Firebase

O app usa Firebase Firestore para sincronização em tempo real.

**Projeto:** `catalog-82ce0`

### Coleções no Firestore:
| Coleção | Descrição |
|---|---|
| `produtos` | Catálogo de flores e plantas |
| `usuarios` | Usuários do sistema |
| `pedidos` | Histórico de pedidos |
| `configuracoes` | Configurações do app |

### Regras de segurança recomendadas (Firestore):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 👥 Perfis de Acesso

| Perfil | Catálogo | Carrinho | Pedidos | Relatórios | Usuários | Config |
|---|---|---|---|---|---|---|
| **Administrador** | ✅ + editar | ✅ | ✅ + admin | ✅ | ✅ | ✅ |
| **Loja** | ✅ + pedir | ✅ | ✅ visualizar | ✅ | ❌ | ✅ |
| **Analista** | ✅ visualizar | ❌ | ✅ visualizar | ✅ | ❌ | ✅ |

### Usuários padrão:
| Login | Senha | Perfil |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `loja1` | `loja123` | Loja |
| `analista` | `analista123` | Analista |

---

## 📊 Exportação Excel

O app gera arquivos `.xlsx` com:
- **Pedido individual**: por usuário com todos os itens
- **Consolidado**: todos os pedidos agrupados por usuário com soma por produto
- **Relatório semanal/mensal**: histórico consolidado

---

## 🏗 Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| React | 19 | Framework UI |
| TypeScript | 5.9 | Tipagem |
| Vite | 7 | Build tool |
| Tailwind CSS | 4 | Estilização |
| Firebase | 12 | Backend / Sync |
| Zustand | — | State management |
| XLSX | 0.18 | Exportação Excel |
| Lucide React | — | Ícones |

---

## 📁 Estrutura do Projeto

```
src/
├── App.tsx                    # Componente raiz + roteamento
├── index.css                  # Estilos globais + tema verde
├── main.tsx                   # Entrada da aplicação
├── components/
│   ├── LoginScreen.tsx        # Tela de login com PWA
│   ├── CatalogScreen.tsx      # Catálogo de produtos
│   ├── CartScreen.tsx         # Carrinho de pedidos
│   ├── OrdersScreen.tsx       # Histórico de pedidos
│   ├── ReportsScreen.tsx      # Relatórios e rankings
│   ├── UsersScreen.tsx        # Gestão de usuários
│   ├── SettingsScreen.tsx     # Configurações
│   ├── TopHeader.tsx          # Cabeçalho global
│   ├── BottomNav.tsx          # Navegação inferior
│   ├── OrderSuccessToast.tsx  # Toast de sucesso
│   └── ErrorBoundary.tsx      # Proteção contra crashes
├── store/
│   └── useStore.ts            # Estado global (Zustand)
├── firebase/
│   └── config.ts              # Configuração Firebase
├── types/
│   └── index.ts               # Tipos TypeScript
└── utils/
    ├── excel.ts               # Geração de planilhas
    └── cn.ts                  # Utility de classes CSS
public/
├── manifest.json              # PWA Manifest
├── sw.js                      # Service Worker
└── icon-*.png                 # Ícones do app
```

---

## 📄 Licença

Projeto privado — Uso interno.
