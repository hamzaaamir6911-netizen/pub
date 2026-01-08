
'use client';

import { useEffect, useMemo } from 'react';
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
  const shouldFetch = !!user;

  // Fetch all sales. Filtering will happen client-side.
  const salesCol = useMemoFirebase(() => {
    if (!shouldFetch) return null;
    return query(collection(firestore, 'sales'), orderBy('date', 'desc'));
  }, [firestore, shouldFetch]);

  const { data: sales, isLoading } = useCollection<Sale>(salesCol);

  const filteredSales = useMemo(() => {
    if (!sales) return [];
    
    if (ids) {
        const selectedIds = new Set(ids.split(','));
        return sales.filter(sale => selectedIds.has(sale.id));
    }
    
    // If no IDs, print all fetched sales (or could add date logic back here safely)
    return sales;
  }, [sales, ids]);

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
            Report for selected sales
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
