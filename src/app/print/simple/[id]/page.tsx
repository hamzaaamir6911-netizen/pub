
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { SaleItem } from "@/lib/types";

export default function PrintSimpleInvoicePage() {
  const { id } = useParams();
  const { sales, loading: isDataLoading } = useData();

  const sale = sales.find(s => s.id === id);
  const isLoading = isDataLoading || !sale;

  const groupedItems = useMemo(() => {
    if (!sale) return {};
    return sale.items.reduce((acc, item) => {
      const key = `${item.thickness || 'N/A'} ${item.color || 'N/A'}`.toUpperCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, SaleItem[]>);
  }, [sale]);

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
        <div className="text-center font-bold mb-4">
            <p>
                {sale.customerName.toUpperCase()} | {formatDate(sale.date)} | {sale.id}
            </p>
        </div>

        <div className="columns-2 gap-x-8">
            {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="break-inside-avoid mb-4">
                    <h2 className="font-bold text-center mb-1 underline">{groupName}</h2>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black">
                                <TableHead className="h-auto p-1 font-bold w-[40%]">Section</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Feet</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Qty</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} className="border-none break-inside-avoid">
                                    <TableCell className="p-1 font-semibold">{item.itemName}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.feet ? item.feet.toFixed(1) : '-'}</TableCell>
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
