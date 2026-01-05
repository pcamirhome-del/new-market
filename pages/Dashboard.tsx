
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';
import { AppState, Sale } from '../types';
import { formatCurrency, formatDateTimeFull } from '../utils';

interface DashboardProps {
  state: AppState;
}

const Dashboard: React.FC<DashboardProps> = ({ state }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDailySales = (sales: Sale[]) => {
    const today = new Date().setHours(0, 0, 0, 0);
    return sales
      .filter(s => s.timestamp >= today)
      .reduce((sum, s) => sum + s.total, 0);
  };

  const getMonthlySales = (sales: Sale[]) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    return sales
      .filter(s => s.timestamp >= startOfMonth.getTime())
      .reduce((sum, s) => sum + s.total, 0);
  };

  const chartData = [
    { name: 'يناير', total: 4000 },
    { name: 'فبراير', total: 3000 },
    { name: 'مارس', total: 2000 },
    { name: 'أبريل', total: 2780 },
    { name: 'مايو', total: 1890 },
    { name: 'يونيو', total: 2390 },
    { name: 'يوليو', total: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">إحصائيات المتجر</h1>
          <p className="text-gray-500">مرحباً بك في لوحة تحكم {state.settings.appName}</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-xl text-blue-700 font-bold border border-blue-100 shadow-inner">
          <Clock size={24} className="animate-pulse" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm opacity-80">{formatDateTimeFull(now).split('|')[0]}</span>
            <span className="text-lg font-black">{formatDateTimeFull(now).split('|')[1]}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<DollarSign className="text-green-600" />} 
          label="مبيعات اليوم" 
          value={formatCurrency(getDailySales(state.sales))} 
          color="bg-green-100"
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="إيرادات الشهر" 
          value={formatCurrency(getMonthlySales(state.sales))} 
          color="bg-blue-100"
        />
        <StatCard 
          icon={<Package className="text-orange-600" />} 
          label="إجمالي المنتجات" 
          value={state.products.length.toString()} 
          color="bg-orange-100"
        />
        <StatCard 
          icon={<ShoppingCart className="text-purple-600" />} 
          label="الطلبات المعلقة" 
          value={state.orders.filter(o => o.status === 'PENDING').length.toString()} 
          color="bg-purple-100"
        />
      </div>

      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-start">نظرة عامة على الإيرادات</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                cursor={{fill: '#f9fafb'}}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-2xl ${color}`}>
      {icon}
    </div>
    <div className="text-start">
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-xl font-black text-gray-900 leading-none mt-1">{value}</p>
    </div>
  </div>
);

export default Dashboard;
