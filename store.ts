
import { useState, useEffect } from 'react';
import { AppState, User, UserRole, Permission, GlobalSettings } from './types';

const INITIAL_SETTINGS: GlobalSettings = {
  appName: 'Market Pro',
  profitMargin: 15,
};

const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'admin',
  password: 'admin',
  role: UserRole.ADMIN,
  permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'BARCODE_PRINT', 'ADMIN_SETTINGS'],
};

const STORAGE_KEY = 'supermarket_state_v1';

export const useStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      users: [DEFAULT_ADMIN],
      currentUser: null,
      companies: [],
      products: [],
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
