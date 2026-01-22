
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Sale, SaleItem } from "@/lib/types";

const InvoiceCopy = ({ sale, groupedItems }: { sale: Sale, groupedItems: Record<string, SaleItem[]> }) => (
    <div className="w-1/2 px-1">
        {/* Header */}
        <div className="text-left font-bold mb-2">
            <p>{sale.customerName.toUpperCase()} {formatDate(sale.date)} {sale.id}</p>
        </div>

        {/* Grouped Items */}
        <div className="flex flex-col space-y-2">
            {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="break-inside-avoid">
                    <h2 className="font-bold text-center mb-1 underline">{groupName}</h2>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b-2 border-black">
                                <TableHead className="h-auto p-1 font-bold w-[60%]">Section</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Feet</TableHead>
                                <TableHead className="text-right h-auto p-1 font-bold">Qty</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="p-1 font-semibold">{item.itemName}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.feet ? item.feet.toFixed(1) : '-'}</TableCell>
                                    <TableCell className="text-right p-1 font-semibold">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ))}
        </div>
    </div>
);


export default function PrintSimpleInvoicePage() {
  const { id } = useParams();
  const { sales, loading: isDataLoading } = useData();

  const sale = sales.find(s => s.id === id);
  const isLoading = isDataLoading || !sale;

  const groupedItems = useMemo(() => {
    if (!sale) return {};
    const sortedItems = [...sale.items].sort((a, b) => a.itemName.localeCompare(b.itemName));
    return sortedItems.reduce((acc, item) => {
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
    <div className="p-2 bg-white text-black font-sans text-xs flex flex-row">
        <InvoiceCopy sale={sale} groupedItems={groupedItems} />
        <div className="border-l border-dashed border-gray-400 mx-1"></div>
        <InvoiceCopy sale={sale} groupedItems={groupedItems} />
    </div>
  );
}
