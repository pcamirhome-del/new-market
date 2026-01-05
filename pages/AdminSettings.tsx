
import React, { useState } from 'react';
import { UserPlus, Edit2, Shield, Trash2, Save } from 'lucide-react';
import { AppState, User, UserRole, Permission } from '../types';

interface AdminSettingsProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ state, updateState }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const handleUpdateSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateState({
      settings: {
        appName: formData.get('appName') as string,
        profitMargin: parseFloat(formData.get('profitMargin') as string)
      }
    });
    alert('تم حفظ الإعدادات بنجاح!');
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const permissions = formData.getAll('permissions') as Permission[];
    
    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      username: formData.get('username') as string,
      password: (formData.get('password') as string) || editingUser?.password || '1234',
      role: UserRole.STAFF,
      permissions
    };

    if (editingUser) {
      updateState({ users: state.users.map(u => u.id === editingUser.id ? userData : u) });
    } else {
      updateState({ users: [...state.users, userData] });
    }
    setIsAddingUser(false);
    setEditingUser(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-start" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">لوحة تحكم المسؤول</h1>
        <p className="text-gray-500">تعديل الإعدادات العامة وإدارة صلاحيات المستخدمين.</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="font-bold flex items-center gap-2"><Save size={18} /> الإعدادات العامة</h2>
        </div>
        <form onSubmit={handleUpdateSettings} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">اسم البرنامج</label>
            <input name="appName" defaultValue={state.settings.appName} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">هامش الربح الافتراضي (%)</label>
            <input type="number" name="profitMargin" defaultValue={state.settings.profitMargin} className="w-full p-2 border rounded-lg" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">تحديث الإعدادات</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold flex items-center gap-2"><Shield size={18} /> إدارة الوصول والمستخدمين</h2>
          <button onClick={() => setIsAddingUser(true)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
            <UserPlus size={16} /> إضافة مستخدم جديد
          </button>
        </div>
        <div className="divide-y">
          {state.users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <div className="font-semibold flex items-center gap-2">
                  {user.username} 
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                    {user.role === 'ADMIN' ? 'مسؤول' : 'موظف'}
                  </span>
                </div>
                <div className="text-xs text-gray-400">الصلاحيات: {user.permissions.map(p => {
                  const map: Record<string, string> = {
                    'DASHBOARD': 'الإحصائيات',
                    'INVENTORY': 'المخزون',
                    'ORDER_REQUESTS': 'المشتريات',
                    'BARCODE_PRINT': 'الباركود',
                    'ADMIN_SETTINGS': 'الإعدادات'
                  };
                  return map[p] || p;
                }).join('، ')}</div>
              </div>
              {user.role !== UserRole.ADMIN && (
                <div className="flex gap-2">
                  <button onClick={() => { setEditingUser(user); setIsAddingUser(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                  <button onClick={() => updateState({ users: state.users.filter(u => u.id !== user.id) })} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {(isAddingUser || editingUser) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-start">
            <h2 className="text-xl font-bold mb-6">{editingUser ? 'تعديل مستخدم' : 'مستخدم جديد'}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
                <input required name="username" defaultValue={editingUser?.username} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                <input type="password" name="password" placeholder={editingUser ? "اتركه فارغاً للحفاظ على الحالية" : "1234"} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">الصلاحيات المتاحة</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'DASHBOARD', label: 'لوحة التحكم والإحصائيات' },
                    { id: 'INVENTORY', label: 'إدارة المخزون والمنتجات' },
                    { id: 'ORDER_REQUESTS', label: 'المشتريات وفواتير الموردين' },
                    { id: 'BARCODE_PRINT', label: 'طباعة الباركود والملصقات' }
                  ].map(p => (
                    <label key={p.id} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="permissions" 
                        value={p.id} 
                        defaultChecked={editingUser?.permissions.includes(p.id as Permission)}
                        className="w-4 h-4 text-blue-600 rounded" 
                      />
                      <span className="text-sm font-medium">{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => { setIsAddingUser(false); setEditingUser(null); }} className="px-4 py-2 border rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
