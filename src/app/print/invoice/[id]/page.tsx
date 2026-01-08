
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function PrintInvoicePage() {
  const { id } = useParams();
  const { customers, loading: isDataLoading } = useData();

  // Note: Since useData doesn't expose individual sales, we need a way to get it.
  // This is a simplified approach. A better one would be a specific hook like `useSale(id)`.
  // For now, we find it from the (hypothetical) `sales` array from a context.
  // We'll need to adapt this if `sales` isn't directly available.
  // Let's assume `useData` is modified to expose `sales` or a function `getSale(id)`.
  // For this fix, let's assume we can fetch all sales via useData and filter.
  // A cleaner approach will be needed later.
  // This component will be re-written once useData() exposes sales.
  // Let's assume for now sales is part of useData()
  const { sales } = useData(); 
  const sale = sales.find(s => s.id === id);
  const customer = customers.find(c => c.id === sale?.customerId);
  const isLoading = isDataLoading || !sale;

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        window.print();
        window.close();
      }, 500); // Small delay to ensure rendering is complete
    }
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (!sale) {
    return <div>Invoice not found.</div>;
  }

  const subtotal = sale.items.reduce((acc, item) => {
      const itemTotal = (item.feet || 1) * item.price * item.quantity;
      const discountAmount = itemTotal * ((item.discount || 0) / 100);
      return acc + (itemTotal - discountAmount);
  }, 0);
  const overallDiscountAmount = (subtotal * sale.discount) / 100;
  const grandTotal = subtotal - overallDiscountAmount;

  return (
    <div className="p-8 font-sans bg-white text-black">
      <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        `}
      </style>
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
            <h2 className="text-2xl font-semibold">INVOICE</h2>
            <p>B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
        </div>
        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="font-semibold text-gray-600 mb-1">Bill To:</h3>
                <p className="font-bold text-lg">{sale.customerName}</p>
                {customer?.address && <p>{customer.address}</p>}
                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
            </div>
            <div className="text-right">
                <p><span className="font-semibold text-gray-600">Invoice #:</span> {sale.id}</p>
                <p><span className="font-semibold text-gray-600">Date:</span> {formatDate(sale.date)}</p>
                <div className="mt-2">
                    <Badge variant={sale.status === 'posted' ? 'default' : 'secondary'} className="text-base">{sale.status}</Badge>
                </div>
            </div>
        </div>
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="font-bold text-black">Description</TableHead>
                    <TableHead className="text-right font-bold text-black">Feet</TableHead>
                    <TableHead className="text-right font-bold text-black">Qty</TableHead>
                    <TableHead className="text-right font-bold text-black">Rate</TableHead>
                    <TableHead className="text-right font-bold text-black">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
            {sale.items.map((item, index) => {
                const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                return (
                <TableRow key={index}>
                    <TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.thickness} - {item.color})</span></TableCell>
                    <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(itemSubtotal)}</TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
            <div className="flex justify-end mt-6">
            <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Overall Discount ({sale.discount}%)</span><span>- {formatCurrency(overallDiscountAmount)}</span></div>
                <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
            </div>
        </div>
    </div>
  );
}
