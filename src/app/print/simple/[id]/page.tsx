"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Sale } from "@/lib/types";


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
        <div className="text-right mb-4">
            <p className="font-bold">
                {sale.customerName.toUpperCase()} | {formatDate(sale.date)} | {sale.id}
            </p>
        </div>

        <div>
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-black">
                        <TableHead className="h-auto p-1 font-bold border-r border-black w-[40%]">Section</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold border-r border-black">Feet</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold border-r border-black">Qty</TableHead>
                        <TableHead className="text-right h-auto p-1 font-bold">Rate</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sale.items.map((item, index) => (
                        <TableRow key={index} className="border-none">
                            <TableCell className="p-1 font-semibold border-r border-black">{item.itemName}</TableCell>
                            <TableCell className="text-right p-1 font-semibold border-r border-black">{item.feet ? item.feet.toFixed(1) : '-'}</TableCell>
                            <TableCell className="text-right p-1 font-semibold border-r border-black">{item.quantity}</TableCell>
                            <TableCell className="text-right p-1 font-semibold">{item.price.toFixed(0)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
