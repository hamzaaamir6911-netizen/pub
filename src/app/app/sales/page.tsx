
"use client";

import { useState, FormEvent, useMemo } from "react";
import { MoreHorizontal, Trash2, CheckCircle, FileText, Undo2 } from "lucide-react";
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
import type { Sale, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";


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
  const { customers, addTransaction, addManualSale, deleteSale, postSale, unpostSale } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const transactionsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'transactions') : null, [firestore, shouldFetch]);

  const { data: salesData } = useCollection<Sale>(salesCol);
  const { data: transactionsData } = useCollection<Transaction>(transactionsCol);
  
  const sales = salesData || [];
  const transactions = transactionsData || [];
  
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
  const [isManualInvoiceModalOpen, setManualInvoiceModalOpen] = useState(false);

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
        const numA = parseInt(a.id.split('-')[1] || '0', 10);
        const numB = parseInt(b.id.split('-')[1] || '0', 10);
        
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
            return numB - numA;
        }
        
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [sales]);
  
  const handleDelete = (sale: Sale) => {
    deleteSale(sale, transactions);
  };

  const handleManualSaleAdded = (manualSale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'>) => {
    addManualSale(manualSale);
  }

  const handlePostSale = (saleId: string) => {
      const saleToPost = sales.find(s => s.id === saleId);
      if (saleToPost) {
        postSale(saleToPost);
      }
  }

   const handleUnpostSale = (saleId: string) => {
      const saleToUnpost = sales.find(s => s.id === saleId);
      if(saleToUnpost) {
        unpostSale(saleToUnpost);
      }
  }
  
  const handlePrintInvoice = (saleId: string) => {
    window.open(`/print/invoice/${saleId}`, '_blank');
  };

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


  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      >
        <div className="flex items-center gap-2">
            <Dialog open={isManualInvoiceModalOpen} onOpenChange={setManualInvoiceModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Add Manual Invoice</Button>
                </DialogTrigger>
                <ManualInvoiceForm onManualSaleAdded={handleManualSaleAdded} onOpenChange={setManualInvoiceModalOpen} />
            </Dialog>
        </div>
      </PageHeader>
      
      <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sale ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead className="no-print">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSales.length === 0 ? (
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
                  <TableCell className="no-print">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                         <DropdownMenuItem onSelect={() => handlePrintInvoice(sale.id)}>
                            <FileText className="mr-2 h-4 w-4"/>
                            Print Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSelectedSaleForPayment(sale)}>
                            Receive Payment
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


function ManualInvoiceForm({ onManualSaleAdded, onOpenChange }: { onManualSaleAdded: (sale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'>) => void, onOpenChange: (open: boolean) => void }) {
  const [description, setDescription] = useState('Manual Invoice Entry');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const { customers } = useData();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); 
    if (!selectedCustomerId || amount <= 0 || !date) {
      toast({ variant: 'destructive', title: 'Please select a customer and enter a valid amount.' });
      return;
    }
    
    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) return;

    const manualSale = {
      customerName: customer.customerName,
      customerId: customer.id,
      date: new Date(date),
      amount,
      description,
    };

    try {
        await onManualSaleAdded(manualSale as any);
        toast({ title: 'Manual Invoice Added!', description: `A posted sale of ${formatCurrency(amount)} has been recorded for ${customer.customerName}.` });
        
        onOpenChange(false);
    } catch(e: any) {
        console.error("Failed to add manual sale: ", e);
        toast({ variant: 'destructive', title: 'Error', description: e.message || "Could not save the manual sale." });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add Manual Invoice / Debit Entry</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
           <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <select onChange={(e) => setSelectedCustomerId(e.target.value)} value={selectedCustomerId} className="w-full p-2 border rounded-md">
                  <option value="">Select a customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.customerName}</option>)}
              </select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="date">Invoice Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Total Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} placeholder="Amount in PKR"/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Entry</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
