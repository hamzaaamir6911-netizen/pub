
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, SaleItem } from "@/lib/types";


// This is the table part, can be a helper function
const ItemsTable = ({ items }: { items: SaleItem[] }) => {
    if (items.length === 0) {
        return null;
    }
    // The parent div will have `columns-2`, so we render a single table.
    // `break-inside-avoid` on the row prevents it from splitting across columns.
    return (
        <Table>
            <TableHeader>
                <TableRow className="break-inside-avoid">
                    <TableHead className="w-[50%] h-auto p-1">Section Name</TableHead>
                    <TableHead className="text-right h-auto p-1">Feet</TableHead>
                    <TableHead className="text-right h-auto p-1">Qty</TableHead>
                    <TableHead className="text-right h-auto p-1">Rate</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map((item, index) => (
                    <TableRow key={index} className="break-inside-avoid">
                        <TableCell className="font-medium p-1">{item.itemName}</TableCell>
                        <TableCell className="text-right p-1">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-right p-1">{item.quantity}</TableCell>
                        <TableCell className="text-right p-1">{formatCurrency(item.price)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};


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
  
  const isUniformColor = sale.items.length > 0 && sale.items.every(item => item.color === sale.items[0].color);
  const isUniformThickness = sale.items.length > 0 && sale.items.every(item => item.thickness === sale.items[0].thickness);

  return (
    <div className="p-4 bg-white text-black font-sans text-xs">
        <div className="text-right mb-4">
            <p>
                {formatDate(sale.date)} | {sale.id} | {sale.customerName}
            </p>
            {(isUniformColor || isUniformThickness) && (
                <p>
                    {isUniformThickness && `Thickness: ${sale.items[0].thickness}`}
                    {isUniformColor && isUniformThickness && ' | '}
                    {isUniformColor && `Color: ${sale.items[0].color}`}
                </p>
            )}
        </div>

        <div className="columns-2 gap-x-8">
             <ItemsTable items={sale.items} />
        </div>
    </div>
  );
}

