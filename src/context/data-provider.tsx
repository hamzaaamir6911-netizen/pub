"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Item, Customer, Sale, Expense, SaleItem } from '@/lib/types';
import { mockItems, mockCustomers, mockSales, mockExpenses } from '@/lib/data';

interface DataContextProps {
  items: Item[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  addItem: (item: Omit<Item, 'id'>) => Item;
  deleteItem: (id: string) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
  deleteCustomer: (id: string) => void;
  addSale: (sale: Omit<Sale, 'id' | 'date' | 'total'>) => Sale;
  deleteSale: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => Expense;
  deleteExpense: (id: string) => void;
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
  const [items, setItems] = useState<Item[]>(mockItems);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);

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

        if (itemDetails.unit === 'Feet' && currentItem.length && currentItem.width) {
             const totalFeet = (currentItem.length * currentItem.width / 144) * (currentItem.quantity || 1);
             return total + (itemDetails.salePrice * totalFeet);
        }
        return total + (itemDetails.salePrice * (currentItem.quantity || 1));
    }, 0);
    
    const discountAmount = (subtotal * sale.discount) / 100;
    const total = subtotal - discountAmount;

    const newSale: Sale = { ...sale, id: `SALE${Date.now().toString().slice(-4)}`, date: new Date(), total };
    setSales(prev => [newSale, ...prev]);
    
    // Deduct stock
    newSale.items.forEach(saleItem => {
        setItems(prevItems => prevItems.map(stockItem => {
            if (stockItem.id === saleItem.itemId) {
                let quantityToDeduct = saleItem.quantity;
                 if (stockItem.unit === 'Feet' && saleItem.length && saleItem.width) {
                    const totalFeet = (saleItem.length * saleItem.width / 144) * saleItem.quantity;
                    // Assuming inventory quantity is also in feet for these items
                    quantityToDeduct = totalFeet; 
                }
                return { ...stockItem, quantity: stockItem.quantity - quantityToDeduct };
            }
            return stockItem;
        }));
    });
    return newSale;
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };
  
  // --- Expense Management ---
  const addExpense = (expense: Omit<Expense, 'id'| 'date'>): Expense => {
    const newExpense = { ...expense, id: `EXP${Date.now().toString().slice(-4)}`, date: new Date() };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };
  
  // --- Dashboard & Report Calculations ---
  const getDashboardStats = () => {
    const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const totalStockValue = items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    
    const totalCostOfGoodsSold = sales.reduce((sum, sale) => {
      const saleCost = sale.items.reduce((itemSum, saleItem) => {
        const item = items.find(i => i.id === saleItem.itemId);
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
      sales: sales.filter(s => s.date.toDateString() === today.toDateString()),
      expenses: expenses.filter(e => e.date.toDateString() === today.toDateString()),
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
      const month = sale.date.toLocaleString('default', { month: 'short' });
      if (!salesByMonth[month]) {
        salesByMonth[month] = 0;
      }
      salesByMonth[month] += sale.total;
    });

    // Ensure all recent months are present, even if with 0 sales
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
    addItem,
    deleteItem,
    addCustomer,
    deleteCustomer,
    addSale,
    deleteSale,
    addExpense,
    deleteExpense,
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
