
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Item, Customer, Sale, Expense, SaleItem, Transaction, Vendor } from '@/lib/types';
import { mockItems, mockCustomers as initialMockCustomers, mockSales as initialMockSales, mockExpenses as initialMockExpenses } from '@/lib/data';

// --- LocalStorage Hook ---
function useLocalStorageState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue) {
                // The reviver function is crucial for converting date strings back to Date objects
                return JSON.parse(storedValue, (reviverKey, value) => {
                    if (reviverKey === 'date' && typeof value === 'string') {
                        const d = new Date(value);
                        if (!isNaN(d.getTime())) {
                            return d;
                        }
                    }
                    return value;
                });
            }
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
        }
        return defaultValue;
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
}


interface DataContextProps {
  items: Item[];
  customers: Customer[];
  vendors: Vendor[];
  sales: Sale[];
  expenses: Expense[];
  transactions: Transaction[];
  addItem: (item: Omit<Item, 'id'>) => Item;
  deleteItem: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  deleteCustomer: (id: string) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => Vendor;
  deleteVendor: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total'>) => Sale;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Expense;
  deleteExpense: (id:string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Transaction;
  deleteTransaction: (id: string) => void;
  getDashboardStats: () => {
    totalSales: number;
    totalExpenses: number;
    totalStockValue: number;
    profitLoss: number;
    todaySummary: {
        sales: Sale[];
        expenses: Expense[];
    };
  };
  getMonthlySalesData: () => { name: string; sales: number }[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const DATA_VERSION = '1.3'; // Increment this to force a refresh

export const DataProvider = ({ children }: { children: ReactNode }) => {
    
  useEffect(() => {
    const storedVersion = window.localStorage.getItem('data_version');
    if (storedVersion !== DATA_VERSION) {
      console.log('Data version mismatch. Clearing old data.');
      window.localStorage.removeItem('items');
      window.localStorage.removeItem('sales');
      window.localStorage.removeItem('customers');
      window.localStorage.removeItem('vendors');
      window.localStorage.removeItem('expenses');
      window.localStorage.removeItem('transactions');
      window.localStorage.setItem('data_version', DATA_VERSION);
      // Optional: force a reload to ensure the new data is loaded
      window.location.reload();
    }
  }, []);

  const [items, setItems] = useLocalStorageState<Item[]>('items', mockItems);
  const [customers, setCustomers] = useLocalStorageState<Customer[]>('customers', initialMockCustomers);
  const [vendors, setVendors] = useLocalStorageState<Vendor[]>('vendors', []);
  const [sales, setSales] = useLocalStorageState<Sale[]>('sales', initialMockSales);
  const [expenses, setExpenses] = useLocalStorageState<Expense[]>('expenses', initialMockExpenses);
  const [transactions, setTransactions] = useLocalStorageState<Transaction[]>('transactions', []);

  // --- Item Management ---
  const addItem = (item: Omit<Item, 'id'>): Item => {
    const newItem = { ...item, id: `ITM${Date.now().toString().slice(-4)}` };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // --- Customer Management ---
  const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
    const newCustomer = { ...customer, id: `CUST${Date.now().toString().slice(-4)}` };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  // --- Vendor Management ---
    const addVendor = (vendor: Omit<Vendor, 'id'>): Vendor => {
        const newVendor = { ...vendor, id: `VEND${Date.now().toString().slice(-4)}` };
        setVendors(prev => [newVendor, ...prev]);
        return newVendor;
    };

    const deleteVendor = (id: string) => {
        setVendors(prev => prev.filter(vendor => vendor.id !== id));
    };

  // --- Sale Management ---
  const addSale = (sale: Omit<Sale, 'id' | 'date' | 'total'>): Sale => {
    const subtotal = sale.items.reduce((total, currentItem) => {
        const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
        const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
        
        return total + (itemTotal - discountAmount);
    }, 0);
    
    const overallDiscountAmount = (subtotal * sale.discount) / 100;
    const total = subtotal - overallDiscountAmount;

    const newSale: Sale = { ...sale, id: `SALE${Date.now().toString().slice(-4)}`, date: new Date(), total };
    setSales(prev => [newSale, ...prev]);
    
    // A sale DEBITS the customer's account (increases their due balance)
    addTransaction({
        description: `Sale to ${newSale.customerName}`,
        amount: newSale.total,
        type: 'debit',
        category: 'Sale',
        customerId: newSale.customerId,
        customerName: newSale.customerName,
    });
    
    return newSale;
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (!saleToDelete) return;

    setSales(prev => prev.filter(sale => sale.id !== id));
    // Also remove the associated transaction
    setTransactions(prev => prev.filter(t => !(t.category === 'Sale' && t.description === `Sale to ${saleToDelete.customerName}` && t.amount === saleToDelete.total)));
  };
  
  // --- Expense Management ---
  const addExpense = (expense: Omit<Expense, 'id'| 'date'>): Expense => {
    const newExpense = { ...expense, id: `EXP${Date.now().toString().slice(-4)}`, date: new Date() };
    setExpenses(prev => [newExpense, ...prev]);
    
    const vendor = vendors.find(v => v.id === expense.vendorId);
    
    // An expense is a debit from our main ledger
    addTransaction({
        description: newExpense.title,
        amount: newExpense.amount,
        type: 'debit',
        category: newExpense.category,
        vendorId: newExpense.vendorId,
        vendorName: vendor?.name
    });

    return newExpense;
  };

  const deleteExpense = (id: string) => {
     const expenseToDelete = expenses.find(e => e.id === id);
    if (!expenseToDelete) return;

    setExpenses(prev => prev.filter(expense => expense.id !== id));
     // Also remove the associated transaction
    setTransactions(prev => prev.filter(t => !(t.description === expenseToDelete.title && t.amount === expenseToDelete.amount && t.type === 'debit' && t.category === expenseToDelete.category)));
  };

  // --- Transaction Management ---
  const addTransaction = (transaction: Omit<Transaction, 'id'| 'date'>): Transaction => {
    // Cash received from customer CREDITS their account (reduces their due balance)
    // Payments to vendors DEBIT our cash account.
    const newTransaction = { ...transaction, id: `TRN${Date.now().toString().slice(-4)}`, date: new Date() };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newTransaction;
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }
  
  // --- Dashboard & Report Calculations ---
  const getDashboardStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const cashReceived = transactions.reduce((sum, transaction) => {
        // Only include cash receipts not directly tied to a sale's creation
        if (transaction.type === 'credit' && transaction.category !== 'Sale') {
            return sum + transaction.amount;
        }
        return sum;
    }, 0);
    
    const totalRevenue = totalSales + cashReceived;

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalStockValue = 0; 
    
    const totalCostOfGoodsSold = sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, saleItem) => {
        const item = items.find(i => i.id === saleItem.itemId);
        if (!item) return itemSum;
  
        let quantityInFeet = saleItem.quantity;
        if (item.category === 'Aluminium' && saleItem.feet) {
          quantityInFeet = saleItem.feet * saleItem.quantity;
        }

        return itemSum + (item.purchasePrice * quantityInFeet);
      }, 0);
      return sum + saleCost;
    }, 0);
  
