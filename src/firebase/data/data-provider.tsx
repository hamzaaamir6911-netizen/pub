

"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { Item, Customer, Sale, Expense, Transaction, Vendor, Estimate, Labour, SalaryPayment } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, Timestamp, orderBy, query, where, getDocs, runTransaction, increment, addDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';
import { date } from 'zod';


interface DataContextProps {
  items: Item[];
  customers: Customer[];
  vendors: Vendor[];
  labourers: Labour[];
  sales: Sale[];
  estimates: Estimate[];
  expenses: Expense[];
  transactions: Transaction[];
  salaryPayments: SalaryPayment[];
  loading: boolean;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
  updateItemStock: (id: string, newQuantity: number) => Promise<void>;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<any>;
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt'>) => Promise<any>;
  deleteVendor: (id: string) => Promise<void>;
  addLabour: (labour: Omit<Labour, 'id' | 'createdAt'>) => Promise<any>;
  updateLabour: (id: string, labour: Partial<Omit<Labour, 'id' | 'createdAt'>>) => Promise<void>;
  deleteLabour: (id: string) => Promise<void>;
  addSale: (sale: Omit<Sale, 'id' | 'total' | 'status'>) => Promise<void>;
  updateSale: (saleId: string, sale: Omit<Sale, 'id' | 'total' | 'status'>) => Promise<void>;
  postSale: (saleId: string) => Promise<void>;
  unpostSale: (saleId: string) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  addEstimate: (estimate: Omit<Estimate, 'id' | 'date' | 'total'>) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  deleteExpense: (id:string) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSalaryPayment: (payment: Omit<SalaryPayment, 'id' | 'date'>) => Promise<void>;
  deleteSalaryPayment: (paymentId: string) => Promise<void>;
  getDashboardStats: () => {
    totalSales: number;
    totalExpenses: number;
    profitLoss: number;
    todaySummary: {
        sales: Sale[];
        expenses: Expense[];
    };
  };
  getMonthlySalesData: () => { name: string; sales: number, expenses: number }[];
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const toDate = (timestamp: any): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    // For string or number dates, or if it's null/undefined
    return new Date(timestamp || new Date());
};

