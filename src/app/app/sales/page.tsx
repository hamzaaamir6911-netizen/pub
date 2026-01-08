
"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { MoreHorizontal, Trash2, CheckCircle, FileText, Undo2, ArrowLeft, Printer, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Transaction, Customer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";


function ReceivePaymentForm({ sale, onPaymentReceived, onOpenChange }: { sale: Sale; onPaymentReceived: (saleId: string, amount: number, date: Date) => void; onOpenChange: (open: boolean) => void; }) {
    const [amount, setAmount] = useState(sale.total);
    const [date, setDate] = useState(new Date());

    const handleSubmit = () => {
        onPaymentReceived(sale.id, amount, date);
        onOpenChange(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Receive Payment for Invoice {sale.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p>Customer: <span className="font-semibold">{sale.customerName}</span></p>
                <p>Invoice Total: <span className="font-semibold">{formatCurrency(sale.total)}</span></p>
                <div className="space-y-2">
                    <Label htmlFor="date">Payment Date</Label>
                    <Input id="date" type="date" value={date.toISOString().split('T')[0]} onChange={(e) => setDate(new Date(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="amount">Amount Received</Label>
                    <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Receive Payment</Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function SalesPage() {
  const { customers, addTransaction, deleteSale, postSale, unpostSale, loading: isDataLoading } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const transactionsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'transactions') : null, [firestore, shouldFetch]);

  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  const { data: transactionsData } = useCollection<Transaction>(transactionsCol);
  
  const sales = salesData || [];
  const transactions = transactionsData || [];
  
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
        const numA = parseInt(a.id.split('-')[1] || '0', 10);
        const numB = parseInt(b.id.split('-')[1] || '0', 10);
        return numB - numA; 
    });
  }, [sales]);
  
  const handleDelete = (sale: Sale) => {
    deleteSale(sale, transactions);
  };

  const handlePostSale = (saleId: string) => {
      const saleToPost = sales.find(s => s.id === saleId);
      if (saleToPost) {
        postSale(saleToPost);
        // Refresh the viewing sale to show the updated status
        setViewingSale({ ...saleToPost, status: 'posted' });
      }
  }

   const handleUnpostSale = (saleId: string) => {
      const saleToUnpost = sales.find(s => s.id === saleId);
      if(saleToUnpost) {
        unpostSale(saleToUnpost);
        // Refresh the viewing sale to show the updated status
        setViewingSale({ ...saleToUnpost, status: 'draft' });
      }
  }
  
  const handlePaymentReceived = (saleId: string, amount: number, date: Date) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    addTransaction({
        description: `Payment received for Invoice ${saleId}`,
        amount,
        type: 'credit',
        category: 'Customer Payment',
        customerId: sale.customerId,
        customerName: sale.customerName,
        date,
    });
    toast({ title: 'Payment Received', description: `Payment of ${formatCurrency(amount)} for ${sale.customerName} has been recorded.` });
  };
  
  const handlePrintChallan = (saleId: string) => {
    window.open(`/print/challan/${saleId}`, '_blank');
  };

  if (viewingSale) {
    const customerForInvoice = customers.find(c => c.id === viewingSale.customerId);
    return (
        <>
            <PageHeader
                title={`Invoice: ${viewingSale.id}`}
                description={`Details for invoice sent to ${viewingSale.customerName}`}
            >
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setViewingSale(null)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sales List
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                    <Button variant="outline" onClick={() => handlePrintChallan(viewingSale.id)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Challan
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedSaleForPayment(viewingSale)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Receive Payment
                    </Button>
                </div>
            </PageHeader>
             <div id="printable-invoice" className="bg-background text-foreground p-4 sm:p-8 font-sans text-sm rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-8">
                    <div>
                    <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
                    <p className="text-muted-foreground">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                    <p className="text-muted-foreground">+92 333 4646356</p>
                    </div>
                    <div className="text-right">
                    <h2 className="text-4xl font-bold uppercase text-gray-800">INVOICE</h2>
                    <div className="mt-2">
                        <p><span className="font-semibold text-muted-foreground">Invoice #:</span> {viewingSale.id}</p>
                        <p><span className="font-semibold text-muted-foreground">Date:</span> {formatDate(viewingSale.date)}</p>
                        <p><span className="font-semibold text-muted-foreground">Status:</span> <Badge variant={viewingSale.status === 'posted' ? 'default' : 'secondary'}>{viewingSale.status}</Badge></p>
                    </div>
                    </div>
                </div>
                
                <div className="mb-8">
                    <h3 className="font-semibold text-muted-foreground mb-1">Bill To:</h3>
                    <p className="font-bold text-lg">{viewingSale.customerName}</p>
                    {customerForInvoice?.address && <p>{customerForInvoice.address}</p>}
                    {customerForInvoice?.phoneNumber && <p>{customerForInvoice.phoneNumber}</p>}
                </div>

                <Table>
                    <TableHeader>
                    <TableRow className="bg-gray-100 dark:bg-muted/50">
                        <TableHead className="font-bold">Description</TableHead>
                        <TableHead className="font-bold">Thickness</TableHead>
                        <TableHead className="text-right font-bold">Feet</TableHead>
                        <TableHead className="text-right font-bold">Qty</TableHead>
                        <TableHead className="text-right font-bold">Rate</TableHead>
                        <TableHead className="text-right font-bold">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {viewingSale.items.map((item, index) => {
                        const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                        return (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.color})</span></TableCell>
                            <TableCell>{item.thickness || '-'}</TableCell>
                            <TableCell className="text-right">{item.feet?.toFixed(2) ?? '-'}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(itemSubtotal)}</TableCell>
                        </TableRow>
                        );
                    })}
                    </TableBody>
                </Table>
                
                <div className="flex justify-end mt-6">
                    <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(viewingSale.items.reduce((acc, item) => acc + (item.feet || 1) * item.price * item.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Overall Discount ({viewingSale.discount}%)</span>
                        <span>- {formatCurrency((viewingSale.items.reduce((acc, item) => acc + (item.feet || 1) * item.price * item.quantity, 0)) * viewingSale.discount / 100)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-black dark:border-white pt-2 mt-2">
                        <span>Grand Total</span>
                        <span>{formatCurrency(viewingSale.total)}</span>
                    </div>
                    </div>
                </div>
                
                <div className="mt-20 text-center text-xs text-gray-500 border-t pt-4">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        </>
    )
  }


  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      >
      </PageHeader>
      
      <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto print-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isSalesLoading || isDataLoading ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">Loading sales...</TableCell>
                </TableRow>
            ) : sortedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No sales recorded.</TableCell>
              </TableRow>
            ) : (
              sortedSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.customerName}</TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === 'posted' ? 'default' : 'secondary'}>
                        {sale.status}
                      </Badge>
                    </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(sale.total)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem onSelect={() => setViewingSale(sale)}>
                            <FileText className="mr-2 h-4 w-4"/>
                            View Invoice
                        </DropdownMenuItem>
                        {sale.status === 'draft' && (
                            <DropdownMenuItem onSelect={() => handlePostSale(sale.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Post to Ledger
                            </DropdownMenuItem>
                        )}
                        {sale.status === 'posted' && (
                            <DropdownMenuItem onSelect={() => handleUnpostSale(sale.id)}>
                                <Undo2 className="mr-2 h-4 w-4" />
                                Unpost
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onSelect={() => handleDelete(sale)}
                          className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4"/>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       <Dialog open={!!selectedSaleForPayment} onOpenChange={(open) => !open && setSelectedSaleForPayment(null)}>
            {selectedSaleForPayment && (
                <ReceivePaymentForm 
                    sale={selectedSaleForPayment} 
                    onPaymentReceived={handlePaymentReceived}
                    onOpenChange={(open) => !open && setSelectedSaleForPayment(null)}
                />
            )}
        </Dialog>
    </>
  );
}
