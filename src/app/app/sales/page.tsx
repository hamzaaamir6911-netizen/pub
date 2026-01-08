
"use client";

import { useState, useEffect, FormEvent } from "react";
import { MoreHorizontal, PlusCircle, Trash2, Edit, Undo2, Printer, Truck, DollarSign, FileText, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";

function ManualInvoiceForm({ onManualSaleAdded, onOpenChange }: { onManualSaleAdded: (sale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'>) => Promise<void>, onOpenChange: (open: boolean) => void }) {
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

    const manualSale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'> & { amount: number, description: string } = {
      customerName: customer.customerName,
      customerId: customer.id,
      date: new Date(date),
      amount,
      description,
    };

    try {
        await onManualSaleAdded(manualSale);
        toast({ title: 'Manual Invoice Added!', description: `A posted sale of ${formatCurrency(amount)} has been recorded for ${customer.customerName}.` });
        
        onOpenChange(false);
    } catch(e) {
        console.error("Failed to add manual sale: ", e);
        toast({ variant: 'destructive', title: 'Error', description: "Could not save the manual sale." });
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

function ReceivePaymentForm({ sale, onPaymentReceived, onOpenChange }: { sale: Sale, onPaymentReceived: (sale: Sale, amount: number, date: Date) => void, onOpenChange: (open: boolean) => void }) {
    const [amount, setAmount] = useState(sale.total);
    const [date, setDate] = useState(new Date());

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onPaymentReceived(sale, amount, date);
        onOpenChange(false);
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Receive Payment for Invoice {sale.id}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Customer</p>
                        <p className="text-sm text-muted-foreground">{sale.customerName}</p>
                    </div>
                     <div className="space-y-1">
                        <p className="text-sm font-medium">Invoice Total</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(sale.total)}</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Payment Date</Label>
                        <Input 
                            id="date"
                            type="date"
                            value={date.toISOString().split('T')[0]}
                            onChange={(e) => setDate(new Date(e.target.value))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount Received</Label>
                        <Input 
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            required
                        />
                    </div>
                </div>
                 <DialogFooter>
                    <Button type="submit">Receive Payment</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    )
}

function DeliveryChallan({ sale, onOpenChange }: { sale: Sale, onOpenChange: (open: boolean) => void }) {
    const { toast } = useToast();
    
    const handlePrint = () => {
      const printWindow = window.open(`/print/challan/${sale.id}`, '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        toast({
          variant: "destructive",
          title: "Print Failed",
          description: "Please allow pop-ups for this site to print the challan."
        });
      }
      onOpenChange(false);
    };

    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 no-print">
                <DialogTitle>Delivery Challan Preview: {sale.id}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto bg-gray-50 rounded-sm">
                 <iframe 
                    src={`/print/challan/${sale.id}?preview=true`}
                    className="w-full h-full border-none"
                    title={`Challan Preview ${sale.id}`}
                 />
            </div>
            <DialogFooter className="mt-4 flex-shrink-0 no-print">
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Challan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default function SalesPage() {
  const { addSale, deleteSale, postSale, unpostSale, addTransaction, addManualSale } = useData();
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
  
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedChallan, setSelectedChallan] = useState<Sale | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isManualInvoiceModalOpen, setManualInvoiceModalOpen] = useState(false);

  const sortedSales = [...sales].sort((a, b) => {
    const numA = parseInt(a.id.split('-')[1] || '0', 10);
    const numB = parseInt(b.id.split('-')[1] || '0', 10);
    
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
        return numB - numA;
    }
    
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const handlePrintSelected = () => {
    if (selectedRows.size === 0) {
      toast({
        variant: "destructive",
        title: "No Sales Selected",
        description: "Please select at least one sale to print a report.",
      });
      return;
    }
    const ids = Array.from(selectedRows).join(',');
    const printWindow = window.open(`/print/sales-report?ids=${ids}`, '_blank', 'noopener,noreferrer');
     if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Print Failed",
        description: "Please allow pop-ups for this site to print reports."
      });
    }
  };

  const handleViewInvoice = (saleId: string) => {
    const printWindow = window.open(`/print/invoice/${saleId}`, '_blank', 'noopener,noreferrer');
    if (!printWindow) {
      toast({
        variant: "destructive",
        title: "Print Failed",
        description: "Please allow pop-ups for this site to print the invoice."
      });
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(id)) {
      newSelectedRows.delete(id);
    } else {
      newSelectedRows.add(id);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === sortedSales.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(sortedSales.map(s => s.id)));
    }
  };
  
  const handleDelete = (sale: Sale) => {
    deleteSale(sale, transactions);
  };
  
  const handleManualSaleAdded = (manualSale: Omit<Sale, 'id' | 'total' | 'status' | 'items' | 'discount'>) => {
    addManualSale(manualSale);
  }

  const handlePostSale = (sale: Sale) => {
      postSale(sale);
      toast({ title: 'Sale Posted!', description: `Sale ${sale.id} has been posted to the ledger.`});
  }

   const handleUnpostSale = (sale: Sale) => {
      unpostSale(sale);
      toast({ variant: 'destructive', title: 'Sale Unposted!', description: `Sale ${sale.id} has been reverted to draft.`});
  }

  const handleOpenPaymentModal = (sale: Sale) => {
      setPaymentSale(sale);
      setPaymentModalOpen(true);
  }
  
  const handlePaymentReceived = (sale: Sale, amount: number, date: Date) => {
      const newTransaction: Omit<Transaction, 'id'> = {
        description: `Payment received for Invoice: ${sale.id}`,
        amount: amount,
        type: 'credit',
        category: 'Customer Payment',
        customerId: sale.customerId,
        customerName: sale.customerName,
        date: date,
      };
      addTransaction(newTransaction);
      toast({ title: "Payment Received", description: `Recorded ${formatCurrency(amount)} from ${sale.customerName}.` });
  }

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
            <Button onClick={handlePrintSelected} disabled={selectedRows.size === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Print Selected
            </Button>
        </div>
      </PageHeader>
      
      <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                    checked={selectedRows.size > 0 && selectedRows.size === sortedSales.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                />
              </TableHead>
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
                <TableCell colSpan={7} className="text-center h-24">No sales recorded.</TableCell>
              </TableRow>
            ) : (
              sortedSales.map((sale) => (
                <TableRow key={sale.id} data-state={selectedRows.has(sale.id) && "selected"}>
                  <TableCell>
                      <Checkbox
                        checked={selectedRows.has(sale.id)}
                        onCheckedChange={() => handleSelectRow(sale.id)}
                        aria-label={`Select row ${sale.id}`}
                    />
                  </TableCell>
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
                    <Dialog onOpenChange={(open) => { if (!open) setSelectedChallan(null) }}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleViewInvoice(sale.id)}>
                              <FileText className="mr-2 h-4 w-4"/>
                              View/Print Invoice
                          </DropdownMenuItem>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={() => setSelectedChallan(sale)}>
                                <Truck className="mr-2 h-4 w-4"/>
                                Delivery Challan
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DropdownMenuItem onSelect={() => handleOpenPaymentModal(sale)}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Receive Payment
                          </DropdownMenuItem>
                          {sale.status === 'draft' ? (
                            <DropdownMenuItem onSelect={() => handlePostSale(sale)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Post to Ledger
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onSelect={() => handleUnpostSale(sale)}>
                              <Undo2 className="mr-2 h-4 w-4" />
                              Unpost from Ledger
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
                      {selectedChallan && selectedChallan.id === sale.id && (
                          <DeliveryChallan sale={selectedChallan} onOpenChange={(open) => !open && setSelectedChallan(null)} />
                      )}
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {paymentSale && (
        <Dialog open={isPaymentModalOpen} onOpenChange={setPaymentModalOpen}>
            <ReceivePaymentForm 
                sale={paymentSale} 
                onPaymentReceived={handlePaymentReceived} 
                onOpenChange={setPaymentModalOpen} 
            />
        </Dialog>
      )}
    </>
  );
}
