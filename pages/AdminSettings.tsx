
import React, { useState } from 'react';
import { UserPlus, Edit2, Shield, Trash2, Save, Key } from 'lucide-react';
import { AppState, User, UserRole, Permission } from '../types';

interface AdminSettingsProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ state, updateState }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState<User | null>(null);

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
    
    const userData: User = {
      id: editingUser?.id || Date.now().toString(),
      username: formData.get('username') as string,
      password: (formData.get('password') as string) || editingUser?.password || '1234',
      role: UserRole.STAFF,
      permissions: editingUser?.permissions || ['DASHBOARD']
    };

    if (editingUser) {
      updateState({ users: state.users.map(u => u.id === editingUser.id ? userData : u) });
    } else {
      updateState({ users: [...state.users, userData] });
    }
    setIsAddingUser(false);
    setEditingUser(null);
  };

  const handleUpdatePermissions = (userId: string, permission: Permission) => {
    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    const newPermissions = user.permissions.includes(permission)
      ? user.permissions.filter(p => p !== permission)
      : [...user.permissions, permission];

    updateState({
      users: state.users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u)
    });
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
            <input name="appName" defaultValue={state.settings.appName} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">هامش الربح الافتراضي (%)</label>
            <input type="number" name="profitMargin" defaultValue={state.settings.profitMargin} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">تحديث الإعدادات</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="font-bold flex items-center gap-2"><Shield size={18} /> إدارة المستخدمين والصلاحيات</h2>
          <button onClick={() => setIsAddingUser(true)} className="flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <UserPlus size={16} /> إضافة مستخدم جديد
          </button>
        </div>
        <div className="divide-y">
          {state.users.map(user => (
            <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {user.username} 
                    {user.role === UserRole.ADMIN ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-bold uppercase">مسؤول</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold uppercase">مستخدم عادي</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {user.permissions.length} صلاحيات نشطة
                  </div>
                </div>
              </div>
              {user.role !== UserRole.ADMIN && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowPermissionsModal(user)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <Key size={14} /> الصلاحيات
                  </button>
                  <button 
                    onClick={() => { setEditingUser(user); setIsAddingUser(true); }} 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => {
                      if(confirm('هل أنت متأكد من حذف المستخدم؟')) {
                        updateState({ users: state.users.filter(u => u.id !== user.id) });
                      }
                    }} 
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* مودال إضافة/تعديل مستخدم */}
      {(isAddingUser || editingUser) && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-start shadow-2xl">
            <h2 className="text-xl font-bold mb-6">{editingUser ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}</h2>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم المستخدم</label>
                <input required name="username" defaultValue={editingUser?.username} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: ahmed_2024" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">كلمة المرور</label>
                <input type="password" name="password" placeholder={editingUser ? "اتركه فارغاً للحفاظ على الحالية" : "كلمة المرور الافتراضية 1234"} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => { setIsAddingUser(false); setEditingUser(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors">حفظ البيانات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال الصلاحيات */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-start shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">صلاحيات: {showPermissionsModal.username}</h2>
              <button onClick={() => setShowPermissionsModal(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="space-y-3">
              {[
                { id: 'DASHBOARD', label: 'لوحة التحكم والإحصائيات' },
                { id: 'INVENTORY', label: 'إدارة المخزون والمنتجات' },
                { id: 'ORDER_REQUESTS', label: 'المشتريات وفواتير الموردين' },
                { id: 'BARCODE_PRINT', label: 'طباعة الباركود والملصقات' }
              ].map(p => (
                <label key={p.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                  <span className="text-sm font-medium text-gray-700">{p.label}</span>
                  <input 
                    type="checkbox" 
                    checked={state.users.find(u => u.id === showPermissionsModal.id)?.permissions.includes(p.id as Permission)}
                    onChange={() => handleUpdatePermissions(showPermissionsModal.id, p.id as Permission)}
                    className="w-5 h-5 text-blue-600 rounded-md focus:ring-blue-500" 
                  />
                </label>
              ))}
            </div>
            <div className="mt-8">
              <button 
                onClick={() => setShowPermissionsModal(null)} 
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
              >
                تحديث الصلاحيات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
