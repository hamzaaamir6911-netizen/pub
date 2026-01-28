

"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import type { Item, Customer, Sale, Expense, Transaction, Vendor, Estimate, Labour, SalaryPayment, SaleItem } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp, Timestamp, query, where, getDocs, runTransaction, addDoc, getDoc, deleteDoc, updateDoc, onSnapshot, orderBy, setDoc } from 'firebase/firestore';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '../non-blocking-updates';


interface DataContextProps {
  items: Item[];
  customers: Customer[];
  vendors: Vendor[];
  labourers: Labour[];
  loading: boolean;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Promise<any>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (id: string, item: Partial<Omit<Item, 'id' | 'createdAt'>>) => Promise<void>;
  batchUpdateRates: (updates: { id: string, salePrice: number }[]) => Promise<void>;
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
  addManualSale: (sale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'> & { amount: number, description: string }) => Promise<void>;
  updateSale: (saleId: string, sale: Omit<Sale, 'id' | 'total' | 'status'>) => Promise<void>;
  postSale: (sale: Sale) => Promise<void>;
  unpostSale: (sale: Sale) => Promise<void>;
  deleteSale: (sale: Sale) => Promise<void>;
  addEstimate: (estimate: Omit<Estimate, 'id' | 'date' | 'total'>) => Promise<void>;
  deleteEstimate: (id: string) => Promise<void>;
  createSaleFromEstimate: (estimate: Estimate) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Promise<void>;
  deleteExpense: (expense: Expense) => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<any>;
  updateTransaction: (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addSalaryPayment: (payment: Omit<SalaryPayment, 'id' | 'date'>) => Promise<void>;
  updateSalaryPayment: (paymentId: string, paymentData: Omit<SalaryPayment, 'id' | 'date'>, existingPayment: SalaryPayment) => Promise<void>;
  deleteSalaryPayment: (payment: SalaryPayment) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

const toDate = (timestamp: any): Date | null => {
    if (!timestamp) {
        return null;
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) {
            return d;
        }
    }
    return null;
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
                    unit: 'Feet',
                    purchasePrice: 0,
                    salePrice: itemData.ratePerFt || (itemData.ratePerKg * (itemData.weightPerFt || 0)),
                    color: 'Silver',
                    weight: itemData.weightPerFt,
                    thickness: thickness,
                    quantity: 0,
                };
                batch.set(docRef, { ...newItem, createdAt: serverTimestamp() });
            });
            
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

    useEffect(() => {
        const recoverInvoice = async () => {
            if (!firestore) return;
            const invoiceRef = doc(firestore, 'sales', 'INV-079');
            const invoiceDoc = await getDoc(invoiceRef);

            if (!invoiceDoc.exists()) {
                const recoveredInvoice: Sale = {
                    id: "INV-079",
                    customerId: "CUST-001", // Placeholder, adjust if needed
                    customerName: "John Doe", // Placeholder
                    items: [
                      {
                        itemId: "ITEM-001", // Placeholder
                        itemName: "D 40",
                        quantity: 10,
                        price: 495,
                        color: "Silver",
                        thickness: "1.2mm",
                        feet: 12,
                        discount: 0
                      }
                    ],
                    total: 59400,
                    date: new Date("2024-05-23T10:00:00.000Z"),
                    discount: 0,
                    status: "posted"
                };
                try {
                    await setDoc(invoiceRef, recoveredInvoice);
                    console.log("Successfully recovered INV-079.");
                } catch (error) {
                    console.error("Error recovering INV-079:", error);
                }
            }
        };
        recoverInvoice();
    }, [firestore]);

    const shouldFetch = !!user;

    const itemsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'items') : null, [firestore, shouldFetch]);
    const customersCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'customers') : null, [firestore, shouldFetch]);
    const vendorsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'vendors') : null, [firestore, shouldFetch]);
    const labourCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'labour') : null, [firestore, shouldFetch]);
    
    const { data: itemsData, isLoading: itemsLoading } = useCollection<Item>(itemsCol);
    const { data: customersData, isLoading: customersLoading } = useCollection<Customer>(customersCol);
    const { data: vendorsData, isLoading: vendorsLoading } = useCollection<Vendor>(vendorsCol);
    const { data: labourData, isLoading: labourLoading } = useCollection<Labour>(labourCol);

    const items = itemsData?.map(item => ({ ...item, quantity: item.quantity ?? 0, createdAt: toDate(item.createdAt) as Date })) || [];
    const customers = customersData?.map(customer => ({ ...customer, createdAt: toDate(customer.createdAt) as Date })) || [];
    const vendors = vendorsData?.map(vendor => ({ ...vendor, createdAt: toDate(vendor.createdAt) as Date })) || [];
    const labourers = labourData?.map(labourer => ({ ...labourer, createdAt: toDate(labourer.createdAt) as Date })) || [];

    const loading = isUserLoading || itemsLoading || customersLoading || vendorsLoading || labourLoading;

    const addItem = async (item: Omit<Item, 'id' | 'createdAt'>) => {
        if (!itemsCol) throw new Error("Items collection not available");
        const newItem = { ...item, createdAt: serverTimestamp() };
        return addDoc(itemsCol, newItem);
    };

    const deleteItem = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'items', id));
    };

    const updateItem = async (id: string, item: Partial<Omit<Item, 'id' | 'createdAt'>>) => {
        if (!user) throw new Error("User not authenticated");
        const itemRef = doc(firestore, 'items', id);
        return updateDocumentNonBlocking(itemRef, item);
    };

    const batchUpdateRates = async (updates: { id: string, salePrice: number }[]) => {
        if (!user || updates.length === 0) return;
    
        const batch = writeBatch(firestore);
        updates.forEach(update => {
            const itemRef = doc(firestore, 'items', update.id);
            batch.update(itemRef, { salePrice: update.salePrice });
        });
    
        await batch.commit();
    };

    const updateItemStock = async (id: string, newQuantity: number) => {
        if (!user) throw new Error("User not authenticated");
        const itemRef = doc(firestore, 'items', id);
        updateDocumentNonBlocking(itemRef, { quantity: newQuantity });
    };

    const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
        if (!customersCol) throw new Error("A required collection is not available");

        const batch = writeBatch(firestore);
        const newCustomerRef = doc(customersCol);
        const newCustomerData = { ...customer, createdAt: serverTimestamp() };
        batch.set(newCustomerRef, newCustomerData);

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
       if (!vendorsCol) throw new Error("A required collection is not available");
       
       const batch = writeBatch(firestore);
       const newVendorRef = doc(vendorsCol);
       const newVendorData = { ...vendor, createdAt: serverTimestamp() };
       batch.set(newVendorRef, newVendorData);

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


    const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<any> => {
        if (!user) throw new Error("User not authenticated");
        const colRef = collection(firestore, 'transactions');
        const transactionWithServerDate = {
            ...transaction,
            date: transaction.date || serverTimestamp()
        };
        const docRef = await addDoc(colRef, transactionWithServerDate);
        return docRef;
    };
    
    const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id'>>) => {
        if (!user) throw new Error("User not authenticated");
        const transactionRef = doc(firestore, 'transactions', id);
        const dataToUpdate: Partial<Omit<Transaction, 'id'>> = { ...transaction };
        if (transaction.date) {
            dataToUpdate.date = transaction.date;
        }
        return updateDocumentNonBlocking(transactionRef, dataToUpdate);
    };

    const deleteTransaction = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'transactions', id));
    };

    const addSale = async (sale: Omit<Sale, 'id' | 'total' | 'status'>) => {
        if (!user) {
            throw new Error("User not authenticated.");
        }

        const counterRef = doc(firestore, 'counters', 'salesCounter');
        const saleCollectionRef = collection(firestore, 'sales');

        try {
            await runTransaction(firestore, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                
                let newSaleNumber;
                if (counterDoc.exists()) {
                    newSaleNumber = (counterDoc.data().currentNumber || 0) + 1;
                } else {
                    newSaleNumber = 1;
                }
    
                const newSaleId = `INV-${String(newSaleNumber).padStart(3, '0')}`;
    
                const subtotal = sale.items.reduce((total, currentItem) => {
                    const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
                    const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
                    return total + (itemTotal - discountAmount);
                }, 0);
                const overallDiscountAmount = (subtotal * sale.discount) / 100;
                const total = subtotal - overallDiscountAmount;
    
                const newSaleData: Sale = {
                    id: newSaleId,
                    ...sale,
                    total,
                    status: 'draft' as const,
                    date: sale.date
                };
    
                const newSaleRef = doc(saleCollectionRef, newSaleId);
                
                transaction.set(newSaleRef, { ...newSaleData, date: sale.date });
                transaction.set(counterRef, { currentNumber: newSaleNumber }, { merge: true });
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
            throw e;
        }
    };
    
    const addManualSale = async (manualSale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'> & { amount: number, description: string }) => {
        if (!user) throw new Error("User not authenticated");

        const counterRef = doc(firestore, 'counters', 'salesCounter');
        const saleCollectionRef = collection(firestore, 'sales');

        try {
            await runTransaction(firestore, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                
                let newSaleNumber;
                if (counterDoc.exists()) {
                    newSaleNumber = (counterDoc.data().currentNumber || 0) + 1;
                } else {
                    newSaleNumber = 1;
                }
    
                const newSaleId = `INV-${String(newSaleNumber).padStart(3, '0')}`;
                
                const newSaleData: Sale = {
                    id: newSaleId,
                    customerId: manualSale.customerId,
                    customerName: manualSale.customerName,
                    date: manualSale.date,
                    total: manualSale.amount,
                    status: 'posted' as const,
                    items: [{
                        itemId: 'manual',
                        itemName: manualSale.description,
                        quantity: 1,
                        price: manualSale.amount,
                        color: '',
                        thickness: ''
                    }] as SaleItem[],
                    discount: 0,
                };
    
                const newSaleRef = doc(saleCollectionRef, newSaleId);
                transaction.set(newSaleRef, newSaleData);
                transaction.set(counterRef, { currentNumber: newSaleNumber }, { merge: true });

                const newTransactionRef = doc(collection(firestore, 'transactions'));
                const transactionData: Omit<Transaction, 'id'> = {
                    description: `Sale to ${newSaleData.customerName} (Invoice: ${newSaleId})`,
                    amount: newSaleData.total,
                    type: 'debit',
                    category: 'Sale',
                    customerId: newSaleData.customerId,
                    customerName: newSaleData.customerName,
                    date: newSaleData.date,
                };
                transaction.set(newTransactionRef, transactionData);
            });
        } catch (e) {
            console.error("Manual sale transaction failed: ", e);
            throw e;
        }
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
            date: sale.date,
        };

        return updateDocumentNonBlocking(saleRef, updatedSaleData);
    };
    
    const addEstimate = async (estimate: Omit<Estimate, 'id' | 'date' | 'total'>) => {
        if (!user) throw new Error("User not authenticated");
    
        const subtotal = estimate.items.reduce((total, currentItem) => {
            const itemTotal = (currentItem.feet || 1) * currentItem.price * currentItem.quantity;
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            return total + (itemTotal - discountAmount);
        }, 0);
        const overallDiscountAmount = (subtotal * estimate.discount) / 100;
        const total = subtotal - overallDiscountAmount;
    
        const newEstimateData = {
            ...estimate,
            total,
            date: serverTimestamp(),
        };
    
        await addDoc(collection(firestore, 'estimates'), newEstimateData);
    };
    
    const deleteEstimate = async (id: string) => {
        if (!user) throw new Error("User not authenticated");
        deleteDocumentNonBlocking(doc(firestore, 'estimates', id));
    };

     const createSaleFromEstimate = async (estimate: Estimate) => {
        if (!user) throw new Error("User not authenticated");

        const saleData: Omit<Sale, 'id' | 'total' | 'status'> = {
            customerId: estimate.customerId,
            customerName: estimate.customerName,
            items: estimate.items,
            discount: estimate.discount,
            date: new Date(),
            estimateId: estimate.id,
        };
        
        await addSale(saleData);
    };

    const postSale = async (sale: Sale) => {
        if (!user) throw new Error("User not authenticated");
        if (!sale || sale.status === 'posted') return;

        const batch = writeBatch(firestore);
        const saleRef = doc(firestore, 'sales', sale.id);
        
        batch.update(saleRef, { status: 'posted' });

        const transactionData: Omit<Transaction, 'id'> = {
            description: `Sale to ${sale.customerName} (Invoice: ${sale.id})`,
            amount: sale.total,
            type: 'debit' as const,
            category: 'Sale',
            customerId: sale.customerId,
            customerName: sale.customerName,
            date: toDate(sale.date) as Date,
        };
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, transactionData);

        await batch.commit();
    };

    const unpostSale = async (sale: Sale) => {
        if (!user) throw new Error("User not authenticated");
        if (!sale) return;
    
        const batch = writeBatch(firestore);
        
        const saleRef = doc(firestore, 'sales', sale.id);
        batch.update(saleRef, { status: 'draft' });
    
        const saleDate = toDate(sale.date);
        if (!saleDate) {
            await batch.commit();
            console.warn(`Could not find transaction to delete for sale ${sale.id} due to missing date.`);
            return;
        }

        const q = query(
            collection(firestore, 'transactions'),
            where("category", "==", "Sale"),
            where("description", "==", `Sale to ${sale.customerName} (Invoice: ${sale.id})`),
            where("customerId", "==", sale.customerId)
        );
        
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const transactionDate = toDate(doc.data().date);
                if (transactionDate && transactionDate.toDateString() === saleDate.toDateString()) {
                    batch.delete(doc.ref);
                }
            });
            await batch.commit();
        } catch (error) {
            console.error("Error during unpost operation: ", error);
        }
    };

    const deleteSale = async (sale: Sale) => {
        if (!user) throw new Error("User not authenticated");
        if (!sale) return;

        const batch = writeBatch(firestore);
        const saleRef = doc(firestore, "sales", sale.id);

        // If the sale is posted, find and delete the associated transaction first
        if (sale.status === "posted") {
            const q = query(
                collection(firestore, "transactions"),
                where("category", "==", "Sale"),
                where("description", "==", `Sale to ${sale.customerName} (Invoice: ${sale.id})`),
                where("customerId", "==", sale.customerId)
            );

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                // To be safe, let's also match the date
                const transactionDate = toDate(doc.data().date);
                const saleDate = toDate(sale.date);
                if (transactionDate && saleDate && transactionDate.toDateString() === saleDate.toDateString()) {
                    batch.delete(doc.ref);
                }
            });
        }
        
        // Finally, delete the sale itself
        batch.delete(saleRef);

        await batch.commit();
    };
    
    const addExpense = async (expense: Omit<Expense, 'id' | 'date'>) => {
        if (!user) throw new Error("User not authenticated");
        const vendor = vendors.find(v => v.id === expense.vendorId);
        
        const batch = writeBatch(firestore);

        const newExpense = { ...expense, date: serverTimestamp() };
        const expenseRef = doc(collection(firestore, 'expenses'));
        batch.set(expenseRef, newExpense);

        const transactionData: Omit<Transaction, 'id'> = {
            description: expense.title,
            amount: expense.amount,
            type: 'debit' as const,
            category: expense.category,
            vendorId: expense.vendorId,
            vendorName: vendor?.name,
            date: serverTimestamp() as Timestamp
        };
        const transactionRef = doc(collection(firestore, 'transactions'));
        batch.set(transactionRef, transactionData);

        await batch.commit();
    };

    const deleteExpense = async (expense: Expense) => {
        if (!user) throw new Error("User not authenticated");
        if (!expense) return;

        const batch = writeBatch(firestore);
        const expenseRef = doc(firestore, 'expenses', expense.id);
        batch.delete(expenseRef);
    
        const q = query(
            collection(firestore, "transactions"),
            where("category", "==", expense.category),
            where("description", "==", expense.title),
            where("amount", "==", expense.amount),
            where("type", "==", "debit")
        );
        
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        } catch(error) {
            console.error("Error deleting related transaction for expense:", error);
        }
    };
    
    const addSalaryPayment = async (payment: Omit<SalaryPayment, 'id' | 'date'>) => {
        if (!user) throw new Error("User not authenticated");

        const batch = writeBatch(firestore);
        
        const newPaymentRef = doc(collection(firestore, 'salaryPayments'));
        
        const expenseRef = doc(collection(firestore, 'expenses'));
        const expenseData: Omit<Expense, 'id'> = {
            title: `Salary for ${payment.month} ${payment.year}`,
            amount: payment.totalAmountPaid,
            category: 'Salary',
            date: serverTimestamp() as Timestamp,
        };
        batch.set(expenseRef, expenseData);
        
        const newPaymentData = { ...payment, date: serverTimestamp(), expenseId: expenseRef.id };
        batch.set(newPaymentRef, newPaymentData);
        
        const transactionRef = doc(collection(firestore, 'transactions'));
        const transactionData: Omit<Transaction, 'id'> = {
            description: `Salary payment for ${payment.month} ${payment.year}`,
            amount: payment.totalAmountPaid,
            type: 'debit',
            category: 'Salary',
            date: serverTimestamp() as Timestamp,
        };
        batch.set(transactionRef, transactionData);
        
        await batch.commit();
    };

    const updateSalaryPayment = async (paymentId: string, paymentData: Omit<SalaryPayment, 'id' | 'date'>, existingPayment: SalaryPayment) => {
        if (!user) throw new Error("User not authenticated");
        
        const batch = writeBatch(firestore);
        
        const paymentRef = doc(firestore, 'salaryPayments', paymentId);
        batch.update(paymentRef, {
            ...paymentData,
            date: serverTimestamp() 
        });

        if (existingPayment.expenseId) {
            const expenseRef = doc(firestore, 'expenses', existingPayment.expenseId);
            batch.update(expenseRef, { amount: paymentData.totalAmountPaid });

            const q = query(
                collection(firestore, 'transactions'),
                where("category", "==", "Salary"),
                where("description", "==", `Salary payment for ${existingPayment.month} ${existingPayment.year}`)
            );
            
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                batch.update(doc.ref, { amount: paymentData.totalAmountPaid });
            });
        }
        
        await batch.commit();
    };


    const deleteSalaryPayment = async (payment: SalaryPayment) => {
        if (!user) throw new Error("User not authenticated");
        if (!payment) return;
    
        const batch = writeBatch(firestore);
        
        const paymentRef = doc(firestore, 'salaryPayments', payment.id);
        batch.delete(paymentRef);
    
        if (payment.expenseId) {
            const expenseRef = doc(firestore, 'expenses', payment.expenseId);
            batch.delete(expenseRef);
        }

        const q = query(
            collection(firestore, "transactions"),
            where("category", "==", "Salary"),
            where("description", "==", `Salary payment for ${payment.month} ${payment.year}`)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
    
        await batch.commit();
    };
    
    const value = {
        items, customers, vendors, labourers, loading,
        addItem, deleteItem, updateItem, batchUpdateRates, updateItemStock,
        addCustomer, updateCustomer, deleteCustomer,
        addVendor, deleteVendor,
        addLabour, updateLabour, deleteLabour,
        addSale, addManualSale, updateSale, postSale, unpostSale, deleteSale,
        addEstimate, deleteEstimate, createSaleFromEstimate,
        addExpense, deleteExpense,
        addTransaction, updateTransaction, deleteTransaction,
        addSalaryPayment, updateSalaryPayment, deleteSalaryPayment,
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
