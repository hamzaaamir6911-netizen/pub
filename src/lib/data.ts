import type { Item, Customer, Sale, Expense } from '@/lib/types';

export const mockItems: Item[] = [
  { id: 'ITM001', name: 'Aluminium Section A', category: 'Aluminium', quantity: 150.5, unit: 'Kg', purchasePrice: 200, salePrice: 250 },
  { id: 'ITM002', name: 'Toughened Glass 5mm', category: 'Glass', quantity: 50, unit: 'Piece', purchasePrice: 1200, salePrice: 1500 },
  { id: 'ITM003', name: 'Door Handle Chrome', category: 'Accessories', quantity: 200, unit: 'Piece', purchasePrice: 300, salePrice: 400 },
  { id: 'ITM004', name: 'Aluminium Pipe 2"', category: 'Aluminium', quantity: 300, unit: 'Feet', purchasePrice: 80, salePrice: 110 },
  { id: 'ITM005', name: 'Reflective Glass', category: 'Glass', quantity: 25, unit: 'Piece', purchasePrice: 2000, salePrice: 2400 },
  { id: 'ITM006', name: 'Stainless Steel Screws', category: 'Accessories', quantity: 5000, unit: 'Piece', purchasePrice: 2, salePrice: 3 },
];

export const mockCustomers: Customer[] = [
  { id: 'CUS001', name: 'BuildWell Constructions', phone: '9876543210', address: '123 Construction Lane, Pune' },
  { id: 'CUS002', name: 'Modern Homes Inc.', phone: '8765432109', address: '456 Architect Ave, Mumbai' },
  { id: 'CUS003', name: 'Glass & Doors Co.', phone: '7654321098', address: '789 Decor St, Delhi' },
];

export const mockSales: Sale[] = [
  { 
    id: 'SALE001', 
    customerId: 'CUS001', 
    customerName: 'BuildWell Constructions',
    items: [
      { itemId: 'ITM001', itemName: 'Aluminium Section A', quantity: 20, price: 250 },
      { itemId: 'ITM002', itemName: 'Toughened Glass 5mm', quantity: 5, price: 1500 }
    ],
    total: (20 * 250) + (5 * 1500), 
    date: new Date('2024-07-20T10:30:00') 
  },
  { 
    id: 'SALE002', 
    customerId: 'CUS002', 
    customerName: 'Modern Homes Inc.',
    items: [
      { itemId: 'ITM004', itemName: 'Aluminium Pipe 2"', quantity: 100, price: 110 }
    ],
    total: 100 * 110, 
    date: new Date('2024-07-21T14:00:00') 
  },
];

export const mockExpenses: Expense[] = [
  { id: 'EXP001', title: 'Factory Worker Salaries', category: 'Labour', amount: 85000, date: new Date('2024-07-01') },
  { id: 'EXP002', title: 'Goods Transport to Site', category: 'Transport', amount: 5000, date: new Date('2024-07-20') },
  { id: 'EXP003', title: 'Monthly Electricity Bill', category: 'Electricity', amount: 15000, date: new Date('2024-07-05') },
  { id: 'EXP004', title: 'Office Supplies', category: 'Other', amount: 2500, date: new Date('2024-07-15') },
];

export const getDashboardStats = () => {
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalStockValue = mockItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  
  // Simplified profit calculation
  const totalCostOfGoodsSold = mockSales.reduce((sum, sale) => {
    const saleCost = sale.items.reduce((itemSum, saleItem) => {
      const item = mockItems.find(i => i.id === saleItem.itemId);
      return itemSum + (item ? item.purchasePrice * saleItem.quantity : 0);
    }, 0);
    return sum + saleCost;
  }, 0);

  const profitLoss = totalSales - totalCostOfGoodsSold - totalExpenses;

  const today = new Date();
  const todaySummary = {
    sales: mockSales.filter(s => s.date.toDateString() === today.toDateString()),
    expenses: mockExpenses.filter(e => e.date.toDateString() === today.toDateString()),
  };
  
  return {
    totalSales,
    totalExpenses,
    totalStockValue,
    profitLoss,
    todaySummary,
  };
};

export const getMonthlySalesData = () => {
  const salesByMonth: { [key: string]: number } = {};
  mockSales.forEach(sale => {
    const month = sale.date.toLocaleString('default', { month: 'short' });
    if (!salesByMonth[month]) {
      salesByMonth[month] = 0;
    }
    salesByMonth[month] += sale.total;
  });

  return Object.keys(salesByMonth).map(month => ({
    name: month,
    sales: salesByMonth[month],
  })).reverse();
};
