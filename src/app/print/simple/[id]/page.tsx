"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, SaleItem } from "@/lib/types";


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

  const groupedItems = useMemo(() => {
    if (!sale) return {};
    return sale.items.reduce((acc, item) => {
      const groupKey = `${item.thickness} ${item.color.toUpperCase()}`;
      if (!acc[groupKey]) {
        acc[groupKey] = [];
      }
      acc[groupKey].push(item);
      return acc;
    }, {} as Record<string, SaleItem[]>);
  }, [sale]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading invoice...</div>;
  }

  if (!sale) {
    return <div className="p-4 text-center">Invoice not found.</div>;
  }

  return (
    <div className="p-4 bg-white text-black font-sans text-xs">
        <div className="text-center mb-4">
            <p className="font-bold">
                {sale.customerName.toUpperCase()} | {formatDate(sale.date)} | {sale.id}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-x-2">
            {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="break-inside-avoid">
                    <h2 className="font-bold text-center border-b border-black mb-1">{groupName}</h2>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-none">
                                <TableHead className="w-[40%] h-auto p-1 font-bold">Section</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Feet</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Qty</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="p-1 font-semibold">{item.itemName}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.feet ? item.feet.toFixed(0) : '-'}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.quantity}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.price.toFixed(0)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    </div>
  );
}
