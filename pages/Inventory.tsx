
import React, { useState } from 'react';
import { Search, Plus, Barcode, Trash2, Edit2, Camera } from 'lucide-react';
import { AppState, Product } from '../types';
import { formatCurrency } from '../utils';
import ScannerModal from '../components/ScannerModal';

interface InventoryProps {
  state: AppState;
  updateState: (updates: Partial<AppState>) => void;
}

const Inventory: React.FC<InventoryProps> = ({ state, updateState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = state.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      barcode: formData.get('barcode') as string,
      name: formData.get('name') as string,
      companyId: formData.get('companyId') as string,
      costPrice: parseFloat(formData.get('costPrice') as string),
      sellingPrice: parseFloat(formData.get('sellingPrice') as string),
      stock: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      unit: formData.get('unit') as string,
    };

    if (editingProduct) {
      updateState({
        products: state.products.map(p => p.id === editingProduct.id ? newProduct : p)
      });
    } else {
      updateState({
        products: [...state.products, newProduct]
      });
    }
    setIsAdding(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      updateState({ products: state.products.filter(p => p.id !== id) });
    }
  };

  const handleScan = (barcode: string) => {
    setIsScanning(false);
    setSearchTerm(barcode);
    const existing = state.products.find(p => p.barcode === barcode);
    if (!existing) {
      const wantToRegister = confirm(`المنتج بالباركود ${barcode} غير موجود. هل تريد تسجيله الآن؟`);
      if (wantToRegister) {
        setEditingProduct({
          id: '', barcode, name: '', companyId: '', costPrice: 0, sellingPrice: 0, stock: 0
        });
        setIsAdding(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-start">
          <h1 className="text-2xl font-bold text-gray-900">إدارة المخزون</h1>
          <p className="text-gray-500">عرض وإدارة مخزون المنتجات الخاصة بك.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsScanning(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Camera size={20} />
            <span>مسح</span>
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="البحث بالاسم أو الباركود..." 
            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">المنتج</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">الباركود</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">المخزون</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">التكلفة</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">سعر البيع</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.category || 'بدون تصنيف'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Barcode size={16} />
                      <span className="font-mono text-sm">{product.barcode}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock} متوفر
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(product.costPrice)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-6 py-4 text-end space-x-2">
                    <button 
                      onClick={() => { setEditingProduct(product); setIsAdding(true); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد منتجات. أضف منتجاً جديداً أو جرب بحثاً آخر.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScannerModal 
        isOpen={isScanning} 
        onClose={() => setIsScanning(false)} 
        onScan={handleScan} 
      />

      {/* Add/Edit Modal */}
      {(isAdding || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b text-start">
              <h2 className="text-xl font-bold">{editingProduct?.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-start">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                  <input required name="name" defaultValue={editingProduct?.name} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                  <input required name="barcode" defaultValue={editingProduct?.barcode} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                  <input name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="مثال: ألبان" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
                  <input required type="number" step="0.01" name="costPrice" defaultValue={editingProduct?.costPrice} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                  <input required type="number" step="0.01" name="sellingPrice" defaultValue={editingProduct?.sellingPrice} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المخزون الحالي</label>
                  <input required type="number" name="stock" defaultValue={editingProduct?.stock} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                  <input name="unit" defaultValue={editingProduct?.unit} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="كجم، قطعة، عبوة" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingProduct(null); }} className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition-colors">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">حفظ المنتج</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
