"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

  // Check if color and thickness are uniform across all items
  const isUniformColor = sale.items.length > 0 && sale.items.every(item => item.color === sale.items[0].color);
  const isUniformThickness = sale.items.length > 0 && sale.items.every(item => item.thickness === sale.items[0].thickness);

  return (
    <div className="p-4 bg-white text-black font-sans text-xs">
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
            <TableHead className="w-[50%]">Section Name</TableHead>
            <TableHead className="text-right">Feet</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sale.items.map((item, index) => {
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
