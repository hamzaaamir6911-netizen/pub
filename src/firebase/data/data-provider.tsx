
"use client";

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { collection, query, where, orderBy, serverTimestamp, addDoc, deleteDoc, doc, writeBatch, Timestamp, getDocs } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import type { Item, Customer, Sale, Expense, Transaction, Vendor } from '@/lib/types';
import { useFirebase } from '../firebase-provider';
import { useAuth } from '../auth/auth-provider';

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

const firestoreTimestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp.seconds === 'number' && typeof timestamp.nanoseconds === 'number') {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds).toDate();
  }
  return new Date(timestamp);
};


const mapDocument = <T extends { id: string, date?: any, createdAt?: any }>(doc: any): T => {
    const data = doc.data();
    const result: any = {
        id: doc.id,
        ...data,
    };
    if (data.date) {
        result.date = firestoreTimestampToDate(data.date);
    }
     if (data.createdAt) {
        result.createdAt = firestoreTimestampToDate(data.createdAt);
    }
    return result as T;
};


export const DataProvider = ({ children }: { children: ReactNode }) => {
    const { db } = useFirebase();
    const { user } = useAuth();

    const basePath = user ? `users/${user.uid}` : null;

    const itemsQuery = useMemo(() => basePath ? query(collection(db, basePath, 'items'), orderBy('createdAt', 'desc')) : null, [db, basePath]);
    const customersQuery = useMemo(() => basePath ? query(collection(db, basePath, 'customers'), orderBy('createdAt', 'desc')) : null, [db, basePath]);
    const vendorsQuery = useMemo(() => basePath ? query(collection(db, basePath, 'vendors'), orderBy('createdAt', 'desc')) : null, [db, basePath]);
    const salesQuery = useMemo(() => basePath ? query(collection(db, basePath, 'sales'), orderBy('date', 'desc')) : null, [db, basePath]);
    const expensesQuery = useMemo(() => basePath ? query(collection(db, basePath, 'expenses'), orderBy('date', 'desc')) : null, [db, basePath]);
    const transactionsQuery = useMemo(() => basePath ? query(collection(db, basePath, 'transactions'), orderBy('date', 'desc')) : null, [db, basePath]);

    const [itemsSnapshot, itemsLoading] = useCollection(itemsQuery);
    const [customersSnapshot, customersLoading] = useCollection(customersQuery);
    const [vendorsSnapshot, vendorsLoading] = useCollection(vendorsQuery);
    const [salesSnapshot, salesLoading] = useCollection(salesQuery);
    const [expensesSnapshot, expensesLoading] = useCollection(expensesQuery);
    const [transactionsSnapshot, transactionsLoading] = useCollection(transactionsQuery);
    
    const items: Item[] = useMemo(() => itemsSnapshot ? itemsSnapshot.docs.map(doc => mapDocument<Item>(doc)) : [], [itemsSnapshot]);
    const customers: Customer[] = useMemo(() => customersSnapshot ? customersSnapshot.docs.map(doc => mapDocument<Customer>(doc)) : [], [customersSnapshot]);
    const vendors: Vendor[] = useMemo(() => vendorsSnapshot ? vendorsSnapshot.docs.map(doc => mapDocument<Vendor>(doc)) : [], [vendorsSnapshot]);
    const sales: Sale[] = useMemo(() => salesSnapshot ? salesSnapshot.docs.map(doc => mapDocument<Sale>(doc)) : [], [salesSnapshot]);
    const expenses: Expense[] = useMemo(() => expensesSnapshot ? expensesSnapshot.docs.map(doc => mapDocument<Expense>(doc)) : [], [expensesSnapshot]);
    const transactions: Transaction[] = useMemo(() => transactionsSnapshot ? transactionsSnapshot.docs.map(doc => mapDocument<Transaction>(doc)) : [], [transactionsSnapshot]);

    const loading = !user || itemsLoading || customersLoading || vendorsLoading || salesLoading || expensesLoading || transactionsLoading;

    const getCollectionRef = (collectionName: string) => {
        if (!basePath) throw new Error("User not authenticated.");
        return collection(db, basePath, collectionName);
    }
    
    // --- Item Management ---
    const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
        return addDoc(getCollectionRef('items'), {...item, createdAt: serverTimestamp()});
    };
    const deleteItem = async (id: string) => {
        if (!basePath) return;
        await deleteDoc(doc(db, basePath, 'items', id));
    };

    // --- Customer Management ---
    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        return addDoc(getCollectionRef('customers'), {...customer, createdAt: serverTimestamp()});
    };
    const deleteCustomer = async (id: string) => {
        if (!basePath) return;
        await deleteDoc(doc(db, basePath, 'customers', id));
    };

    // --- Vendor Management ---
    const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
        return addDoc(getCollectionRef('vendors'), {...vendor, createdAt: serverTimestamp()});
    };
    const deleteVendor = async (id: string) => {
        if (!basePath) return;
        await deleteDoc(doc(db, basePath, 'vendors', id));
    };

    // --- Transaction Management ---
    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        await addDoc(getCollectionRef('transactions'), {...transaction, date: serverTimestamp()});
    };
    const deleteTransaction = async (id: string) => {
        if (!basePath) return;
        await deleteDoc(doc(db, basePath, 'transactions', id));
    };

    // --- Sale Management ---
    const addSale = async (sale: Omit<Sale, 'id' | 'date' | 'total' | 'status'>) => {
        if (!basePath) return;
        const subtotal = sale.items.reduce((total, currentItem) => {
            const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            return total + (itemTotal - discountAmount);
        }, 0);
        const overallDiscountAmount = (subtotal * sale.discount) / 100;
        const total = subtotal - overallDiscountAmount;
        const newSale = { ...sale, total, status: 'draft', date: serverTimestamp() };
        await addDoc(getCollectionRef('sales'), newSale);
    };

    const postSale = async (saleId: string) => {
        if (!basePath) return;
        const saleRef = doc(db, basePath, 'sales', saleId);
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;

        const batch = writeBatch(db);
        batch.update(saleRef, { status: 'posted' });

        const transactionData = {
            description: `Sale to ${sale.customerName}`,
            amount: sale.total,
            type: 'debit',
            category: 'Sale',
            customerId: sale.customerId,
            customerName: sale.customerName,
            date: sale.date // Use the original sale date for the transaction
        };
        const transactionRef = doc(getCollectionRef('transactions'));
        batch.set(transactionRef, transactionData);

        await batch.commit();
    };

    const deleteSale = async (id: string) => {
        if (!basePath) return;
        const saleToDelete = sales.find(s => s.id === id);
        if (!saleToDelete) return;
    
        const batch = writeBatch(db);
    
        // Delete the sale document
        const saleRef = doc(db, basePath, 'sales', id);
        batch.delete(saleRef);
    
        // If the sale was posted, find and delete the associated transaction
        if (saleToDelete.status === 'posted') {
            const q = query(getCollectionRef('transactions'), 
                where("category", "==", "Sale"), 
                where("description", "==", `Sale to ${saleToDelete.customerName}`),
                where("amount", "==", saleToDelete.total)
            );
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                // To be more precise, you might want to match dates, but this is often good enough
                batch.delete(doc.ref);
            });
        }
    
        await batch.commit();
    };

    // --- Expense Management ---
    const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
        if (!basePath) return;
        const vendor = vendors.find(v => v.id === expense.vendorId);
        const batch = writeBatch(db);

        const expenseRef = doc(getCollectionRef('expenses'));
        batch.set(expenseRef, {...expense, date: serverTimestamp()});

        const transactionRef = doc(getCollectionRef('transactions'));
        batch.set(transactionRef, {
            description: expense.title,
            amount: expense.amount,
            type: 'debit',
            category: expense.category,
            vendorId: expense.vendorId,
            vendorName: vendor?.name,
            date: serverTimestamp()
        });

        await batch.commit();
    };

    const deleteExpense = async (id: string) => {
        if (!basePath) return;
        const expenseToDelete = expenses.find(e => e.id === id);
        if (!expenseToDelete) return;
    
        const batch = writeBatch(db);
        const expenseRef = doc(db, basePath, 'expenses', id);
        batch.delete(expenseRef);
    
        // Find and delete the associated transaction
        const q = query(getCollectionRef('transactions'),
            where("category", "==", expenseToDelete.category),
            where("description", "==", expenseToDelete.title),
            where("amount", "==", expenseToDelete.amount),
            where("type", "==", "debit")
        );
    
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
    
        await batch.commit();
    };

    // --- Dashboard & Report Calculations ---
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
            {children}
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
