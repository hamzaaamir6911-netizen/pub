
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
    <div className="p-8 font-sans bg-white text-black text-sm">
       <style>
        {`
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        `}
      </style>
        <div className="text-center mb-4">
            <h1 className="text-xl font-extrabold font-headline">ARCO Aluminium Company</h1>
            <p className="mt-1 text-lg font-extrabold">Delivery Challan</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <p className="font-bold">Customer:</p>
                <p>{sale.customerName}</p>
                {customer?.address && <p>{customer.address}</p>}
                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
            </div>
            <div className="text-right">
                <p className="font-bold">Challan No: <span className="font-normal">{sale.id}</span></p>
                <p className="font-bold">Date: <span className="font-normal">{formatDate(sale.date)}</span></p>
            </div>
        </div>
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-100">
                    <TableHead className="w-[40%] font-bold text-black">Item</TableHead>
                    <TableHead className="font-bold text-black">Colour</TableHead>
                    <TableHead className="font-bold text-black">Thickness</TableHead>
                    <TableHead className="text-right font-bold text-black">Feet</TableHead>
                    <TableHead className="text-right font-bold text-black">Quantity</TableHead>
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
            <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
            <div className="border-t-2 border-black pt-2 font-bold"><p>Receiver's Signature</p></div>
            <div className="border-t-2 border-black pt-2 font-bold"><p>Driver's Signature</p></div>
        </div>
    </div>
  );
}
