import type { Item, Customer, Sale, Expense } from '@/lib/types';

export const mockItems: Item[] = [
  { id: 'ITM001', name: 'D 40', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.124 },
  { id: 'ITM002', name: 'D 45', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.180 },
  { id: 'ITM003', name: 'D 60', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.231 },
  { id: 'ITM004', name: 'DF 25', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.150 },
  { id: 'ITM005', name: 'DF 38', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.200 },
  { id: 'ITM006', name: 'DF 51', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.225 },
  { id: 'ITM007', name: 'DR 25', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.145 },
  { id: 'ITM008', name: 'DR 32', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.180 },
  { id: 'ITM009', name: 'DR 38', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.245 },
  { id: 'ITM010', name: 'DR 51', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.265 },
  { id: 'ITM011', name: 'P 25 Plain', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.120 },
  { id: 'ITM012', name: 'P 25 Design', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.125 },
  { id: 'ITM013', name: 'P 38 Plain', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.200 },
  { id: 'ITM014', name: 'P 38 Design', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.220 },
  { id: 'ITM015', name: 'P 42', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.240 },
  { id: 'ITM016', name: 'P 51', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.320 },
  { id: 'ITM017', name: 'P 63', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.450 },
  { id: 'ITM018', name: 'SW 2 Track', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.230 },
  { id: 'ITM019', name: 'SW 3 Track', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.360 },
  { id: 'ITM020', name: 'SW Handle', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.190 },
  { id: 'ITM021', name: 'SW Inter Lock', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.140 },
  { id: 'ITM022', name: 'SW Bearing', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.230 },
  { id: 'ITM023', name: '25x25 Angle', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.110 },
  { id: 'ITM024', name: '25x25 Pipe', category: 'Aluminium', quantity: 100, unit: 'Feet', purchasePrice: 200, salePrice: 250, color: 'Silver', weight: 0.180 },
];

export const mockCustomers: Customer[] = [
 
];

export const mockSales: Sale[] = [];

export const mockExpenses: Expense[] = [];

export const getDashboardStats = () => {
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const totalStockValue = mockItems.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
  
  const totalCostOfGoodsSold = mockSales.reduce((sum, sale) => {
    const saleCost = sale.items.reduce((itemSum, saleItem) => {
      const item = mockItems.find(i => i.id === saleItem.itemId);
      if (!item) return itemSum;

      if (item.unit === 'Feet' && saleItem.length && saleItem.width) {
        const totalFeet = (saleItem.length * saleItem.width / 144) * saleItem.quantity;
        return itemSum + (item.purchasePrice * totalFeet);
      }
      return itemSum + (item.purchasePrice * saleItem.quantity);
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

export const getTransactions = () => {
  const salesAsTransactions = mockSales.map(sale => ({
    id: sale.id,
    date: sale.date,
    description: `Sale to ${sale.customerName}`,
    amount: sale.total,
    type: 'credit' as 'credit' | 'debit'
  }));

  const expensesAsTransactions = mockExpenses.map(expense => ({
    id: expense.id,
    date: expense.date,
    description: expense.title,
    amount: expense.amount,
    type: 'debit' as 'credit' | 'debit'
  }));

  return [...salesAsTransactions, ...expensesAsTransactions].sort((a,b) => b.date.getTime() - a.date.getTime());
}
