
"use client";

import { useState, FormEvent } from "react";
import { MoreHorizontal, PlusCircle, Trash2, Undo2, Printer, CheckCircle, FileText } from "lucide-react";
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
import type { Sale, Transaction, Customer, SaleItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Checkbox } from "@/components/ui/checkbox";

function SaleInvoice({ sale, customers, onPost, onUnpost }: { sale: Sale, customers: Customer[], onPost: (saleId: string) => void, onUnpost: (saleId: string) => void }) {
    const customer = customers.find(c => c.id === sale.customerId);
    const { toast } = useToast();
    
    let subtotal = sale.items.reduce((acc, item) => {
        const itemTotal = (item.feet || 1) * item.price * item.quantity;
        const discountAmount = itemTotal * ((item.discount || 0) / 100);
        return acc + (itemTotal - discountAmount);
    }, 0);
    const overallDiscountAmount = (subtotal * sale.discount) / 100;
    const grandTotal = subtotal - overallDiscountAmount;

    const handlePrint = () => {
        const printableArea = document.getElementById('printable-invoice-area');
        if (printableArea) {
            document.body.classList.add('printing-now');
            printableArea.classList.add('printable-area');
            window.print();
            printableArea.classList.remove('printable-area');
            document.body.classList.remove('printing-now');
        }
    }

    const handlePost = () => {
        onPost(sale.id);
        toast({ title: 'Sale Posted!', description: `Sale ${sale.id} has been posted to the ledger.`});
    }

    const handleUnpost = () => {
        onUnpost(sale.id);
        toast({ variant: 'destructive', title: 'Sale Unposted!', description: `Sale ${sale.id} has been reverted to draft.`});
    }

    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 no-print">
                <DialogTitle>Sale Invoice: {sale.id}</DialogTitle>
            </DialogHeader>
            <div id="printable-invoice-area" className="flex-grow overflow-y-auto">
                 <div className="bg-white text-black p-8 font-sans text-sm">
                      <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                          <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
                          <p className="text-muted-foreground">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                          <p className="text-muted-foreground">+92 333 4646356</p>
                        </div>
                        <div className="text-right">
                          <h2 className="text-4xl font-bold uppercase text-gray-800">INVOICE</h2>
                          <div className="mt-2">
                            <p><span className="font-semibold text-muted-foreground">Invoice #:</span> {sale.id}</p>
                            <p><span className="font-semibold text-muted-foreground">Date:</span> {formatDate(sale.date)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                          <h3 className="font-semibold text-muted-foreground mb-1">Bill To:</h3>
                          <p className="font-bold text-lg">{sale.customerName}</p>
                          {customer?.address && <p>{customer.address}</p>}
                          {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-100">
                            <TableHead className="font-bold">Description</TableHead>
                            <TableHead className="font-bold">Thickness</TableHead>
                            <TableHead className="text-right font-bold">Feet</TableHead>
                            <TableHead className="text-right font-bold">Qty</TableHead>
                            <TableHead className="text-right font-bold">Rate</TableHead>
                            <TableHead className="text-right font-bold">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sale.items.map((item, index) => {
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
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Overall Discount ({sale.discount}%)</span>
                            <span>- {formatCurrency(overallDiscountAmount)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2">
                            <span>Grand Total</span>
                            <span>{formatCurrency(grandTotal)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-20 text-center text-xs text-gray-500 border-t pt-4">
                        <p>Thank you for your business!</p>
                      </div>

                    </div>
            </div>
             <DialogFooter className="mt-4 flex-shrink-0 no-print">
                 <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                </Button>
                {sale.status === 'draft' ? (
                    <Button onClick={handlePost}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Post to Ledger
                    </Button>
                ) : (
                    <Button variant="destructive" onClick={handleUnpost}>
                        <Undo2 className="mr-2 h-4 w-4" />
                        Unpost from Ledger
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
    )
}

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

export default function SalesPage() {
  const { customers, addManualSale, deleteSale, postSale, unpostSale } = useData();
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
  
  const [selectedSaleForDetails, setSelectedSaleForDetails] = useState<Sale | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
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

  const handlePostSale = (saleId: string) => {
      const saleToPost = sales.find(s => s.id === saleId);
      if (saleToPost) {
        postSale(saleToPost);
        setSelectedSaleForDetails(null);
      }
  }

   const handleUnpostSale = (saleId: string) => {
      const saleToUnpost = sales.find(s => s.id === saleId);
      if(saleToUnpost) {
        unpostSale(saleToUnpost);
        setSelectedSaleForDetails(null);
      }
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setSelectedSaleForDetails(sale)}>
                            <FileText className="mr-2 h-4 w-4"/>
                            View Details
                        </DropdownMenuItem>
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

        {selectedSaleForDetails && (
            <Dialog open={!!selectedSaleForDetails} onOpenChange={(open) => !open && setSelectedSaleForDetails(null)}>
                <SaleInvoice
                    sale={selectedSaleForDetails}
                    customers={customers}
                    onPost={handlePostSale}
                    onUnpost={handleUnpostSale}
                />
            </Dialog>
        )}
    </>
  );
}

    