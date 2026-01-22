
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
    return (
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
                {items.map((item, index) => (
                    <TableRow key={index}>
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
  
  const midpoint = Math.ceil(sale.items.length / 2);
  const leftItems = sale.items.slice(0, midpoint);
  const rightItems = sale.items.slice(midpoint);


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

        <div className="flex flex-row gap-4">
            <div className="flex-1">
                <ItemsTable items={leftItems} />
            </div>
            
            {rightItems.length > 0 && <div className="border-l border-dashed border-gray-400"></div>}

            <div className="flex-1">
                 {rightItems.length > 0 && <ItemsTable items={rightItems} />}
            </div>
        </div>
    </div>
  );
}

