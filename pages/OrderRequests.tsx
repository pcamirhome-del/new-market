
import React, { useState } from 'react';
import { Plus, Search, ChevronRight, Share2, Printer, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { AppState, Order, Company } from '../types';
import { formatCurrency, formatDate, getNextSerialNumber } from '../utils';

interface OrderRequestsProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const OrderRequests: React.FC<OrderRequestsProps> = ({ state, updateState }) => {
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);

  const [isAddingCompany, setIsAddingCompany] = useState(false);

  const handleAddCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newId = getNextSerialNumber(state.companies, 100);
    const newCompany: Company = {
      id: newId,
      name: formData.get('name') as string,
      code: `COMP-${newId}`,
      debt: 0
    };
    updateState({ companies: [...state.companies, newCompany] });
    setIsAddingCompany(false);
  };

  const handleCreateOrder = () => {
    if (!selectedCompanyId) return alert('الرجاء اختيار شركة');
    if (newOrderItems.length === 0) return alert('الرجاء إضافة صنف واحد على الأقل');

    const company = state.companies.find(c => c.id === selectedCompanyId);
    if (company && company.debt > 0) {
      if (!confirm(`تحذير: هذه الشركة لديها مديونية سابقة قدرها ${formatCurrency(company.debt)}. هل تريد الاستمرار؟`)) return;
    }

    const totalAmount = newOrderItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const newOrder: Order = {
      id: getNextSerialNumber(state.orders, 1000),
      companyId: selectedCompanyId,
      status: 'PENDING',
      items: newOrderItems,
      totalAmount,
      paidAmount,
      createdAt: Date.now(),
      dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };

    const remaining = totalAmount - paidAmount;
    const updatedCompanies = state.companies.map(c => 
      c.id === selectedCompanyId ? { ...c, debt: c.debt + remaining } : c
    );

    updateState({ 
      orders: [...state.orders, newOrder],
      companies: updatedCompanies
    });
    setIsAddingOrder(false);
    setNewOrderItems([]);
    setPaidAmount(0);
    setSelectedCompanyId('');
  };

  const toggleStatus = (order: Order) => {
    const newStatus = order.status === 'PENDING' ? 'RECEIVED' : 'PENDING';
    
    let updatedProducts = [...state.products];
    if (newStatus === 'RECEIVED') {
      order.items.forEach(item => {
        const existing = updatedProducts.find(p => p.barcode === item.barcode);
        if (existing) {
          existing.stock += item.quantity;
        } else {
          updatedProducts.push({
            id: Date.now().toString() + Math.random(),
            barcode: item.barcode,
            name: item.name,
            companyId: order.companyId,
            costPrice: item.costPrice,
            sellingPrice: item.sellingPrice,
            stock: item.quantity
          });
        }
      });
    }

    updateState({
      orders: state.orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o),
      products: updatedProducts
    });
  };

  const shareViaWhatsApp = (order: Order) => {
    const message = `طلب توريد: #${order.id}%0Aمن: ${state.settings.appName}%0Aالأصناف: ${order.items.map(i => `${i.name} (${i.quantity})`).join(', ')}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 text-start" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشتريات والطلبات</h1>
          <p className="text-gray-500">إدارة فواتير الموردين وطلبات الشراء.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddingCompany(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <Plus size={18} /> شركة جديدة
          </button>
          <button onClick={() => setIsAddingOrder(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus size={18} /> فاتورة شراء
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-start">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">رقم الطلب</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">المورد</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">الإجمالي</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">تاريخ الاستحقاق</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">الحالة</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {state.orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm font-semibold">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{state.companies.find(c => c.id === order.companyId)?.name || 'غير معروف'}</div>
                  <div className="text-xs text-gray-500">أنشئ في: {formatDate(order.createdAt)}</div>
                </td>
                <td className="px-6 py-4 text-sm">{formatCurrency(order.totalAmount)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.dueDate)}</td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => toggleStatus(order)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                      order.status === 'RECEIVED' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    {order.status === 'RECEIVED' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                    {order.status === 'RECEIVED' ? 'تم الاستلام' : 'قيد الانتظار'}
                  </button>
                </td>
                <td className="px-6 py-4 text-end space-x-2">
                  <button onClick={() => shareViaWhatsApp(order)} className="p-2 text-gray-400 hover:text-green-600 ml-2"><Share2 size={18} /></button>
                  <button onClick={() => window.print()} className="p-2 text-gray-400 hover:text-blue-600"><Printer size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال فاتورة جديدة */}
      {isAddingOrder && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-start">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">فاتورة مشتريات جديدة</h2>
              <span className="text-gray-400 font-mono text-sm">#{getNextSerialNumber(state.orders, 1000)}</span>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اختر المورد</label>
                  <select 
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="">اختر شركة...</option>
                    {state.companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">تاريخ الطلب</label>
                  <input type="text" disabled value={formatDate(Date.now())} className="w-full p-2 border rounded-lg bg-gray-50" />
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-start">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2">الصنف</th>
                      <th className="px-4 py-2">التكلفة</th>
                      <th className="px-4 py-2">الكمية</th>
                      <th className="px-4 py-2">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {newOrderItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{item.name}</td>
                        <td className="px-4 py-2">{formatCurrency(item.costPrice)}</td>
                        <td className="px-4 py-2">{item.quantity}</td>
                        <td className="px-4 py-2">{formatCurrency(item.costPrice * item.quantity)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="p-2">
                        <button 
                          onClick={() => {
                            const name = prompt('اسم الصنف؟');
                            const barcode = prompt('الباركود؟');
                            const cost = parseFloat(prompt('سعر التكلفة؟') || '0');
                            const qty = parseInt(prompt('الكمية؟') || '1');
                            if (name && barcode) {
                              setNewOrderItems([...newOrderItems, { 
                                name, barcode, costPrice: cost, quantity: qty,
                                sellingPrice: cost * (1 + (state.settings.profitMargin / 100))
                              }]);
                            }
                          }}
                          className="w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> إضافة صنف
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">المبلغ المدفوع حالياً</label>
                  <input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} 
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="text-end">
                  <div className="text-sm text-gray-500">إجمالي الفاتورة</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(newOrderItems.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setIsAddingOrder(false)} className="px-6 py-2 border rounded-lg bg-white">إلغاء</button>
              <button onClick={handleCreateOrder} className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700">اعتماد الفاتورة</button>
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة شركة */}
      {isAddingCompany && (
        <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-start">
            <h2 className="text-xl font-bold mb-4">إضافة مورد جديد</h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">اسم الشركة</label>
                <input required name="name" className="w-full p-2 border rounded-lg" placeholder="اسم المورد" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddingCompany(false)} className="px-4 py-2 border rounded-lg">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">حفظ المورد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderRequests;
