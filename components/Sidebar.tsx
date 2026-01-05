
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Barcode, 
  Settings, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Permission, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: Permission) => void;
  onLogout: () => void;
  appName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  appName 
}) => {
  if (!currentUser) return null;

  const menuItems = [
    { id: 'DASHBOARD', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'INVENTORY', label: 'المخزون', icon: Package },
    { id: 'ORDER_REQUESTS', label: 'الطلبات والمشتريات', icon: ShoppingCart },
    { id: 'BARCODE_PRINT', label: 'طباعة الباركود', icon: Barcode },
    { id: 'ADMIN_SETTINGS', label: 'الإعدادات', icon: Settings },
  ].filter(item => currentUser.permissions.includes(item.id as Permission));

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`fixed top-0 right-0 bottom-0 w-64 bg-white border-l z-50 transition-transform transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex items-center justify-between">
            <h1 className="text-xl font-bold text-blue-600 truncate">{appName}</h1>
            <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-gray-100">
              <ChevronRight size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as Permission);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="px-4 py-3 mb-2 text-start">
              <p className="text-xs text-gray-400 uppercase font-semibold">المستخدم الحالي</p>
              <p className="text-sm font-medium text-gray-700">{currentUser.username}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
