
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Sale } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { collection, query, where, Timestamp, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function SalesReportPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  
  const ids = searchParams.get('ids');
  const fromDateStr = searchParams.get('from');
  const toDateStr = searchParams.get('to');

  const shouldFetch = !!user;

  // This query is now simpler. It just gets all sales. Filtering happens client-side.
  const salesCol = useMemoFirebase(() => {
    if (!shouldFetch) return null;
    return query(collection(firestore, 'sales'), orderBy('date', 'desc'));
  }, [firestore, shouldFetch]);

  const { data: sales, isLoading } = useCollection<Sale>(salesCol);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    // The date is already a Date object because of the updated DataProvider
    let analyzedSales = sales;

    if (ids) {
        const selectedIds = new Set(ids.split(','));
        return analyzedSales.filter(sale => selectedIds.has(sale.id));
    }
    
    if (fromDateStr) {
        const fromDate = new Date(fromDateStr);
        const toDate = toDateStr ? new Date(toDateStr) : fromDate;
        
        const startOfDay = new Date(fromDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(toDate.setHours(23, 59, 59, 999));

        return analyzedSales.filter(sale => {
            const saleDate = sale.date; // sale.date is now a Date object
            return saleDate >= startOfDay && saleDate <= endOfDay;
        });
    }

    return analyzedSales;
  }, [sales, ids, fromDateStr, toDateStr]);

  useEffect(() => {
    // We only print when data has finished loading AND there's something to print
    if (!isLoading && filteredSales.length > 0) {
      const timeoutId = setTimeout(() => {
        window.print();
        window.onafterprint = () => window.close();
      }, 500); // Small delay to ensure rendering
      return () => clearTimeout(timeoutId);
    }
  }, [filteredSales, isLoading]);

  if (isLoading) {
    return <div className="p-10 text-center text-lg font-semibold">Loading sales report...</div>;
  }
  
  if (sales && filteredSales.length === 0) {
    return <div className="p-10 text-center text-lg font-semibold">No sales found for the selected criteria.</div>;
  }

  const totalAmount = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
        <h2 className="text-2xl font-semibold">Sales Report</h2>
        <p className="text-muted-foreground">
            {fromDateStr ? `From: ${formatDate(new Date(fromDateStr))} To: ${formatDate(new Date(toDateStr || fromDateStr))}` : 'Report for selected sales'}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sale ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSales.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell className="font-medium">{sale.id}</TableCell>
              <TableCell>{sale.customerName}</TableCell>
              <TableCell>{formatDate(sale.date)}</TableCell>
              <TableCell>
                <Badge variant={sale.status === 'posted' ? 'default' : 'secondary'}>
                  {sale.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
            <TableRow>
                <TableCell colSpan={4} className="text-right font-bold text-lg">Grand Total</TableCell>
                <TableCell className="text-right font-bold text-lg">{formatCurrency(totalAmount)}</TableCell>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export default SalesReportPage;
