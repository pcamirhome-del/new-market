
import { useState, useEffect } from 'react';
import { AppState, User, UserRole, Permission, GlobalSettings, Product, Company } from './types';

const INITIAL_SETTINGS: GlobalSettings = {
  appName: 'سوبر ماركت برو',
  profitMargin: 15,
};

const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'admin',
  password: 'admin',
  role: UserRole.ADMIN,
  permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'BARCODE_PRINT', 'ADMIN_SETTINGS'],
};

// بيانات تجريبية لتظهر فوراً
const MOCK_COMPANIES: Company[] = [
  { id: '100', name: 'شركة المراعي', code: 'COMP-100', debt: 0 },
  { id: '101', name: 'شركة صافولا', code: 'COMP-101', debt: 500 }
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', barcode: '6221234567890', name: 'حليب كامل الدسم 1 لتر', companyId: '100', costPrice: 5, sellingPrice: 6, stock: 50, category: 'ألبان', unit: 'حبة' },
  { id: '2', barcode: '12345678', name: 'زيت دوار الشمس 1.5 لتر', companyId: '101', costPrice: 15, sellingPrice: 18, stock: 20, category: 'زيوت', unit: 'حبة' }
];

// تغيير المفتاح لضمان تحديث البيانات عند المستخدم
const STORAGE_KEY = 'supermarket_state_v2';

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      users: [DEFAULT_ADMIN],
      currentUser: null,
      companies: MOCK_COMPANIES,
      products: MOCK_PRODUCTS,
      sales: [],
      orders: [],
      settings: INITIAL_SETTINGS,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const login = (username: string, password: string): User | null => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      updateState({ currentUser: user });
      return user;
    }
    return null;
  };

  const logout = () => {
    updateState({ currentUser: null });
  };

  return { state, updateState, login, logout };
};
