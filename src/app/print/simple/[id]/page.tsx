
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale } from "@/lib/types";

// Component for a single copy of the invoice
const InvoiceCopy = ({ sale }: { sale: Sale }) => {
  if (!sale) return null;

  const isUniformColor = sale.items.length > 0 && sale.items.every(item => item.color === sale.items[0].color);
  const isUniformThickness = sale.items.length > 0 && sale.items.every(item => item.thickness === sale.items[0].thickness);

  return (
    <div className="w-full p-2">
        <div className="text-right">
            <div className="mb-2">
            <p>
                {formatDate(sale.date)} | {sale.id} | {sale.customerName}
            </p>
            </div>
            {(isUniformColor || isUniformThickness) && (
            <div className="mb-2">
                <p>
                {isUniformThickness && `Thickness: ${sale.items[0].thickness}`}
                {isUniformColor && isUniformThickness && ' | '}
                {isUniformColor && `Color: ${sale.items[0].color}`}
                </p>
            </div>
            )}
        </div>
        <Table>
            <TableHeader>
            <TableRow>
                <TableHead className="w-[50%] h-auto p-1">Section Name</TableHead>
                <TableHead className="text-right h-auto p-1">Feet</TableHead>
                <TableHead className="text-right h-auto p-1">Qty</TableHead>
                <TableHead className="text-right h-auto p-1">Rate</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {sale.items.map((item, index) => {
                return (
                <TableRow key={index}>
                    <TableCell className="font-medium p-1">{item.itemName}</TableCell>
                    <TableCell className="text-right p-1">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                    <TableCell className="text-right p-1">{item.quantity}</TableCell>
                    <TableCell className="text-right p-1">{formatCurrency(item.price)}</TableCell>
                </TableRow>
                );
            })}
            </TableBody>
        </Table>
    </div>
  );
}


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
    return <div className="p-4 text-center">Loading invoice...</div>;
  }

  if (!sale) {
    return <div className="p-4 text-center">Invoice not found.</div>;
  }
  
  return (
    <div className="p-4 bg-white text-black font-sans text-xs">
        <InvoiceCopy sale={sale} />
    </div>
  );
}
