
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
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
      const key = `${item.thickness || 'N/A'}-${item.color || 'N/A'}`;
      if (!acc[key]) {
        acc[key] = {
          groupName: `${item.thickness || ''} ${item.color || ''}`.trim().toUpperCase(),
          items: []
        };
      }
      acc[key].items.push(item);
      return acc;
    }, {} as Record<string, { groupName: string; items: SaleItem[] }>);

  }, [sale]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading invoice...</div>;
  }

  if (!sale) {
    return <div className="p-4 text-center">Invoice not found.</div>;
  }

  return (
    <div className="p-4 bg-white text-black font-sans text-xs">
        <div className="text-center mb-4 font-bold">
            <p>
                {sale.customerName.toUpperCase()} | {formatDate(sale.date)} | {sale.id}
            </p>
        </div>

        <div className="flex flex-row items-start gap-4">
            {Object.values(groupedItems).map((group) => (
                <div key={group.groupName} className="flex-shrink-0">
                    <p className="font-bold text-center mb-1">{group.groupName}</p>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-black">
                                <TableHead className="h-auto p-1 font-bold w-[80px]">Section</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold w-[40px]">Feet</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold w-[30px]">Qty</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold w-[50px]">Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {group.items.map((item, index) => (
                                <TableRow key={index} className="border-none">
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
