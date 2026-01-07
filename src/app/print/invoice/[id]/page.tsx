
'use client';

import { useEffect, useState } from 'react';
import { useData } from '@/firebase/data/data-provider';
import type { Sale } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// This is a client component that fetches data based on the ID from the URL
function InvoicePrintPage({ params }: { params: { id: string } }) {
  const { sales, customers } = useData();
  const [sale, setSale] = useState<Sale | null>(null);

  useEffect(() => {
    if (sales.length > 0) {
      const foundSale = sales.find(s => s.id === params.id);
      setSale(foundSale || null);
    }
  }, [sales, params.id]);

  const customer = sale ? customers.find(c => c.id === sale.customerId) : null;
  
  if (!sale) {
    return <div className="p-10">Loading invoice...</div>;
  }

  // Calculate totals
  const subtotal = sale.items.reduce((acc, item) => {
    const itemTotal = (item.feet || 1) * item.price * item.quantity;
    const discountAmount = itemTotal * ((item.discount || 0) / 100);
    return acc + (itemTotal - discountAmount);
  }, 0);
  const overallDiscountAmount = (subtotal * sale.discount) / 100;
  const grandTotal = subtotal - overallDiscountAmount;

  return (
    <div className="bg-white text-black p-8 font-sans">
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h1 className="text-2xl font-bold font-headline mb-2">ARCO Aluminium Company</h1>
          <p>B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
          <p>+92 333 4646356</p>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-bold uppercase text-gray-700">INVOICE</h2>
          <div className="mt-2 text-sm">
            <p><span className="font-bold">Date:</span> {formatDate(sale.date)}</p>
            <p><span className="font-bold">Invoice #:</span> {sale.id}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2 border-b pb-1">From</h3>
          <p className="font-bold">ARCO Aluminium Company</p>
          <p>Hayatabad, Peshawar</p>
          <p>Pakistan</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-2 border-b pb-1">To</h3>
          <p className="font-bold">{sale.customerName}</p>
          <p>{customer?.address}</p>
          <p>{customer?.phoneNumber}</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-800 text-white">
            <TableHead className="text-white font-bold">Description</TableHead>
            <TableHead className="text-white font-bold">Thickness</TableHead>
            <TableHead className="text-right text-white font-bold">Feet</TableHead>
            <TableHead className="text-right text-white font-bold">Qty</TableHead>
            <TableHead className="text-right text-white font-bold">Rate</TableHead>
            <TableHead className="text-right text-white font-bold">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item, index) => {
            const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
            const discountAmount = itemSubtotal * ((item.discount || 0) / 100);
            const finalAmount = itemSubtotal - discountAmount;
            return (
              <TableRow key={index} className="border-b">
                <TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.color})</span></TableCell>
                <TableCell>{item.thickness || '-'}</TableCell>
                <TableCell className="text-right">{item.feet?.toFixed(2) ?? '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(finalAmount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <div className="flex justify-end mt-8">
        <div className="w-full max-w-sm space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Discount ({sale.discount}%)</span>
            <span>- {formatCurrency(overallDiscountAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-12">
        <h3 className="font-bold mb-2">Notes</h3>
        <p className="text-sm text-gray-600">Thank you for your business.</p>
      </div>

    </div>
  );
}

export default InvoicePrintPage;

    