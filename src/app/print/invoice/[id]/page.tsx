
'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/firebase/data/data-provider';
import type { Sale } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function InvoicePrintPage({ params }: { params: { id: string } }) {
  const { sales, customers, loading } = useData();
  const [sale, setSale] = useState<Sale | null>(null);

  // Effect to find the sale and trigger print
  useEffect(() => {
    // Only proceed if data has finished loading
    if (!loading && sales.length > 0) {
      const foundSale = sales.find(s => s.id === params.id);
      setSale(foundSale || null);

      if (!foundSale) {
        console.error(`Invoice with ID '${params.id}' not found.`);
      }
    }
  }, [loading, sales, params.id]); // Rerun when loading status or sales data changes

  // Effect to print *after* the state has been updated and the component has re-rendered
  useEffect(() => {
    if (sale) {
      // Use a timeout to ensure the DOM is fully painted before printing
      const timer = setTimeout(() => {
        window.print();
        window.onafterprint = () => window.close();
      }, 500); // 500ms delay as a safeguard

      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [sale]); // This effect runs only when the 'sale' state changes from null to a sale object

  const customer = sale ? customers.find(c => c.id === sale.customerId) : null;
  
  if (loading) {
    return <div className="p-10 text-center text-lg font-semibold">Loading invoice...</div>;
  }
  
  if (!sale) {
    return <div className="p-10 text-center text-lg font-semibold">Invoice with ID '{params.id}' not found.</div>;
  }

  const subtotal = sale.items.reduce((acc, item) => {
    const itemTotal = (item.feet || 1) * item.price * item.quantity;
    const discountAmount = itemTotal * ((item.discount || 0) / 100);
    return acc + (itemTotal - discountAmount);
  }, 0);
  const overallDiscountAmount = (subtotal * sale.discount) / 100;
  const grandTotal = subtotal - overallDiscountAmount;

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
          <p className="text-muted-foreground">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
          <p className="text-muted-foreground">+92 333 4646356</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold uppercase text-gray-800">INVOICE</h2>
          <div className="mt-2">
            <p><span className="font-semibold text-muted-foreground">Invoice #:</span> {sale.id}</p>
            <p><span className="font-semibold text-muted-foreground">Date:</span> {formatDate(sale.date)}</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
          <h3 className="font-semibold text-muted-foreground mb-1">Bill To:</h3>
          <p className="font-bold text-lg">{sale.customerName}</p>
          {customer?.address && <p>{customer.address}</p>}
          {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100">
            <TableHead className="font-bold">Description</TableHead>
            <TableHead className="font-bold">Thickness</TableHead>
            <TableHead className="text-right font-bold">Feet</TableHead>
            <TableHead className="text-right font-bold">Qty</TableHead>
            <TableHead className="text-right font-bold">Rate</TableHead>
            <TableHead className="text-right font-bold">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item, index) => {
            const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.color})</span></TableCell>
                <TableCell>{item.thickness || '-'}</TableCell>
                <TableCell className="text-right">{item.feet?.toFixed(2) ?? '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(itemSubtotal)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="flex justify-end mt-6">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overall Discount ({sale.discount}%)</span>
            <span>- {formatCurrency(overallDiscountAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-20 text-center text-xs text-gray-500 border-t pt-4">
        <p>Thank you for your business!</p>
      </div>

    </div>
  );
}

export default function InvoicePrintPageWrapper({ params }: { params: { id: string } }) {
    return (
        <InvoicePrintPage params={params} />
    )
}
