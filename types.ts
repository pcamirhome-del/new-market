
export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export type Permission = 
  | 'DASHBOARD'
  | 'INVENTORY'
  | 'ORDER_REQUESTS'
  | 'BARCODE_PRINT'
  | 'ADMIN_SETTINGS';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  permissions: Permission[];
}

export interface Company {
  id: string; // Serial 100, 101...
  name: string;
  code: string;
  debt: number;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  companyId: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  description?: string;
  unit?: string;
  category?: string;
}

export interface Sale {
  id: string;
  productId: string;
  quantity: number;
  total: number;
  timestamp: number;
}

export interface Order {
  id: string; // Serial 1000, 1001...
  companyId: string;
  status: 'PENDING' | 'RECEIVED';
  items: Array<{
    name: string;
    barcode: string;
    costPrice: number;
    sellingPrice: number;
    quantity: number;
  }>;
  totalAmount: number;
  paidAmount: number;
  createdAt: number;
  dueDate: number; // +7 days
}

export interface GlobalSettings {
  appName: string;
  profitMargin: number; // e.g., 15 for 15%
}

export interface AppState {
  users: User[];
  currentUser: User | null;
  companies: Company[];
  products: Product[];
  sales: Sale[];
  orders: Order[];
  settings: GlobalSettings;
}
