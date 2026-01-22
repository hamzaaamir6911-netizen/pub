"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

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
        <div className="text-center mb-4 font-bold">
            <p>
                {sale.customerName.toUpperCase()} | {formatDate(sale.date)} | {sale.id}
            </p>
        </div>

        <div className="columns-2 gap-4">
            <Table>
                <TableHeader>
                    <TableRow className="border-b-2 border-black break-inside-avoid">
                        <TableHead className="h-auto p-1 font-bold">Section</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold">Feet</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold">Qty</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold">Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sale.items.map((item, index) => (
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
    </div>
  );
}
