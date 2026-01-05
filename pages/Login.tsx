
import React, { useState, useEffect } from 'react';
import { LogIn, Clock, ShoppingBasket } from 'lucide-react';
import { formatDateTime } from '../utils';

interface LoginProps {
  onLogin: (u: string, p: string) => boolean;
  appName: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, appName }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError('بيانات الدخول غير صحيحة. تلميح: admin / admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border">
        <div className="bg-blue-600 p-8 text-white text-center space-y-4">
          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
            <ShoppingBasket size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{appName}</h1>
            <p className="text-blue-100 text-sm">نظام إدارة السوبر ماركت</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-blue-200 font-mono text-sm border-t border-blue-500 pt-4 mt-4">
            <Clock size={16} />
            {formatDateTime(now)}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-start">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم المستخدم</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
            <input 
              required
              type="password" 
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
            />
          </div>
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            تسجيل الدخول
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
