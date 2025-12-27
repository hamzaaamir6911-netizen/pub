

export type Item = {
  id: string;
  name: string;
  category: 'Aluminium' | 'Glass' | 'Accessories';
  unit: 'Kg' | 'Feet' | 'Piece';
  purchasePrice: number;
  salePrice: number;
  color: string;
  weight?: number;
  quantity: number;
  createdAt: Date;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
};

export type Vendor = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export type SaleItem = {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number; // This will now be Rate
  color: string;
  weight?: number;
  thickness: string;
  feet?: number;
  discount?: number; // Item-level discount percentage
}

export type Sale = {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  date: Date;
  discount: number; // Overall discount percentage
  status: 'draft' | 'posted';
};

export type Estimate = {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  total: number;
  date: Date;
  discount: number; // Overall discount percentage
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: 'Labour' | 'Transport' | 'Electricity' | 'Vendor Payment' | 'Other';
  date: Date;
  vendorId?: string;
};

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  customerId?: string;
  customerName?: string;
  vendorId?: string;
  vendorName?: string;
}
    

    