const sectionsData = [
  { name: 'D 40 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.49, ratePerFt: 495 },
  { name: 'D 40 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.16, ratePerFt: 162 },
  { name: 'SP 40 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.44, ratePerFt: 444 },
  { name: 'SP 2.5*1 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'SP 2.5*1 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.22, ratePerFt: 222 },
  { name: 'SP 3*1 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.36, ratePerFt: 364 },
  { name: 'SP 3*1 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.26, ratePerFt: 263 },
  { name: 'SP 3*1.5 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.5, ratePerFt: 505 },
  { name: 'SP 4*1 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.45, ratePerFt: 455 },
  { name: 'SP 4*1.5 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.65, ratePerFt: 657 },
  { name: 'SP 4*2 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.85, ratePerFt: 859 },
  { name: 'D 25 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.35, ratePerFt: 354 },
  { name: 'D 25 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.13, ratePerFt: 131 },
  { name: 'D 25 F (1.2mm)', ratePerKg: 1010, weightPerFt: 0.21, ratePerFt: 212 },
  { name: 'D 25 F Gola (1.2mm)', ratePerKg: 1010, weightPerFt: 0.08, ratePerFt: 81 },
  { name: 'D 25 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.23, ratePerFt: 232 },
  { name: 'D 25 G Gola (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'D 25 K (1.2mm)', ratePerKg: 1010, weightPerFt: 0.28, ratePerFt: 283 },
  { name: 'D 25 KG (1.2mm)', ratePerKg: 1010, weightPerFt: 0.19, ratePerFt: 192 },
  { name: 'F 25 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'F 25 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.11, ratePerFt: 111 },
  { name: 'F 25 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.21, ratePerFt: 212 },
  { name: 'F 25 T (1.2mm)', ratePerKg: 1010, weightPerFt: 0.21, ratePerFt: 212 },
  { name: 'F 25 P (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'IN 25 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.29, ratePerFt: 293 },
  { name: 'IN 25 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.11, ratePerFt: 111 },
  { name: 'IN 25 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: 'IN 25 P (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'D 38 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.44, ratePerFt: 444 },
  { name: 'D 38 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'D 38 F (1.2mm)', ratePerKg: 1010, weightPerFt: 0.26, ratePerFt: 263 },
  { name: 'D 38 FG (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: 'D 38 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.26, ratePerFt: 263 },
  { name: 'D 38 GG (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: 'F 38 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.44, ratePerFt: 444 },
  { name: 'F 38 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.14, ratePerFt: 141 },
  { name: 'F 38 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'IN 38 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.44, ratePerFt: 444 },
  { name: 'IN 38 C (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'IN 38 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.29, ratePerFt: 293 },
  { name: 'IN 38 P (1.2mm)', ratePerKg: 1010, weightPerFt: 0.2, ratePerFt: 202 },
  { name: 'IN 38 T (1.2mm)', ratePerKg: 1010, weightPerFt: 0.26, ratePerFt: 263 },
  { name: 'D 100 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.72, ratePerFt: 727 },
  { name: 'DD 100 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.9, ratePerFt: 909 },
  { name: 'F 100 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.72, ratePerFt: 727 },
  { name: 'FF 100 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.9, ratePerFt: 909 },
  { name: 'I 100 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'I 100 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.4, ratePerFt: 404 },
  { name: 'D 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.65, ratePerFt: 657 },
  { name: 'DD 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.76, ratePerFt: 768 },
  { name: 'F 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.6, ratePerFt: 606 },
  { name: 'FF 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.72, ratePerFt: 727 },
  { name: 'I 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.28, ratePerFt: 283 },
  { name: 'I 75 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.38, ratePerFt: 384 },
  { name: 'H 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.17, ratePerFt: 172 },
  { name: 'G 75 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.2, ratePerFt: 202 },
  { name: 'D 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.48, ratePerFt: 485 },
  { name: 'DD 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.58, ratePerFt: 586 },
  { name: 'F 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.45, ratePerFt: 455 },
  { name: 'FF 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.56, ratePerFt: 566 },
  { name: 'I 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.25, ratePerFt: 253 },
  { name: 'I 65 G (1.2mm)', ratePerKg: 1010, weightPerFt: 0.34, ratePerFt: 343 },
  { name: 'H 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.16, ratePerFt: 162 },
  { name: 'G 65 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: 'D 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.22, ratePerFt: 222 },
  { name: 'DD 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'F 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.19, ratePerFt: 192 },
  { name: 'FF 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.28, ratePerFt: 283 },
  { name: 'I 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'H 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'G 27 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.12, ratePerFt: 121 },
  { name: 'D 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'DD 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.35, ratePerFt: 354 },
  { name: 'F 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.24, ratePerFt: 242 },
  { name: 'FF 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: 'I 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.16, ratePerFt: 162 },
  { name: 'H 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'G 32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.12, ratePerFt: 121 },
  { name: '40*40 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: '32*32 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: '25*25 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: '19*19 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.08, ratePerFt: 81 },
  { name: '15*15 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.05, ratePerFt: 51 },
  { name: '12*12 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.04, ratePerFt: 40 },
  { name: '15*19 (1.2mm)', ratePerKg: 1010, weightPerFt: 0.07, ratePerFt: 71 },
  { name: 'L Patti (1.2mm)', ratePerKg: 1010, weightPerFt: 0.07, ratePerFt: 71 },
  { name: 'U Patti (1.2mm)', ratePerKg: 1010, weightPerFt: 0.07, ratePerFt: 71 },
  { name: 'Big U (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'T Patti (1.2mm)', ratePerKg: 1010, weightPerFt: 0.07, ratePerFt: 71 },
  { name: 'T Zali (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: '3/4" Round Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.13, ratePerFt: 131 },
  { name: '1" Round Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: '1.25" Round Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.2, ratePerFt: 202 },
  { name: '1.5" Round Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.25, ratePerFt: 253 },
  { name: '2" Round Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.35, ratePerFt: 354 },
  { name: '1*1 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.2, ratePerFt: 202 },
  { name: '1.25*1.25 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.26, ratePerFt: 263 },
  { name: '1.5*1.5 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: '2*1 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.3, ratePerFt: 303 },
  { name: '3*1.5 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.45, ratePerFt: 455 },
  { name: '4*1.5 Square Pipe (1.2mm)', ratePerKg: 1010, weightPerFt: 0.6, ratePerFt: 606 },
  { name: 'Showcase Patti (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'Showcase Pata (1.2mm)', ratePerKg: 1010, weightPerFt: 0.15, ratePerFt: 152 },
  { name: 'Showcase Gola (1.2mm)', ratePerKg: 1010, weightPerFt: 0.05, ratePerFt: 51 },
  { name: 'Showcase Corner (1.2mm)', ratePerKg: 1010, weightPerFt: 0.08, ratePerFt: 81 },
  { name: 'Showcase Door (1.2mm)', ratePerKg: 1010, weightPerFt: 0.1, ratePerFt: 101 },
  { name: 'Showcase Handle (1.2mm)', ratePerKg: 1010, weightPerFt: 0.07, ratePerFt: 71 },
  { name: 'ADC Louver (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
  { name: 'ADC Louver Frame (1.2mm)', ratePerKg: 1010, weightPerFt: 0.18, ratePerFt: 182 },
];


export const DataProvider = ({ children }: { children: ReactNode }) => {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        const seedData = async () => {
            if (!firestore || isSeeding) return;

            const seedingFlagRef = doc(firestore, 'meta', 'isDataSeeded');
            const seedingFlagDoc = await getDoc(seedingFlagRef);

            if (seedingFlagDoc.exists()) {
                return;
            }

            setIsSeeding(true);
            const batch = writeBatch(firestore);
            const itemsCollectionRef = collection(firestore, 'items');

            sectionsData.forEach(itemData => {
                const docRef = doc(itemsCollectionRef); 
                const thicknessMatch = itemData.name.match(/\((.*?)\)/);
                const thickness = thicknessMatch ? thicknessMatch[1] : '';

                const newItem: Omit<Item, 'id' | 'createdAt'> = {
                    name: itemData.name.replace(/\s*\(.*\)\s*/, '').replace(/\s*\[.*\]\s*/, '').trim(),
                    category: 'Aluminium',
                    unit: 'Feet', // Defaulting to feet as it's more common
                    purchasePrice: 0, // Default value
                    salePrice: itemData.ratePerFt || (itemData.ratePerKg * (itemData.weightPerFt || 0)),
                    color: 'Silver', // Default value
                    weight: itemData.weightPerFt,
                    thickness: thickness, // Default value
                    quantity: 0, // Default opening stock
                };
                batch.set(docRef, { ...newItem, createdAt: serverTimestamp() });
            });
            
            // Set the flag after seeding
            batch.set(seedingFlagRef, { seeded: true, timestamp: serverTimestamp() });
            
            try {
                await batch.commit();
            } catch (error) {
                console.error("Error seeding data:", error);
            } finally {
                setIsSeeding(false);
            }
        };

        seedData();
    }, [firestore, isSeeding]);

    // Fetch data only if the user is logged in.
    const shouldFetch = !!user;

    // Memoize collection references
    const itemsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'items') : null, [firestore, shouldFetch]);
    const customersCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'customers') : null, [firestore, shouldFetch]);
    const vendorsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'vendors') : null, [firestore, shouldFetch]);
    const labourCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'labour') : null, [firestore, shouldFetch]);
    const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const estimatesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'estimates'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const expensesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'expenses'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const transactionsCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'transactions'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
    const salaryPaymentsCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'salaryPayments'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);


    // Fetch data
    const { data: itemsData, isLoading: itemsLoading } = useCollection<Item>(itemsCol);
    const { data: customersData, isLoading: customersLoading } = useCollection<Customer>(customersCol);
    const { data: vendorsData, isLoading: vendorsLoading } = useCollection<Vendor>(vendorsCol);
    const { data: labourData, isLoading: labourLoading } = useCollection<Labour>(labourCol);
    const { data: salesData, isLoading: salesLoading } = useCollection<Sale>(salesCol);
    const { data: estimatesData, isLoading: estimatesLoading } = useCollection<Estimate>(estimatesCol);
    const { data: expensesData, isLoading: expensesLoading } = useCollection<Expense>(expensesCol);
    const { data: transactionsData, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsCol);
    const { data: salaryPaymentsData, isLoading: salaryPaymentsLoading } = useCollection<SalaryPayment>(salaryPaymentsCol);

    
    const items = itemsData?.map(item => ({ ...item, quantity: item.quantity ?? 0, createdAt: toDate(item.createdAt) })) || [];
    const customers = customersData?.map(customer => ({ ...customer, createdAt: toDate(customer.createdAt) })) || [];
    const vendors = vendorsData?.map(vendor => ({ ...vendor, createdAt: toDate(vendor.createdAt) })) || [];
    const labourers = labourData?.map(labourer => ({ ...labourer, createdAt: toDate(labourer.createdAt) })) || [];
    const sales = salesData?.map(sale => ({ ...sale, date: toDate(sale.date) })) || [];
    const estimates = estimatesData?.map(estimate => ({ ...estimate, date: toDate(estimate.date) })) || [];
    const expenses = expensesData?.map(expense => ({ ...expense, date: toDate(expense.date) })) || [];
    const transactions = transactionsData?.map(transaction => ({ ...transaction, date: toDate(transaction.date) })) || [];
    const salaryPayments = salaryPaymentsData?.map(payment => ({ ...payment, date: toDate(payment.date) })) || [];


    const loading = isUserLoading || itemsLoading || customersLoading || vendorsLoading || labourLoading || salesLoading || estimatesLoading || expensesLoading || transactionsLoading || salaryPaymentsLoading;

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

    const updateItemStock = async (id: string, newQuantity: number) => {
        if (!user) throw new Error("User not authenticated");
        const itemRef = doc(firestore, 'items', id);
        updateDocumentNonBlocking(itemRef, { quantity: newQuantity });
    };

    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        if (!customersCol || !transactionsCol) throw new Error("A required collection is not available");

        const batch = writeBatch(firestore);

        // 1. Add the customer
        const newCustomerRef = doc(customersCol);
        const newCustomerData = { ...customer, createdAt: serverTimestamp() };
        batch.set(newCustomerRef, newCustomerData);

        // 2. Add opening balance transaction if it exists
        if (customer.openingBalance && customer.openingBalance > 0) {
            const transactionRef = doc(collection(firestore, 'transactions'));
            const transactionData: Omit<Transaction, 'id'> = {
                description: "Opening Balance",
                amount: customer.openingBalance,
                type: customer.balanceType === 'credit' ? 'credit' : 'debit',
                category: 'Opening Balance',
                customerId: newCustomerRef.id,
                customerName: customer.customerName,
                date: serverTimestamp() as Timestamp,
            };
            batch.set(transactionRef, transactionData);
        }

        await batch.commit();
        return { ...customer, id: newCustomerRef.id, createdAt: new Date() };
    };

    const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'id' | 'createdAt'>>) => {
        if (!user) throw new Error("User not authenticated");
        const customerRef = doc(firestore, 'customers', id);
        updateDocumentNonBlocking(customerRef, customer);
    };
    
    const deleteCustomer = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'customers', id));
    };
    
    const addVendor = async (vendor: Omit<Vendor, 'id' | 'createdAt'>) => {
       if (!vendorsCol || !transactionsCol) throw new Error("A required collection is not available");
       
       const batch = writeBatch(firestore);

       // 1. Add the vendor
       const newVendorRef = doc(vendorsCol);
       const newVendorData = { ...vendor, createdAt: serverTimestamp() };
       batch.set(newVendorRef, newVendorData);

       // 2. Add opening balance transaction if it exists
       if (vendor.openingBalance && vendor.openingBalance > 0) {
            const transactionRef = doc(collection(firestore, 'transactions'));
            const transactionData: Omit<Transaction, 'id'> = {
                description: "Opening Balance",
                amount: vendor.openingBalance,
                type: vendor.balanceType === 'credit' ? 'credit' : 'debit', 
                category: 'Opening Balance',
                vendorId: newVendorRef.id,
                vendorName: vendor.name,
                date: serverTimestamp() as Timestamp,
            };
            batch.set(transactionRef, transactionData);
       }
       
       await batch.commit();
       return { ...vendor, id: newVendorRef.id, createdAt: new Date() };
    };
    const deleteVendor = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'vendors', id));
    };
    
    const addLabour = async (labour: Omit<Labour, 'id' | 'createdAt'>) => {
        if (!labourCol) throw new Error("Labour collection not available");
        const newLabourer = { ...labour, createdAt: serverTimestamp() };
        // Use addDoc for blocking behavior to ensure data is saved before modal closes
        const docRef = await addDoc(labourCol, newLabourer);
        return { ...newLabourer, id: docRef.id };
    };

    const updateLabour = async (id: string, labour: Partial<Omit<Labour, 'id' | 'createdAt'>>) => {
        if (!user) throw new Error("User not authenticated");
        const labourRef = doc(firestore, 'labour', id);
        updateDocumentNonBlocking(labourRef, labour);
    };

    const deleteLabour = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'labour', id));
    };


    const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'>) => {
        if (!transactionsCol) throw new Error("Transactions collection not available");
        const newTransaction = { ...transaction, date: serverTimestamp() };
        const colRef = collection(firestore, 'transactions');
        return addDocumentNonBlocking(colRef, newTransaction);
    };
    const deleteTransaction = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'transactions', id));
    };

    const addSale = async (sale: Omit<Sale, 'id' | 'total' | 'status'>) => {
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
                date: sale.date || serverTimestamp(),
            };

            transaction.set(newSaleRef, newSaleData);
        });
    };

    const updateSale = async (saleId: string, sale: Omit<Sale, 'id' | 'total' | 'status'>) => {
        if (!user) throw new Error("User not authenticated");
        const saleRef = doc(firestore, 'sales', saleId);

        const subtotal = sale.items.reduce((total, currentItem) => {
            const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            return total + (itemTotal - discountAmount);
        }, 0);
        const overallDiscountAmount = (subtotal * sale.discount) / 100;
        const total = subtotal - overallDiscountAmount;
        
        const updatedSaleData = {
            ...sale,
            total,
            date: sale.date
        };

        return updateDocumentNonBlocking(saleRef, updatedSaleData);
    };
    
    const addEstimate = async (estimate: Omit<Estimate, 'id' | 'date' | 'total'>) => {
        if (!estimatesCol || !user) throw new Error("Estimates collection not available or user not authenticated");
        
        await runTransaction(firestore, async (transaction) => {
            const estimatesCollectionRef = collection(firestore, 'estimates');
            const estimatesSnapshot = await getDocs(estimatesCollectionRef);
            const latestEstimateNumber = estimatesSnapshot.docs.reduce((max, s) => {
                const num = parseInt(s.id.split('-')[1]);
                return isNaN(num) ? max : Math.max(max, num);
            }, 0);
            const newEstimateId = `EST-${String(latestEstimateNumber + 1).padStart(3, '0')}`;
            const newEstimateRef = doc(estimatesCollectionRef, newEstimateId);

            const subtotal = estimate.items.reduce((total, currentItem) => {
                const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
                const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
                return total + (itemTotal - discountAmount);
            }, 0);
            const overallDiscountAmount = (subtotal * estimate.discount) / 100;
            const total = subtotal - overallDiscountAmount;

            const newEstimateData = {
                ...estimate,
                id: newEstimateId,
                total,
                date: serverTimestamp(),
            };

            transaction.set(newEstimateRef, newEstimateData);
        });
    };
    
    const deleteEstimate = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'estimates', id));
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
            date: sale.date,
        };
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, transactionData);

        await batch.commit();
    };

    const unpostSale = async (saleId: string) => {
        if (!user) throw new Error("User not authenticated");
        const saleToUnpost = sales.find(s => s.id === saleId);
        if (!saleToUnpost || saleToUnpost.status !== 'posted') return;
    
        const batch = writeBatch(firestore);
        
        // 1. Update sale status back to 'draft'
        const saleRef = doc(firestore, 'sales', saleId);
        batch.update(saleRef, { status: 'draft' });
    
        // 2. Find and delete the associated ledger transaction
        const q = query(
            collection(firestore, 'transactions'),
            where("category", "==", "Sale"),
            where("description", "==", `Sale to ${saleToUnpost.customerName} (Invoice: ${saleToUnpost.id})`),
            where("customerId", "==", saleToUnpost.customerId)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
    
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
            // Delete associated transaction
            const q = query(
                collection(firestore, 'transactions'), 
                where("category", "==", "Sale"), 
                where("description", "==", `Sale to ${saleToDelete.customerName} (Invoice: ${saleToDelete.id})`)
            );
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
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
    
    const addSalaryPayment = async (payment: Omit<SalaryPayment, 'id' | 'date'>) => {
        if (!user) throw new Error("User not authenticated");

        const batch = writeBatch(firestore);
        
        // 1. Add the main salary payment document
        const newPaymentRef = doc(collection(firestore, 'salaryPayments'));
        const newPaymentData = { ...payment, date: serverTimestamp() };
        batch.set(newPaymentRef, newPaymentData);

        // 2. Add a single consolidated transaction to the ledger
        const transactionRef = doc(collection(firestore, 'transactions'));
        const transactionData: Omit<Transaction, 'id' | 'date'> = {
            description: `Salary payment for ${payment.month} ${payment.year}`,
            amount: payment.totalAmountPaid,
            type: 'debit',
            category: 'Salary',
            date: serverTimestamp() as Timestamp,
        };
        batch.set(transactionRef, transactionData);
        
        await batch.commit();
    };

    const deleteSalaryPayment = async (paymentId: string) => {
        if (!user) throw new Error("User not authenticated");
        const paymentToDelete = salaryPayments.find(p => p.id === paymentId);
        if (!paymentToDelete) return;
    
        const batch = writeBatch(firestore);
        
        // 1. Delete the salary payment document
        const paymentRef = doc(firestore, 'salaryPayments', paymentId);
        batch.delete(paymentRef);
    
        // 2. Find and delete the associated ledger transaction
        const q = query(
            collection(firestore, 'transactions'),
            where("category", "==", "Salary"),
            where("description", "==", `Salary payment for ${paymentToDelete.month} ${paymentToDelete.year}`)
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
        
        const profitLoss = totalSales - totalExpenses;

        const today = new Date();
        const todaySummary = {
            sales: sales.filter(s => new Date(s.date).toDateString() === today.toDateString() && s.status === 'posted'),
            expenses: expenses.filter(e => new Date(e.date).toDateString() === today.toDateString()),
        };
        return { totalSales, totalExpenses, profitLoss, todaySummary };
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
        items, customers, vendors, labourers, sales, estimates, expenses, transactions, salaryPayments, loading,
        addItem, deleteItem, updateItemStock,
        addCustomer, updateCustomer, deleteCustomer,
        addVendor, deleteVendor,
        addLabour, updateLabour, deleteLabour,
        addSale, updateSale, postSale, unpostSale, deleteSale,
        addEstimate, deleteEstimate,
        addExpense, deleteExpense,
        addTransaction, deleteTransaction,
        addSalaryPayment, deleteSalaryPayment,
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

    
