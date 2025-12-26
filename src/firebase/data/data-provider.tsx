
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Item, Customer, Sale, Expense, Transaction, Vendor } from '@/lib/types';

interface DataContextProps {
  items: Item[];
  customers: Customer[];
  vendors: Vendor[];
  sales: Sale[];
  expenses: Expense[];
  transactions: Transaction[];
  loading: boolean;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<any>;
  deleteCustomer: (id: string) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<any>;
  deleteVendor: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total' | 'status'>) => Promise<void>;
  postSale: (saleId: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  deleteExpense: (id:string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
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
  getMonthlySalesData: () => { name: string; sales: number, expenses: number }[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, (k, v) => (k.endsWith('date') || k.endsWith('At')) && typeof v === 'string' ? new Date(v) : v) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
     if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
     }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useLocalStorage<Item[]>('items', []);
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [vendors, setVendors] = useLocalStorage<Vendor[]>('vendors', []);
    const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
    const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay
        setTimeout(() => setLoading(false), 500);
    }, []);

    const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
        const newItem = { ...item, id: uuidv4(), createdAt: new Date() };
        setItems(prev => [newItem, ...prev]);
        return newItem;
    };
    const deleteItem = async (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        const newCustomer = { ...customer, id: uuidv4(), createdAt: new Date() };
        setCustomers(prev => [newCustomer, ...prev]);
        return newCustomer;
    };
    const deleteCustomer = async (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
    };
    
    const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
        const newVendor = { ...vendor, id: uuidv4(), createdAt: new Date() };
        setVendors(prev => [newVendor, ...prev]);
        return newVendor;
    };
    const deleteVendor = async (id: string) => {
        setVendors(prev => prev.filter(v => v.id !== id));
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        const newTransaction = { ...transaction, id: uuidv4(), date: new Date() };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    };
    const deleteTransaction = async (id: string) => {
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addSale = async (sale: Omit<Sale, 'id' | 'date' | 'total' | 'status'>) => {
        const subtotal = sale.items.reduce((total, currentItem) => {
            const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            return total + (itemTotal - discountAmount);
        }, 0);
        const overallDiscountAmount = (subtotal * sale.discount) / 100;
        const total = subtotal - overallDiscountAmount;
        const newSale = { ...sale, total, status: 'draft' as const, date: new Date(), id: uuidv4() };
        setSales(prev => [newSale, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    };

    const postSale = async (saleId: string) => {
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        setSales(prev => prev.map(s => s.id === saleId ? { ...s, status: 'posted' as const } : s));

        await addTransaction({
            description: `Sale to ${sale.customerName}`,
            amount: sale.total,
            type: 'debit',
            category: 'Sale',
            customerId: sale.customerId,
            customerName: sale.customerName,
        });
    };

    const deleteSale = async (id: string) => {
        const saleToDelete = sales.find(s => s.id === id);
        if (!saleToDelete) return;

        setSales(prev => prev.filter(s => s.id !== id));

        if (saleToDelete.status === 'posted') {
            const transactionToDelete = transactions.find(t => 
                t.category === 'Sale' &&
                t.description === `Sale to ${saleToDelete.customerName}` &&
                t.amount === saleToDelete.total
            );
            if (transactionToDelete) {
                await deleteTransaction(transactionToDelete.id);
            }
        }
    };
    
    const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
        const vendor = vendors.find(v => v.id === expense.vendorId);
        const newExpense = { ...expense, id: uuidv4(), date: new Date() };
        setExpenses(prev => [newExpense, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));

        await addTransaction({
            description: expense.title,
            amount: expense.amount,
            type: 'debit',
            category: expense.category,
            vendorId: expense.vendorId,
            vendorName: vendor?.name,
        });
    };

    const deleteExpense = async (id: string) => {
        const expenseToDelete = expenses.find(e => e.id === id);
        if (!expenseToDelete) return;

        setExpenses(prev => prev.filter(e => e.id !== id));

        const transactionToDelete = transactions.find(t => 
            t.category === expenseToDelete.category &&
            t.description === expenseToDelete.title &&
            t.amount === expenseToDelete.amount &&
            t.type === 'debit'
        );
        if (transactionToDelete) {
            await deleteTransaction(transactionToDelete.id);
        }
    };

    const getDashboardStats = () => {
        const totalSales = sales.filter(s => s.status === 'posted').reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalStockValue = 0; // Simplified
        const totalCostOfGoodsSold = sales.filter(s => s.status === 'posted').reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, saleItem) => {
                const item = items.find(i => i.id === saleItem.itemId);
                if (!item) return itemSum;
                let quantity = (item.category === 'Aluminium' && saleItem.feet) ? saleItem.feet * saleItem.quantity : saleItem.quantity;
                return itemSum + (item.purchasePrice * quantity);
            }, 0);
        }, 0);
        const profitLoss = totalSales - totalCostOfGoodsSold - totalExpenses;
        const today = new Date();
        const todaySummary = {
            sales: sales.filter(s => new Date(s.date).toDateString() === today.toDateString() && s.status === 'posted'),
            expenses: expenses.filter(e => new Date(e.date).toDateString() === today.toDateString()),
        };
        return { totalSales, totalExpenses, totalStockValue, profitLoss, todaySummary };
    };

    const getMonthlySalesData = () => {
        const revenueByMonth: { [key: string]: number } = {};
        const expensesByMonth: { [key: string]: number } = {};
        
        sales.filter(s => s.status === 'posted').forEach(sale => {
            const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
            revenueByMonth[month] = (revenueByMonth[month] || 0) + sale.total;
        });

        expenses.forEach(expense => {
            const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
            expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount;
        });

        const lastSixMonths = [...Array(6)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d.toLocaleString('default', { month: 'short' });
        }).reverse();

        return lastSixMonths.map(month => ({
            name: month,
            sales: revenueByMonth[month] || 0,
            expenses: expensesByMonth[month] || 0,
        }));
    };
    
    const value = {
        items, customers, vendors, sales, expenses, transactions, loading,
        addItem, deleteItem,
        addCustomer, deleteCustomer,
        addVendor, deleteVendor,
        addSale, postSale, deleteSale,
        addExpense, deleteExpense,
        addTransaction, deleteTransaction,
        getDashboardStats, getMonthlySalesData,
    };

    return (
        <DataContext.Provider value={value}>
            {!loading && children}
        </DataContext.Provider>
    );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
