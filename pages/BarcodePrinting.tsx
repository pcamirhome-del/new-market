
import React, { useState } from 'react';
import { Search, Printer, FileSpreadsheet, Plus, X } from 'lucide-react';
import { AppState, Product } from '../types';
import { formatCurrency } from '../utils';

interface BarcodePrintingProps {
  state: AppState;
}

const BarcodePrinting: React.FC<BarcodePrintingProps> = ({ state }) => {
  const [selectedItems, setSelectedItems] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = state.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addItem = (p: Product) => {
    setSelectedItems([...selectedItems, p]);
  };

  const removeItem = (idx: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Label Printing</h1>
          <p className="text-gray-500">Create barcode labels for your shelves.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => alert('Exporting to Excel...')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <FileSpreadsheet size={18} /> Export Excel
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Printer size={18} /> Print All
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm no-print space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products to add..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <div className="max-h-40 overflow-y-auto border rounded-lg divide-y">
            {filtered.map(p => (
              <button 
                key={p.id}
                onClick={() => { addItem(p); setSearchTerm(''); }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
              >
                <span>{p.name}</span>
                <Plus size={16} className="text-blue-500" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="print-grid grid grid-cols-2 md:grid-cols-5 gap-4">
        {selectedItems.map((item, idx) => (
          <div key={idx} className="relative group border p-4 rounded-lg bg-white flex flex-col items-center justify-center text-center space-y-2 shadow-sm">
            <button 
              onClick={() => removeItem(idx)}
              className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"
            >
              <X size={14} />
            </button>
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{state.settings.appName}</div>
            <div className="text-sm font-bold truncate w-full">{item.name}</div>
            <div className="text-lg font-black">{formatCurrency(item.sellingPrice)}</div>
            <div className="border-t w-full pt-1 mt-1">
              <div className="font-mono text-[10px] text-gray-600">{item.barcode}</div>
              <div className="text-[8px] text-gray-400">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>

      {selectedItems.length === 0 && (
        <div className="p-12 text-center text-gray-500 border-2 border-dashed rounded-xl no-print">
          No labels selected. Search above to add products to the print queue.
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .print-grid {
            display: grid !important;
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 0.5rem !important;
          }
          .print-grid > div {
            border: 1px solid #ddd !important;
            break-inside: avoid;
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BarcodePrinting;
