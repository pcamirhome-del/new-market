
import React, { useState } from 'react';
import { Plus, Search, Share2, Printer, CheckCircle2, Clock, Trash2, X } from 'lucide-react';
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
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);

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
    const nextId = getNextSerialNumber(state.orders, 1000);
    
    const newOrder: Order = {
      id: nextId,
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

  const shareViaWhatsApp = (order: Order) => {
    const company = state.companies.find(c => c.id === order.companyId);
    const message = `فاتورة طلب رقم: ${order.id}%0Aمن: ${state.settings.appName}%0Aالمورد: ${company?.name}%0Aالإجمالي: ${formatCurrency(order.totalAmount)}`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handlePrint = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 500);
  };

  return (
    <div className="space-y-6 text-start" dir="rtl">
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المشتريات والطلبات</h1>
          <p className="text-gray-500">إدارة فواتير الموردين وطلبات الشراء.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsAddingCompany(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 font-bold">
            <Plus size={18} /> شركة جديدة
          </button>
          <button onClick={() => setIsAddingOrder(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-blue-100">
            <Plus size={18} /> فاتورة شراء
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden no-print">
        <table className="w-full text-start">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">رقم الطلب</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">المورد</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">الإجمالي</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">تاريخ الاستحقاق</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">الحالة</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-end">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {state.orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">#{order.id}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-800">{state.companies.find(c => c.id === order.companyId)?.name}</div>
                  <div className="text-[10px] text-gray-400">كود: {state.companies.find(c => c.id === order.companyId)?.code}</div>
                </td>
                <td className="px-6 py-4 text-sm font-black">{formatCurrency(order.totalAmount)}</td>
                <td className="px-6 py-4 text-xs text-red-500 font-bold">{formatDate(order.dueDate).split(',')[0]}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${order.status === 'RECEIVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status === 'RECEIVED' ? 'تم الاستلام' : 'قيد الانتظار'}
                  </span>
                </td>
                <td className="px-6 py-4 text-end space-x-2">
                  <button onClick={() => shareViaWhatsApp(order)} className="p-2 text-gray-400 hover:text-green-600 ml-2"><Share2 size={18} /></button>
                  <button onClick={() => handlePrint(order)} className="p-2 text-gray-400 hover:text-blue-600"><Printer size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* مودال فاتورة جديدة */}
      {isAddingOrder && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col text-start shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-black">فاتورة مشتريات جديدة</h2>
              <div className="flex items-center gap-4">
                <span className="text-blue-600 font-black text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-100">رقم الفاتورة: {getNextSerialNumber(state.orders, 1000)}</span>
                <button onClick={() => setIsAddingOrder(false)} className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><X size={20}/></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">المورد</label>
                  <div className="flex gap-2">
                    <select 
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="flex-1 p-2 border rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">اختر المورد...</option>
                      {state.companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <button onClick={() => setIsAddingCompany(true)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"><Plus size={20}/></button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">تاريخ الاستحقاق (7 أيام)</label>
                  <input type="text" disabled value={formatDate(Date.now() + (7 * 24 * 60 * 60 * 1000))} className="w-full p-2 border rounded-xl bg-gray-50 text-gray-500" />
                </div>
              </div>

              <div className="border rounded-2xl overflow-hidden shadow-inner bg-gray-50 p-2">
                <table className="w-full text-start border-separate border-spacing-y-2">
                  <thead className="text-[10px] font-black uppercase text-gray-400">
                    <tr>
                      <th className="px-4 py-1">الصنف</th>
                      <th className="px-4 py-1 text-center">التكلفة</th>
                      <th className="px-4 py-1 text-center">الكمية</th>
                      <th className="px-4 py-1 text-end">الإجمالي</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrderItems.map((item, idx) => (
                      <tr key={idx} className="bg-white rounded-xl shadow-sm">
                        <td className="px-4 py-3 text-sm font-bold">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-center">{formatCurrency(item.costPrice)}</td>
                        <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm font-black text-end">{formatCurrency(item.costPrice * item.quantity)}</td>
                        <td className="px-2">
                           <button onClick={() => setNewOrderItems(newOrderItems.filter((_,i) => i !== idx))} className="text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  className="w-full mt-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all flex items-center justify-center gap-2 font-bold"
                >
                  <Plus size={18} /> إضافة صنف جديد للفاتورة
                </button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-end gap-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <div className="w-full sm:w-1/2">
                  <label className="block text-xs font-bold text-blue-600 mb-1">المبلغ المدفوع (العربون)</label>
                  <input 
                    type="number" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} 
                    className="w-full p-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-xl font-black text-blue-700"
                  />
                </div>
                <div className="text-end">
                  <div className="text-xs font-bold text-gray-400">إجمالي الفاتورة النهائي</div>
                  <div className="text-3xl font-black text-gray-900">
                    {formatCurrency(newOrderItems.reduce((sum, i) => sum + (i.costPrice * i.quantity), 0))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsAddingOrder(false)} className="px-8 py-3 border rounded-xl font-bold hover:bg-white transition-colors">إلغاء</button>
              <button onClick={handleCreateOrder} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">اعتماد الفاتورة وحفظها</button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الطباعة المخفية */}
      {printingOrder && (
        <div className="print-only fixed inset-0 bg-white z-[9999] p-12 text-start" dir="rtl">
          <div className="border-4 border-double border-gray-300 p-8 rounded-lg">
            <div className="flex justify-between items-start mb-8 border-b-2 pb-6">
              <div>
                <h1 className="text-3xl font-black mb-2">{state.settings.appName}</h1>
                <p className="text-lg font-bold">المورد: {state.companies.find(c => c.id === printingOrder.companyId)?.name}</p>
                <p className="text-sm text-gray-500">كود المورد: {state.companies.find(c => c.id === printingOrder.companyId)?.code}</p>
              </div>
              <div className="text-end">
                <div className="bg-gray-100 px-4 py-2 rounded mb-2">
                  <span className="font-bold">رقم الفاتورة: </span>
                  <span className="font-mono font-black text-xl">#{printingOrder.id}</span>
                </div>
                <p className="text-sm">تاريخ الطلب: {formatDate(printingOrder.createdAt)}</p>
                <p className="text-sm font-bold text-red-600">تاريخ الاستحقاق: {formatDate(printingOrder.dueDate)}</p>
              </div>
            </div>

            <table className="w-full border-collapse mb-12">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-right">الصنف</th>
                  <th className="border p-3 text-center">الباركود</th>
                  <th className="border p-3 text-center">الكمية</th>
                  <th className="border p-3 text-center">السعر</th>
                  <th className="border p-3 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {printingOrder.items.map((item, i) => (
                  <tr key={i}>
                    <td className="border p-3 font-bold">{item.name}</td>
                    <td className="border p-3 text-center font-mono text-sm">{item.barcode}</td>
                    <td className="border p-3 text-center">{item.quantity}</td>
                    <td className="border p-3 text-center">{formatCurrency(item.costPrice)}</td>
                    <td className="border p-3 text-left font-bold">{formatCurrency(item.costPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="border p-4 text-left font-black text-lg uppercase">إجمالي الفاتورة:</td>
                  <td className="border p-4 text-left font-black text-2xl">{formatCurrency(printingOrder.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="flex justify-between items-center mt-20 pt-12 border-t border-dashed">
              <div className="text-center w-64 border-t border-gray-400 pt-2">
                توقيع المسؤول
              </div>
              <div className="text-center w-64 border-t border-gray-400 pt-2">
                ختم الشركة / المورد
              </div>
            </div>
            
            <div className="mt-20 text-center text-xs text-gray-400">
              طبعت في: {new Date().toLocaleString('ar-SA')} - {state.settings.appName} للأنظمة الذكية
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة شركة */}
      {isAddingCompany && (
        <div className="fixed inset-0 bg-black/50 z-[120] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 text-start shadow-2xl">
            <h2 className="text-xl font-bold mb-4">إضافة مورد جديد</h2>
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">اسم الشركة</label>
                <input required name="name" className="w-full p-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="اسم المورد" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddingCompany(false)} className="px-4 py-2 border rounded-xl">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">حفظ المورد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderRequests;
