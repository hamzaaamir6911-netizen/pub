
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

  const sortedItems = useMemo(() => {
    if (!sale) return [];
    return [...sale.items].sort((a, b) => {
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

            {/* Single Table */}
            <div className="break-inside-avoid">
                <Table className="border table-fixed w-auto">
                    <TableBody>
                        {sortedItems.map((item, index) => (
                            <TableRow key={index} className="border-none">
                                <TableCell className="px-1 py-0.5 font-semibold border-r" style={{ width: '88px' }}>
                                    {`${item.itemName} ${item.thickness}mm ${item.color}`}
                                </TableCell>
                                <TableCell className="text-right px-1 py-0.5 font-semibold border-r" style={{ width: '33px' }}>
                                    {item.feet ? item.feet.toFixed(0) : '-'}
                                </TableCell>
                                <TableCell className="text-right px-1 py-0.5 font-semibold border-r" style={{ width: '33px' }}>
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="text-right px-1 py-0.5 font-semibold" style={{ width: '33px' }}>
                                    {item.price}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    </div>
  );
}
