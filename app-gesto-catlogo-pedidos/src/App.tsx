import React, { useState, useCallback } from 'react';
import { useStore } from './store/useStore';
import { TabId, User, Order } from './types';

import LoginScreen       from './components/LoginScreen';
import CatalogScreen     from './components/CatalogScreen';
import CartScreen        from './components/CartScreen';
import OrdersScreen      from './components/OrdersScreen';
import ReportsScreen     from './components/ReportsScreen';
import UsersScreen       from './components/UsersScreen';
import SettingsScreen    from './components/SettingsScreen';
import BottomNav         from './components/BottomNav';
import TopHeader         from './components/TopHeader';
import OrderSuccessToast from './components/OrderSuccessToast';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('catalogo');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const darkMode = store.settings.darkMode;

  const handleLogin = useCallback((user: User, keepLoggedIn: boolean) => {
    store.setCurrentUser(user, keepLoggedIn);
    setActiveTab('catalogo');
  }, [store]);

  const handleLogout = useCallback(() => {
    store.setCurrentUser(null, false);
    setActiveTab('catalogo');
  }, [store]);

  const handleFinalizeOrder = useCallback(() => {
    if (!store.currentUser) return;
    const order = store.finalizeOrder(store.currentUser, store.cart);
    if (order) {
      setLastOrder(order);
      setActiveTab('pedidos');
    }
  }, [store]);

  const handleTabChange = useCallback((tab: TabId) => {
    const user = store.currentUser;
    if (!user) return;
    if (user.role === 'analista' && (tab === 'carrinho' || tab === 'usuarios')) return;
    if (user.role === 'loja' && tab === 'usuarios') return;
    setActiveTab(tab);
  }, [store.currentUser]);

  // ── Not logged in ─────────────────────────────────────────────
  if (!store.currentUser) {
    return (
      <div className="h-full overflow-y-auto">
        <LoginScreen
          users={store.users}
          onLogin={handleLogin}
          firebaseStatus={store.firebaseStatus}
        />
      </div>
    );
  }

  const currentUser = store.currentUser;

  const renderScreen = () => {
    const wrap = (node: React.ReactNode) => (
      <ErrorBoundary key={activeTab}>{node}</ErrorBoundary>
    );

    switch (activeTab) {
      case 'catalogo':
        return wrap(
          <CatalogScreen
            products={store.products}
            currentUser={currentUser}
            cart={store.cart}
            onAddToCart={store.addToCart}
            onAddProduct={store.addProduct}
            onUpdateProduct={store.updateProduct}
            onDeleteProduct={store.deleteProduct}
            darkMode={darkMode}
          />
        );
      case 'carrinho':
        return wrap(
          <CartScreen
            cart={store.cart}
            currentUser={currentUser}
            onUpdateItem={store.updateCartItem}
            onRemoveItem={store.removeFromCart}
            onClearCart={store.clearCart}
            onFinalizeOrder={handleFinalizeOrder}
          />
        );
      case 'pedidos':
        return wrap(
          <OrdersScreen
            orders={store.orders}
            currentUser={currentUser}
            onCompleteOrder={store.completeOrder}
            onDeleteOrder={store.deleteOrder}
          />
        );
      case 'relatorios':
        return wrap(
          <ReportsScreen
            orders={store.orders}
            currentUser={currentUser}
            users={store.users.map(u => ({ login: u.login, nome: u.nome }))}
          />
        );
      case 'usuarios':
        return wrap(
          <UsersScreen
            users={store.users}
            currentUser={currentUser}
            onAddUser={store.addUser}
            onUpdateUser={store.updateUser}
            onDeleteUser={store.deleteUser}
            darkMode={darkMode}
          />
        );
      case 'configuracoes':
        return wrap(
          <SettingsScreen
            settings={store.settings}
            currentUser={currentUser}
            onUpdateSettings={store.setSettings}
            onLogout={handleLogout}
            darkMode={darkMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ background: '#f5faf7' }}>

      {/* ── Global Top Header ─────────────────────────────────── */}
      <TopHeader
        currentUser={currentUser}
        activeTab={activeTab}
        cartCount={store.cartItemCount}
        darkMode={darkMode}
        onCartClick={() => handleTabChange('carrinho')}
        firebaseStatus={store.firebaseStatus}
      />

      {/* ── Success toast ─────────────────────────────────────── */}
      {lastOrder && (
        <OrderSuccessToast order={lastOrder} onClose={() => setLastOrder(null)} />
      )}

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {renderScreen()}
      </div>

      {/* ── Bottom navigation ─────────────────────────────────── */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartCount={store.cartItemCount}
        userRole={currentUser.role}
      />
    </div>
  );
}
