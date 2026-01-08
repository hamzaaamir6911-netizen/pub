
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Sale } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { collection, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function SalesReportPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const searchParams = useSearchParams();
  
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => {
    if (!shouldFetch) return null;
    
    let q = query(collection(firestore, 'sales'), orderBy('date', 'desc'));
    
    // This is tricky because Firestore queries on timestamps are precise.
    // We'll filter on the client side for simplicity, but for large datasets,
    // this should be handled with proper timestamp queries.
    return q;
  }, [firestore, shouldFetch]);

  const { data: sales, isLoading } = useCollection<Sale>(salesCol);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    if (!fromDate || !toDate) return sales;
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    // Set 'to' date to the end of the day
    to.setHours(23, 59, 59, 999);

    return sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= from && saleDate <= to;
    });
  }, [sales, fromDate, toDate]);

  useEffect(() => {
    if (filteredSales.length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        window.print();
        window.onafterprint = () => window.close();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [filteredSales, isLoading]);

  if (isLoading || !sales) {
    return <div className="p-10 text-center text-lg font-semibold">Loading sales report...</div>;
  }
  
  const totalAmount = filteredSales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
        <h2 className="text-2xl font-semibold">Sales Report</h2>
        {fromDate && toDate ? (
            <p className="text-muted-foreground">
                From {formatDate(new Date(fromDate))} to {formatDate(new Date(toDate))}
            </p>
        ) : (
            <p className="text-muted-foreground">For All Dates</p>
        )}
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
