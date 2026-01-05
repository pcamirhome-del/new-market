
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, DollarSign, Package, ShoppingCart, Clock } from 'lucide-react';
import { AppState, Sale } from '../types';
import { formatCurrency, formatDateTime } from '../utils';

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">إحصائيات المتجر</h1>
          <p className="text-gray-500">أهلاً بك مجدداً في لوحة تحكم متجرك.</p>
        </div>
        <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-mono">
          <Clock size={20} />
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold">{formatDateTime(now)}</span>
            <span className="text-xs opacity-75">{new Date(now).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-lg font-semibold mb-6 text-start">نظرة عامة على الإيرادات</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
              />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      {icon}
    </div>
    <div className="text-start">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;
