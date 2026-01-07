
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useData } from '@/firebase/data/data-provider';
import type { Sale } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function ChallanPrintPage({ params }: { params: { id: string } }) {
  const { sales, customers } = useData();
  const [sale, setSale] = useState<Sale | null>(null);
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    if (sales.length > 0) {
      const foundSale = sales.find(s => s.id === params.id);
      if (foundSale) {
        setSale(foundSale);
      }
    }
  }, [sales, params.id]);
  
  useEffect(() => {
    if (sale && !isPreview) {
      setTimeout(() => {
        window.print();
        window.onafterprint = () => window.close();
      }, 500); 
    }
  }, [sale, isPreview]);

  const customer = sale ? customers.find(c => c.id === sale.customerId) : null;
  
  if (!sale) {
    return <div className="p-10 text-center">Loading challan...</div>;
  }

  return (
    <div className="bg-white text-black p-4 text-xl">
        <div className="text-center mb-4">
            <h1 className="text-4xl font-extrabold font-headline">ARCO Aluminium Company</h1>
            <p className="mt-1 text-3xl font-extrabold">Delivery Challan</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <p className="font-extrabold text-2xl">Customer:</p>
                <p className="font-bold text-2xl">{sale.customerName}</p>
                <p className="font-bold text-xl">{customer?.address}</p>
                <p className="font-bold text-xl">{customer?.phoneNumber}</p>
            </div>
            <div className="text-right">
                <p className="font-extrabold text-2xl">Challan No:</p>
                <p className="font-bold text-2xl">{sale.id}</p>
                <p className="mt-2 font-extrabold text-2xl">Date:</p>
                <p className="font-bold text-2xl">{formatDate(sale.date)}</p>
            </div>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-extrabold text-2xl w-[40%]">Item</TableHead>
                        <TableHead className="font-extrabold text-2xl">Colour</TableHead>
                        <TableHead className="font-extrabold text-2xl">Thickness</TableHead>
                        <TableHead className="text-right font-extrabold text-2xl">Feet</TableHead>
                        <TableHead className="text-right font-extrabold text-2xl">Quantity</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sale.items.map((item, index) => (
                        <TableRow key={index} className="font-bold text-xl">
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell>{item.color}</TableCell>
                            <TableCell>{item.thickness || '-'}</TableCell>
                            <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 text-center">
            <div className="border-t-2 border-black pt-2 font-extrabold text-2xl">
                <p>Receiver's Signature</p>
            </div>
            <div className="border-t-2 border-black pt-2 font-extrabold text-2xl">
                <p>Driver's Signature</p>
            </div>
        </div>
        <div className="mt-8 text-center text-lg text-gray-500 border-t pt-2">
            <p className="font-bold">Industrial Estate, Hayatabad Road B-5 PLOT 59 PESHAWAR</p>
            <p className="font-bold">Phone: +923334646356</p>
        </div>
    </div>
  );
}

export default function ChallanPrintPageWrapper({ params }: { params: { id: string } }) {
    return (
        <ChallanPrintPage params={params} />
    )
}
