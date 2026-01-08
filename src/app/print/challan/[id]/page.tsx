
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function PrintChallanPage() {
  const { id } = useParams();
  const { customers, sales, loading: isDataLoading } = useData();

  const sale = sales.find(s => s.id === id);
  const customer = customers.find(c => c.id === sale?.customerId);
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
    return <div>Loading challan...</div>;
  }

  if (!sale) {
    return <div>Challan not found.</div>;
  }

  return (
    <div className="p-8 font-sans bg-white text-black text-sm font-semibold">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold font-headline">ARCO Aluminium Company</h1>
            <p className="mt-1 text-lg font-bold">Delivery Challan</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
                <p className="font-bold">Customer:</p>
                <p>{sale.customerName}</p>
                {customer?.address && <p>{customer.address}</p>}
                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
            </div>
            <div className="text-right">
                <p className="font-bold">Challan No: <span className="font-semibold">{sale.id}</span></p>
                <p className="font-bold">Date: <span className="font-semibold">{formatDate(sale.date)}</span></p>
            </div>
        </div>
        <Table className="text-sm font-semibold">
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-[40%] font-extrabold text-black">Item</TableHead>
                    <TableHead className="font-extrabold text-black">Colour</TableHead>
                    <TableHead className="font-extrabold text-black">Thickness</TableHead>
                    <TableHead className="text-right font-extrabold text-black">Feet</TableHead>
                    <TableHead className="text-right font-extrabold text-black">Quantity</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sale.items.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.color}</TableCell>
                        <TableCell>{item.thickness || '-'}</TableCell>
                        <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
            <div className="mt-24 grid grid-cols-2 gap-8 text-sm">
            <div className="border-t-2 border-black pt-2 font-bold text-center"><p>Receiver's Signature</p></div>
            <div className="border-t-2 border-black pt-2 font-bold text-center"><p>Driver's Signature</p></div>
        </div>
    </div>
  );
}
