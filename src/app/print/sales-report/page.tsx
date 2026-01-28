
"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Sale } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

function SalesReportContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  
  const salesCol = useMemoFirebase(() => collection(firestore, 'sales'), [firestore]);
  const { data: sales, isLoading: isDataLoading } = useCollection<Sale>(salesCol);

  const selectedIds = useMemo(() => {
    const idsParam = searchParams.get("ids");
    return idsParam ? idsParam.split(',') : [];
  }, [searchParams]);

  const reportSales = useMemo(() => {
    if (isDataLoading || !sales) return [];
    return sales
      .filter(s => selectedIds.includes(s.id))
      .map(sale => {
        let t1Value = 0;
        let t2Value = 0;

        sale.items.forEach(item => {
            const itemTotal = (item.feet || 1) * item.price * item.quantity;
            const discountAmount = itemTotal * ((item.discount || 0) / 100);
            const finalAmount = itemTotal - discountAmount;

            if (item.itemName.trim().toLowerCase() === 'd 29') {
                t1Value += finalAmount;
            } else {
                t2Value += finalAmount;
            }
        });
        
        const subTotal = t1Value + t2Value;
        if (subTotal === 0) { // Avoid division by zero
          return { ...sale, t1Amount: 0, t2Amount: 0 };
        }
        
        // Apply overall discount proportionally
        const t1Amount = t1Value * (1 - (sale.discount / 100));
        const t2Amount = t2Value * (1 - (sale.discount / 100));

        return { ...sale, t1Amount, t2Amount };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales, selectedIds, isDataLoading]);

  const grandTotals = useMemo(() => {
    return reportSales.reduce((acc, sale) => {
        acc.total += sale.total;
        acc.t1 += sale.t1Amount || 0;
        acc.t2 += sale.t2Amount || 0;
        return acc;
    }, { total: 0, t1: 0, t2: 0 });
  }, [reportSales]);
  
  const isLoading = isDataLoading && reportSales.length === 0 && selectedIds.length > 0;

  useEffect(() => {
    if (!isLoading && reportSales.length > 0) {
      setTimeout(() => {
        window.print();
        window.close();
      }, 500);
    }
  }, [isLoading, reportSales]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading report...</div>;
  }
  
  if (reportSales.length === 0) {
      return <div className="p-8 text-center">No sales selected or data found.</div>;
  }

  return (
    <div className="p-8 font-sans bg-white text-black text-sm">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold font-headline">ARCO Aluminium Company</h1>
            <p className="mt-1 text-lg font-bold">Sales Report</p>
            <p className="text-sm text-gray-500">
                From {formatDate(reportSales[0].date)} to {formatDate(reportSales[reportSales.length - 1].date)}
            </p>
        </div>
        
        <Table className="text-sm">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="font-extrabold text-black">Invoice #</TableHead>
                    <TableHead className="font-extrabold text-black">Date</TableHead>
                    <TableHead className="font-extrabold text-black">Customer Name</TableHead>
                    <TableHead className="text-right font-extrabold text-black">T1 (D 29)</TableHead>
                    <TableHead className="text-right font-extrabold text-black">T2 (Other)</TableHead>
                    <TableHead className="text-right font-extrabold text-black">Total Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reportSales.map(sale => (
                    <TableRow key={sale.id}>
                        <TableCell className="font-semibold">{sale.id}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(sale.t1Amount || 0)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(sale.t2Amount || 0)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(sale.total)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow className="bg-gray-100">
                    <TableCell colSpan={3} className="text-right font-extrabold text-lg">Grand Totals</TableCell>
                    <TableCell className="text-right font-extrabold text-lg">{formatCurrency(grandTotals.t1)}</TableCell>
                    <TableCell className="text-right font-extrabold text-lg">{formatCurrency(grandTotals.t2)}</TableCell>
                    <TableCell className="text-right font-extrabold text-lg">{formatCurrency(grandTotals.total)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    </div>
  );
}

export default function PrintSalesReportPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SalesReportContent />
        </Suspense>
    )
}
