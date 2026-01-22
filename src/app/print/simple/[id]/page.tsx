
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
    const sorted = [...sale.items].sort((a, b) => {
        const keyA = `${a.thickness || 'N/A'}-${a.color || 'N/A'}`;
        const keyB = `${b.thickness || 'N/A'}-${b.color || 'N/A'}`;
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return a.itemName.localeCompare(b.itemName);
    });

    return sorted.reduce((acc, item) => {
        const key = `${item.thickness || 'N/A'}mm ${item.color || 'N/A'}`;
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

            {Object.entries(groupedItems).map(([groupName, items]) => (
                <div key={groupName} className="mb-2">
                    <p className="font-bold text-center border-y border-black">{groupName}</p>
                    <Table className="border-collapse table-fixed w-auto">
                         <TableHeader>
                            <TableRow className="border-black">
                                <TableHead className="px-1 py-0.5 font-bold border-x border-black" style={{ width: '88px' }}>Section</TableHead>
                                <TableHead className="text-right px-1 py-0.5 font-bold border-r border-black" style={{ width: '33px' }}>Feet</TableHead>
                                <TableHead className="text-right px-1 py-0.5 font-bold border-r border-black" style={{ width: '33px' }}>Qty</TableHead>
                                <TableHead className="text-right px-1 py-0.5 font-bold border-r border-black" style={{ width: '33px' }}>Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index} className="border-none">
                                    <TableCell className="px-1 py-0.5 font-semibold border-x border-b border-black">
                                        {item.itemName}
                                    </TableCell>
                                    <TableCell className="text-right px-1 py-0.5 font-semibold border-r border-b border-black">
                                        {item.feet ? item.feet.toFixed(0) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right px-1 py-0.5 font-semibold border-r border-b border-black">
                                        {item.quantity}
                                    </TableCell>
                                    <TableCell className="text-right px-1 py-0.5 font-semibold border-r border-b border-black">
                                        {item.price}
                                    </TableCell>
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
