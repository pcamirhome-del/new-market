
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set } from 'firebase/database';
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

// بيانات تجريبية لتظهر فوراً في حال كانت القاعدة فارغة
const MOCK_COMPANIES: Company[] = [
  { id: '100', name: 'شركة المراعي', code: 'COMP-100', debt: 0 },
  { id: '101', name: 'شركة صافولا', code: 'COMP-101', debt: 500 }
];

const MOCK_PRODUCTS: Product[] = [
  { id: '1', barcode: '6221234567890', name: 'حليب كامل الدسم 1 لتر', companyId: '100', costPrice: 5, sellingPrice: 6, stock: 50, category: 'ألبان', unit: 'حبة' },
  { id: '2', barcode: '12345678', name: 'زيت دوار الشمس 1.5 لتر', companyId: '101', costPrice: 15, sellingPrice: 18, stock: 20, category: 'زيوت', unit: 'حبة' }
];

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
        setState(prev => ({
          ...data,
          currentUser: prev.currentUser, // الحفاظ على جلسة الدخول محلية
          users: data.users || [DEFAULT_ADMIN],
          companies: data.companies || [],
          products: data.products || [],
          sales: data.sales || [],
          orders: data.orders || [],
          settings: data.settings || INITIAL_SETTINGS,
        }));
      } else {
        // إذا كانت قاعدة البيانات فارغة تماماً، نرفع البيانات الافتراضية والتجريبية
        const initialState = {
          users: [DEFAULT_ADMIN],
          companies: MOCK_COMPANIES,
          products: MOCK_PRODUCTS,
          sales: [],
          orders: [],
          settings: INITIAL_SETTINGS,
        };
        set(dbRef, initialState);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. تحديث السحاب عند تغيير الحالة محلياً
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates };
      
      // نرفع البيانات للسحاب بدون currentUser لضمان استقلالية الجلسات
      const { currentUser, ...cloudData } = newState;
      
      set(ref(db, 'market_data'), cloudData).catch(err => {
        console.error("خطأ في مزامنة البيانات السحابية:", err);
      });
      
      return newState;
    });
  };

  const login = (username: string, password: string): User | null => {
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
      sessionStorage.setItem('current_user', JSON.stringify(user));
      return user;
    }
    return null;
  };

  const logout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
    sessionStorage.removeItem('current_user');
  };

  // استعادة الجلسة عند إعادة تحميل الصفحة
  useEffect(() => {
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      setState(prev => ({ ...prev, currentUser: JSON.parse(savedUser) }));
    }
  }, []);

  return { state, updateState, login, logout, isLoading };
};
