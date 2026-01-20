
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PrintSimpleInvoicePage() {
  const { id } = useParams();
  const { sales, loading: isDataLoading } = useData();

  const sale = sales.find(s => s.id === id);
  const isLoading = isDataLoading || !sale;
  
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        window.print();
        window.close();
      }, 500);
    }
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (!sale) {
    return <div>Invoice not found.</div>;
  }

  const netAmount = sale.total;

  return (
    <div className="p-4 bg-white text-black font-sans">
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">Invoice: {sale.id}</h1>
        <p className="text-sm">{sale.customerName} - {formatDate(sale.date)}</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>Colour</TableHead>
            <TableHead>Thickness</TableHead>
            <TableHead className="text-right">Rate</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item, index) => {
            const itemTotal = (item.feet || 1) * item.price * item.quantity;
            const discountAmount = itemTotal * ((item.discount || 0) / 100);
            const finalAmount = itemTotal - discountAmount;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.thickness}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(finalAmount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
            <TableRow className="font-bold text-base">
                <TableCell colSpan={4} className="text-right">Grand Total</TableCell>
                <TableCell className="text-right">{formatCurrency(netAmount)}</TableCell>
            </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
