
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

  const groupedItems = useMemo(() => {
    if (!sale) return {};
    const sortedItems = [...sale.items].sort((a, b) => {
        const thicknessA = parseFloat(a.thickness || '0');
        const thicknessB = parseFloat(b.thickness || '0');
        if (thicknessA !== thicknessB) {
            return thicknessA - thicknessB;
        }
        if (a.color !== b.color) {
            return (a.color || '').localeCompare(b.color || '');
        }
        return a.itemName.localeCompare(b.itemName);
    });
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
     <div className="p-4 bg-white text-black font-sans text-xs flex justify-start">
        <div className="w-auto">
            {/* Header */}
            <div className="text-left font-bold mb-4">
                <p>{sale.customerName.toUpperCase()}</p>
                <p>DATE: {formatDate(sale.date)} | BILL #: {sale.id}</p>
            </div>

            {/* Grouped Items */}
            <div className="flex flex-col space-y-4">
                {Object.entries(groupedItems).map(([groupName, items]) => (
                    <div key={groupName} className="break-inside-avoid">
                        <h2 className="font-bold text-center mb-1 underline">{groupName}mm</h2>
                        <Table className="border table-fixed w-auto">
                            <TableHeader>
                                <TableRow className="border-b-2 border-black">
                                    <TableHead className="h-auto px-1 py-0.5 font-bold border-r" style={{ width: '88px' }}>Section</TableHead>
                                    <TableHead className="text-right h-auto px-1 py-0.5 font-bold border-r" style={{ width: '33px' }}>Feet</TableHead>
                                    <TableHead className="text-right h-auto px-1 py-0.5 font-bold border-r" style={{ width: '33px' }}>Qty</TableHead>
                                    <TableHead className="text-right h-auto px-1 py-0.5 font-bold" style={{ width: '33px' }}>Rate</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index} className="border-none">
                                        <TableCell className="px-1 py-0.5 font-semibold border-r">{item.itemName}</TableCell>
                                        <TableCell className="text-right px-1 py-0.5 font-semibold border-r">{item.feet ? item.feet.toFixed(0) : '-'}</TableCell>
                                        <TableCell className="text-right px-1 py-0.5 font-semibold border-r">{item.quantity}</TableCell>
                                        <TableCell className="text-right px-1 py-0.5 font-semibold">{item.price}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
