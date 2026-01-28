
"use client";

import React, { useEffect, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Sale } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function PrintCollativeSalesReportPage() {
  const firestore = useFirestore();
  const { user, isUserLoading: isAuthLoading } = useUser();
  
  const salesCol = useMemoFirebase(() => user ? query(collection(firestore, 'sales'), where('status', '==', 'posted')) : null, [firestore, user]);
  const { data: sales, isLoading: isDataLoading } = useCollection<Sale>(salesCol);

  const isLoading = isAuthLoading || isDataLoading;
  
  const reportData = useMemo(() => {
    if (isLoading || !sales) return [];

    const flatSaleItems = sales
        .flatMap(sale => 
            sale.items.map(item => ({
                invoiceId: sale.id,
                date: sale.date,
                customerName: sale.customerName,
                itemName: item.itemName,
                thickness: item.thickness,
                color: item.color,
                feet: item.feet || 0,
                quantity: item.quantity,
            }))
        );
    
    return flatSaleItems.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });

  }, [sales, isLoading]);

  useEffect(() => {
    if (!isLoading && reportData) {
      setTimeout(() => {
        window.print();
        window.close();
      }, 500);
    }
  }, [isLoading, reportData]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading report...</div>;
  }

  return (
    <div className="p-8 font-sans bg-white text-black text-sm">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold font-headline">ARCO Aluminium Company</h1>
            <p className="mt-1 text-lg font-bold">Collative Sale Report</p>
            <p className="text-sm text-gray-500">As of {formatDate(new Date())}</p>
        </div>
        
        <Table className="text-sm">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="font-extrabold text-black">Invoice #</TableHead>
                    <TableHead className="font-extrabold text-black">Date</TableHead>
                    <TableHead className="font-extrabold text-black">Customer</TableHead>
                    <TableHead className="font-extrabold text-black">Item Name</TableHead>
                    <TableHead className="font-extrabold text-black">Thickness</TableHead>
                    <TableHead className="font-extrabold text-black">Color</TableHead>
                    <TableHead className="text-right font-extrabold text-black">Feet</TableHead>
                    <TableHead className="text-right font-extrabold text-black">Qty</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reportData.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                            No posted sales data available.
                        </TableCell>
                    </TableRow>
                ) : (
                    reportData.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-semibold">{item.invoiceId}</TableCell>
                            <TableCell>{formatDate(item.date)}</TableCell>
                            <TableCell>{item.customerName}</TableCell>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.thickness}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell className="text-right">{item.feet > 0 ? item.feet.toFixed(2) : '-'}</TableCell>
                            <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    </div>
  );
}
