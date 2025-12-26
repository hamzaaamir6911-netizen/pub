

"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import type { Item, Customer, Sale, Expense, Transaction, Vendor } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, Timestamp, orderBy, query, where, getDocs, runTransaction, increment } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { date } from 'zod';


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

const toDate = (timestamp: any) => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    // Handle cases where it might already be a Date object or a string
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    // Fallback for serverTimestamp, which might be null initially
    return new Date();
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    // Fetch data only if the user is logged in.
    const shouldFetch = !!user;

    // Memoize collection references
    const itemsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'items') : null, [firestore, shouldFetch]);
    const customersCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'customers') : null, [firestore, shouldFetch]);
    const vendorsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'vendors') : null, [firestore, shouldFetch]);
    const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const expensesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'expenses'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const transactionsCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'transactions'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);

    // Fetch data
    const { data: itemsData, isLoading: itemsLoading } = useCollection<Item>(itemsCol);
    const { data: customersData, isLoading: customersLoading } = useCollection<Customer>(customersCol);
    const { data: vendorsData, isLoading: vendorsLoading } = useCollection<Vendor>(vendorsCol);
    const { data: salesData, isLoading: salesLoading } = useCollection<Sale>(salesCol);
    const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesCol);
    const { data: transactionsData, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsCol);
    
    const items = itemsData?.map(item => ({ ...item, quantity: item.quantity ?? 0, createdAt: toDate(item.createdAt) })) || [];
    const customers = customersData?.map(customer => ({ ...customer, createdAt: toDate(customer.createdAt) })) || [];
    const vendors = vendorsData?.map(vendor => ({ ...vendor, createdAt: toDate(vendor.createdAt) })) || [];
    const sales = salesData?.map(sale => ({ ...sale, date: toDate(sale.date) })) || [];
    const expenses = expensesData?.map(expense => ({ ...expense, date: toDate(expense.date) })) || [];
    const transactions = transactionsData?.map(transaction => ({ ...transaction, date: toDate(transaction.date) })) || [];

    const loading = isUserLoading || itemsLoading || customersLoading || vendorsLoading || salesLoading || expensesLoading || transactionsLoading;

    // --- Write Operations ---

    const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
        if (!itemsCol) throw new Error("Items collection not available");
        const newItem = { ...item, createdAt: serverTimestamp() };
        return addDocumentNonBlocking(itemsCol, newItem);
    };
    const deleteItem = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'items', id));
    };

    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        if (!customersCol) throw new Error("Customers collection not available");
        const newCustomer = { ...customer, createdAt: serverTimestamp() };
        return addDocumentNonBlocking(customersCol, newCustomer);
    };
    const deleteCustomer = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'customers', id));
    };
    
    const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
       if (!vendorsCol) throw new Error("Vendors collection not available");
        const newVendor = { ...vendor, createdAt: serverTimestamp() };
        return addDocumentNonBlocking(vendorsCol, newVendor);
    };
    const deleteVendor = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'vendors', id));
    };

    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        if (!transactionsCol) throw new Error("Transactions collection not available");
        const newTransaction = { ...transaction, date: serverTimestamp() };
        // We can't use the non-blocking helper here because it doesn't handle query objects
        const colRef = collection(firestore, 'transactions');
        return addDocumentNonBlocking(colRef, newTransaction);
    };
    const deleteTransaction = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'transactions', id));
    };

    const addSale = async (sale: Omit<Sale, 'id' | 'date' | 'total' | 'status'>) => {
        if (!salesCol || !user) throw new Error("Sales collection not available or user not authenticated");
        
        await runTransaction(firestore, async (transaction) => {
            const salesCollectionRef = collection(firestore, 'sales');
            const salesSnapshot = await getDocs(salesCollectionRef);
            const latestSaleNumber = salesSnapshot.docs.reduce((max, s) => {
                const num = parseInt(s.id.split('-')[1]);
                return isNaN(num) ? max : Math.max(max, num);
            }, 0);
            const newSaleId = `INV-${String(latestSaleNumber + 1).padStart(3, '0')}`;
            const newSaleRef = doc(salesCollectionRef, newSaleId);

            const subtotal = sale.items.reduce((total, currentItem) => {
                const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
                const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
                return total + (itemTotal - discountAmount);
            }, 0);
            const overallDiscountAmount = (subtotal * sale.discount) / 100;
            const total = subtotal - overallDiscountAmount;

            const newSaleData = {
                ...sale,
                id: newSaleId,
                total,
                status: 'draft' as const,
                date: serverTimestamp(),
            };

            transaction.set(newSaleRef, newSaleData);
        });
    };
    

    const postSale = async (saleId: string) => {
        if (!user) throw new Error("User not authenticated");
        const saleRef = doc(firestore, 'sales', saleId);
        const sale = sales.find(s => s.id === saleId);
        if (!sale || sale.status === 'posted') return;

        const batch = writeBatch(firestore);
        
        // 1. Update sale status
        batch.update(saleRef, { status: 'posted' });

        // 2. Add transaction to ledger
        const transactionData = {
            description: `Sale to ${sale.customerName} (Invoice: ${sale.id})`,
            amount: sale.total,
            type: 'debit' as const,
            category: 'Sale',
            customerId: sale.customerId,
            customerName: sale.customerName,
            date: serverTimestamp()
        };
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, transactionData);

        // 3. Update inventory stock
        for (const saleItem of sale.items) {
            const itemRef = doc(firestore, 'items', saleItem.itemId);
            const itemDetails = items.find(i => i.id === saleItem.itemId);
            if(itemDetails) {
                 const quantityToDecrement = (itemDetails.category === 'Aluminium' && saleItem.feet) 
                    ? saleItem.feet * saleItem.quantity
                    : saleItem.quantity;
                batch.update(itemRef, { quantity: increment(-quantityToDecrement) });
            }
        }

        await batch.commit();
    };

    const deleteSale = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        const saleToDelete = sales.find(s => s.id === id);
        if (!saleToDelete) return;
    
        const batch = writeBatch(firestore);
        const saleRef = doc(firestore, 'sales', id);
        batch.delete(saleRef);
    
        if (saleToDelete.status === 'posted') {
            // 1. Delete associated transaction
            const q = query(
                collection(firestore, 'transactions'), 
                where("category", "==", "Sale"), 
                where("description", "==", `Sale to ${saleToDelete.customerName} (Invoice: ${saleToDelete.id})`)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });

            // 2. Replenish inventory stock
            for (const saleItem of saleToDelete.items) {
                const itemRef = doc(firestore, 'items', saleItem.itemId);
                const itemDetails = items.find(i => i.id === saleItem.itemId);
                 if(itemDetails) {
                    const quantityToIncrement = (itemDetails.category === 'Aluminium' && saleItem.feet) 
                        ? saleItem.feet * saleItem.quantity
                        : saleItem.quantity;
                    batch.update(itemRef, { quantity: increment(quantityToIncrement) });
                }
            }
        }
        await batch.commit();
    };
    
    const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
        if (!user) throw new Error("User not authenticated");
        const vendor = vendors.find(v => v.id === expense.vendorId);
        
        const batch = writeBatch(firestore);

        const newExpense = { ...expense, date: serverTimestamp() };
        const expenseRef = doc(collection(firestore, 'expenses'));
        batch.set(expenseRef, newExpense);

        const transactionData = {
            description: expense.title,
            amount: expense.amount,
            type: 'debit' as const,
            category: expense.category,
            vendorId: expense.vendorId,
            vendorName: vendor?.name,
            date: serverTimestamp()
        };
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, transactionData);

        await batch.commit();
    };

    const deleteExpense = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        const expenseToDelete = expenses.find(e => e.id === id);
        if (!expenseToDelete) return;

        const batch = writeBatch(firestore);
        const expenseRef = doc(firestore, 'expenses', id);
        batch.delete(expenseRef);
    
        const q = query(
            collection(firestore, 'transactions'),
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

    const getDashboardStats = () => {
        const totalSales = sales.filter(s => s.status === 'posted').reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalStockValue = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
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

    