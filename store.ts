
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, get } from 'firebase/database';
import { AppState, User, UserRole, GlobalSettings, Company, Product } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyAYdWvZbTTkGlfI6vv02EFUMbw5eeF4UpU",
  authDomain: "sample-firebase-adddi-app.firebaseapp.com",
  databaseURL: "https://sample-firebase-adddi-app-default-rtdb.firebaseio.com",
  projectId: "sample-firebase-adddi-app",
  storageBucket: "sample-firebase-adddi-app.firebasestorage.app",
  messagingSenderId: "1013529485030",
  appId: "1:1013529485030:web:3dd9b79cd7d7ba41b42527"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const INITIAL_SETTINGS: GlobalSettings = {
  appName: 'سوبر ماركت برو (سحابي)',
  profitMargin: 15,
};

const DEFAULT_ADMIN: User = {
  id: '1',
  username: 'admin',
  password: 'admin',
  role: UserRole.ADMIN,
  permissions: ['DASHBOARD', 'INVENTORY', 'ORDER_REQUESTS', 'BARCODE_PRINT', 'ADMIN_SETTINGS'],
};

export const useStore = () => {
  const [state, setState] = useState<AppState>({
    users: [DEFAULT_ADMIN],
    currentUser: null,
    companies: [],
    products: [],
    sales: [],
    orders: [],
    settings: INITIAL_SETTINGS,
  });

  const [isLoading, setIsLoading] = useState(true);

  // 1. استماع للبيانات من السحاب (Firebase)
  useEffect(() => {
    const dbRef = ref(db, 'market_data');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // نقوم بتحديث الحالة مع الحفاظ على المستخدم الحالي المسجل محلياً
        setState(prev => ({
          ...data,
          currentUser: prev.currentUser // الحفاظ على جلسة الدخول محلية
        }));
      } else {
        // إذا كانت قاعدة البيانات فارغة، نرفع البيانات الافتراضية
        const initialState = {
          users: [DEFAULT_ADMIN],
          companies: [],
          products: [],
          sales: [],
          orders: [],
          settings: INITIAL_SETTINGS,
        };
        set(dbRef, initialState);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. تحديث السحاب عند تغيير الحالة محلياً
  const updateState = (updates: Partial<AppState>) => {
    const newState = { ...state, ...updates };
    
    // إزالة currentUser قبل الرفع للسحاب لكي لا يرى الجميع نفس جلسة الدخول
    const { currentUser, ...cloudState } = newState;
    
    setState(newState);
    set(ref(db, 'market_data'), cloudState).catch(err => {
      console.error("خطأ في مزامنة البيانات السحابية:", err);
    });
  };

  const login = (username: string, password: string): User | null => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      // تخزين جلسة بسيطة في sessionStorage للحفاظ على الدخول عند تحديث الصفحة
      sessionStorage.setItem('current_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    sessionStorage.removeItem('current_user');
  };

  // محاولة استعادة الجلسة من sessionStorage عند التحميل
  useEffect(() => {
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      setState(prev => ({ ...prev, currentUser: JSON.parse(savedUser) }));
    }
  }, []);

  return { state, updateState, login, logout, isLoading };
};
