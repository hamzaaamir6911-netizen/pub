
"use client";

import React, { useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

function SalesReportContent() {
  const searchParams = useSearchParams();
  const { sales, loading: isDataLoading } = useData();

  const selectedIds = useMemo(() => {
    const idsParam = searchParams.get("ids");
    return idsParam ? idsParam.split(',') : [];
  }, [searchParams]);

  const reportSales = useMemo(() => {
    if (isDataLoading || !sales) return [];
    return sales
      .filter(s => selectedIds.includes(s.id))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales, selectedIds, isDataLoading]);

  const grandTotal = useMemo(() => {
    return reportSales.reduce((acc, sale) => acc + sale.total, 0);
  }, [reportSales]);
  
  const isLoading = isDataLoading && reportSales.length === 0;

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
                    <TableHead className="text-right font-extrabold text-black">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {reportSales.map(sale => (
                    <TableRow key={sale.id}>
                        <TableCell className="font-semibold">{sale.id}</TableCell>
                        <TableCell>{formatDate(sale.date)}</TableCell>
                        <TableCell>{sale.customerName}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(sale.total)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow className="bg-gray-100">
                    <TableCell colSpan={3} className="text-right font-extrabold text-lg">Grand Total</TableCell>
                    <TableCell className="text-right font-extrabold text-lg">{formatCurrency(grandTotal)}</TableCell>
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
