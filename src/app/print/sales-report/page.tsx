
'use client';

import { useEffect, useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Sale } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { collection, orderBy, query } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function SalesReportPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const { data: sales, isLoading } = useCollection<Sale>(salesCol);

  useEffect(() => {
    if (sales && !isLoading) {
      const timeoutId = setTimeout(() => {
        window.print();
        window.onafterprint = () => window.close();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [sales, isLoading]);

  if (isLoading || !sales) {
    return <div className="p-10 text-center text-lg font-semibold">Loading sales report...</div>;
  }
  
  const totalAmount = sales.reduce((acc, sale) => acc + sale.total, 0);

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
        <h2 className="text-2xl font-semibold">Sales Report</h2>
        <p className="text-muted-foreground">{formatDate(new Date())}</p>
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
          {sales.map((sale) => (
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
