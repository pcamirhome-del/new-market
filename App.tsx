
import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import OrderRequests from './pages/OrderRequests';
import BarcodePrinting from './pages/BarcodePrinting';
import AdminSettings from './pages/AdminSettings';
import { Permission, User } from './types';
import { Menu, User as UserIcon, Bell } from 'lucide-react';

const App: React.FC = () => {
  const { state, updateState, login, logout } = useStore();
  const [activeTab, setActiveTab] = useState<Permission>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLogin = (u: string, p: string) => {
    const user = login(u, p);
    if (user) {
      setShowWelcome(true);
      setTimeout(() => setShowWelcome(false), 3000);
      // Pick first allowed tab
      if (user.permissions.length > 0) {
        setActiveTab(user.permissions[0]);
      }
      return true;
    }
    return false;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'DASHBOARD': return <Dashboard state={state} />;
      case 'INVENTORY': return <Inventory state={state} updateState={updateState} />;
      case 'ORDER_REQUESTS': return <OrderRequests state={state} updateState={updateState} />;
      case 'BARCODE_PRINT': return <BarcodePrinting state={state} />;
      case 'ADMIN_SETTINGS': return <AdminSettings state={state} updateState={updateState} />;
      default: return <Dashboard state={state} />;
    }
  };

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} appName={state.settings.appName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentUser={state.currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={logout}
        appName={state.settings.appName}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative" onClick={() => isSidebarOpen && setIsSidebarOpen(false)}>
        {/* Navbar */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 no-print sticky top-0 z-30">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4 lg:px-0">
            <h2 className="text-lg font-bold text-gray-900 hidden md:block">
              {activeTab.replace('_', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                {state.currentUser.username[0].toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-none">{state.currentUser.username}</p>
                <p className="text-[10px] text-gray-500 leading-none mt-1">{state.currentUser.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>

      {/* Welcome Toast */}
      {showWelcome && (
        <div className="fixed top-4 right-4 bg-white border-l-4 border-blue-600 shadow-2xl rounded-xl p-4 animate-bounce z-[200] flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-full text-blue-600">
            <UserIcon size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-bold text-gray-900">{state.currentUser.username}!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