    const profitLoss = totalRevenue - totalCostOfGoodsSold - totalExpenses;
  
    const today = new Date();
    const todaySummary = {
      sales: sales.filter(s => new Date(s.date).toDateString() === today.toDateString()),
      expenses: expenses.filter(e => new Date(e.date).toDateString() === today.toDateString()),
    };
    
    return {
      totalSales: totalRevenue,
      totalExpenses,
      totalStockValue,
      profitLoss,
      todaySummary,
    };
  };

  const getMonthlySalesData = () => {
    const revenueByMonth: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const month = saleDate.toLocaleString('default', { month: 'short' });
      if (!revenueByMonth[month]) {
        revenueByMonth[month] = 0;
      }
      revenueByMonth[month] += sale.total;
    });

    transactions.forEach(transaction => {
      if (transaction.type === 'credit' && transaction.category !== 'Sale') {
        const transDate = new Date(transaction.date);
        const month = transDate.toLocaleString('default', { month: 'short' });
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = 0;
        }
        revenueByMonth[month] += transaction.amount;
      }
    });

    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        lastSixMonths.push(d.toLocaleString('default', { month: 'short' }));
    }

    return lastSixMonths.map(month => ({
      name: month,
      sales: revenueByMonth[month] || 0,
    }));
  };

  const value = {
    items,
    customers,
    vendors,
    sales,
    expenses,
    transactions,
    addItem,
    deleteItem,
    addCustomer,
    deleteCustomer,
    addVendor,
    deleteVendor,
    addSale,
    deleteSale,
    addExpense,
    deleteExpense,
    addTransaction,
    deleteTransaction,
    getDashboardStats,
    getMonthlySalesData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
