
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useData } from "@/firebase/data/data-provider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function PrintInvoicePage() {
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
      }, 500); // Small delay to ensure rendering is complete
    }
  }, [isLoading]);

  if (isLoading) {
    return <div>Loading invoice...</div>;
  }

  if (!sale) {
    return <div>Invoice not found.</div>;
  }

  const subtotal = sale.items.reduce((acc, item) => {
      const itemTotal = (item.feet || 1) * item.price * item.quantity;
      const discountAmount = itemTotal * ((item.discount || 0) / 100);
      return acc + (itemTotal - discountAmount);
  }, 0);
  const overallDiscountAmount = (subtotal * sale.discount) / 100;
  const grandTotal = subtotal - overallDiscountAmount;

  return (
    <div className="bg-white text-black font-semibold">
       <div className="p-8 bg-teal-600 text-white font-bold">
          <div className="flex justify-between items-start">
              <div>
                  <h1 className="text-4xl font-extrabold">ARCO Aluminium Company</h1>
                  <p className="text-sm text-teal-100 font-semibold">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                  <p className="text-sm text-teal-100 font-semibold">+92 333 4646356</p>
              </div>
              <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase">Invoice</h2>
                  <div className="grid grid-cols-2 gap-x-4 mt-2 text-sm">
                      <span className="font-bold">Date:</span>
                      <span className="font-semibold">{formatDate(sale.date)}</span>
                      <span className="font-bold">Invoice #:</span>
                      <span className="font-semibold">{sale.id}</span>
                  </div>
              </div>
          </div>
      </div>
      
      <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="space-y-4">
                  <div className="font-bold text-sm uppercase text-gray-500">From</div>
                  <div className="text-sm text-gray-700 font-semibold">
                      <p className="font-bold">ARCO Aluminium Company</p>
                      <p>B-5, PLOT 59, Industrial Estate,</p>
                      <p>Hayatabad, Peshawar</p>
                      <p>+92 333 4646356</p>
                  </div>
              </div>
              <div className="space-y-4">
                   <div className="font-bold text-sm uppercase text-gray-500">To</div>
                  <div className="text-sm text-gray-700 font-semibold">
                      <p className="font-extrabold">{sale.customerName}</p>
                      {customer?.address && <p>{customer.address}</p>}
                      {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                  </div>
              </div>
          </div>


          <Table className="text-sm font-bold">
              <TableHeader>
                  <TableRow className="bg-gray-100 hover:bg-gray-100">
                      <TableHead className="font-extrabold text-gray-800 uppercase w-[40%]">Description</TableHead>
                      <TableHead className="text-right font-extrabold text-gray-800 uppercase">Feet</TableHead>
                      <TableHead className="text-right font-extrabold text-gray-800 uppercase">Qty</TableHead>
                      <TableHead className="text-right font-extrabold text-gray-800 uppercase">Rate</TableHead>
                      <TableHead className="text-right font-extrabold text-gray-800 uppercase">Total</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
              {sale.items.map((item, index) => {
                  const itemTotal = (item.feet || 1) * item.price * item.quantity;
                  return (
                  <TableRow key={index} className="border-gray-200">
                      <TableCell className="font-bold text-gray-800">
                          {item.itemName}
                          <span className="text-gray-500 text-xs block font-semibold">
                              {item.thickness} - {item.color}
                          </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-600 font-bold">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right text-gray-600 font-bold">{item.quantity}</TableCell>
                      <TableCell className="text-right text-gray-600 font-bold">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right font-bold text-gray-800">{formatCurrency(itemTotal)}</TableCell>
                  </TableRow>
                  );
              })}
              </TableBody>
          </Table>

          <div className="flex justify-between items-start mt-8">
               <div className="w-1/2">
                  <div className="font-bold text-sm uppercase text-gray-500">Notes</div>
                  <p className="text-xs text-gray-500 mt-2 font-semibold">
                      Thank you for your business. Please contact us for any queries regarding this invoice.
                  </p>
              </div>
              <div className="w-full max-w-xs space-y-2 text-sm font-semibold">
                  <div className="flex justify-between text-gray-600"><span >Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Overall Discount ({sale.discount}%)</span><span>- {formatCurrency(overallDiscountAmount)}</span></div>
                  <div className="flex justify-between font-bold text-lg border-t-2 border-gray-800 pt-2 mt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
              </div>
          </div>
      </div>
    </div>
  );
}
