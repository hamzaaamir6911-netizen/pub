
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Item, Customer, Sale, Expense, SaleItem, Transaction } from '@/lib/types';
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
                return JSON.parse(storedValue, (key, value) => {
                    if (key === 'date' && typeof value === 'string') {
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
  sales: Sale[];
  expenses: Expense[];
  transactions: Transaction[];
  addItem: (item: Omit<Item, 'id'>) => Item;
  deleteItem: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total'>) => Sale;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Expense;
  deleteExpense: (id:string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Transaction;
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

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useLocalStorageState<Item[]>('items', mockItems);
  const [customers, setCustomers] = useLocalStorageState<Customer[]>('customers', initialMockCustomers);
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

  // --- Sale Management ---
  const addSale = (sale: Omit<Sale, 'id' | 'date' | 'total'>): Sale => {
    const subtotal = sale.items.reduce((total, currentItem) => {
        const itemDetails = items.find(i => i.id === currentItem.itemId);
        if (!itemDetails) return total;

        if (itemDetails.category === 'Aluminium' && currentItem.length && currentItem.width) {
             const totalFeet = (currentItem.length * currentItem.width / 144) * (currentItem.quantity || 1);
             return total + (itemDetails.salePrice * totalFeet);
        }
        // For accessories or items sold by piece/kg without dimensions
        return total + (itemDetails.salePrice * (currentItem.quantity || 1));
    }, 0);
    
    const discountAmount = (subtotal * sale.discount) / 100;
    const total = subtotal - discountAmount;

    const newSale: Sale = { ...sale, id: `SALE${Date.now().toString().slice(-4)}`, date: new Date(), total };
    setSales(prev => [newSale, ...prev]);
    
    addTransaction({
        description: `Sale to ${newSale.customerName}`,
        amount: newSale.total,
        type: 'credit',
        category: 'Sale'
    });
    
    // Deduct stock
    newSale.items.forEach(saleItem => {
        setItems(prevItems => prevItems.map(stockItem => {
            if (stockItem.id === saleItem.itemId) {
                let quantityToDeduct = saleItem.quantity;
                 if (stockItem.category === 'Aluminium' && saleItem.length && saleItem.width) {
                    const totalFeet = (saleItem.length * saleItem.width / 144) * saleItem.quantity;
                    quantityToDeduct = totalFeet; 
                }
                // No quantity to deduct from as it was removed
                return stockItem;
            }
            return stockItem;
        }));
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
    
    addTransaction({
        description: newExpense.title,
        amount: newExpense.amount,
        type: 'debit',
        category: newExpense.category
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
    const newTransaction = { ...transaction, id: `TRN${Date.now().toString().slice(-4)}`, date: new Date() };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    return newTransaction;
  }
  
  // --- Dashboard & Report Calculations ---
  const getDashboardStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalStockValue = 0; // Removed as per user request
    
    const totalCostOfGoodsSold = sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, saleItem) => {
        const item = items.find(i => i.id === saleItem.itemId);
        if (!item) return itemSum;
  
        if (item.category === 'Aluminium' && saleItem.length && saleItem.width) {
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
      sales: sales.filter(s => new Date(s.date).toDateString() === today.toDateString()),
      expenses: expenses.filter(e => new Date(e.date).toDateString() === today.toDateString()),
    };
    
    return {
      totalSales,
      totalExpenses,
      totalStockValue,
      profitLoss,
      todaySummary,
    };
  };

  const getMonthlySalesData = () => {
    const salesByMonth: { [key: string]: number } = {};
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      const month = saleDate.toLocaleString('default', { month: 'short' });
      if (!salesByMonth[month]) {
        salesByMonth[month] = 0;
      }
      salesByMonth[month] += sale.total;
    });

    const lastSixMonths = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        lastSixMonths.push(d.toLocaleString('default', { month: 'short' }));
    }

    return lastSixMonths.map(month => ({
      name: month,
      sales: salesByMonth[month] || 0,
    }));
  };

  const value = {
    items,
    customers,
    sales,
    expenses,
    transactions,
    addItem,
    deleteItem,
    addCustomer,
    deleteCustomer,
    addSale,
    deleteSale,
    addExpense,
    deleteExpense,
    addTransaction,
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

    