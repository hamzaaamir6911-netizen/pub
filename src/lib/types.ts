export type Item = {
  id: string;
  name: string;
  category: 'Aluminium' | 'Glass' | 'Accessories';
  quantity: number;
  unit: 'Kg' | 'Feet' | 'Piece';
  purchasePrice: number;
  salePrice: number;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

export type Sale = {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  date: Date;
};

export type Expense = {
  id: string;
  title: string;
  amount: number;
  category: 'Labour' | 'Transport' | 'Electricity' | 'Other';
  date: Date;
};
