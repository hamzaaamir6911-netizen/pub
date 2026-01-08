

"use client";

import { useState, useMemo, FormEvent, useEffect } from "react";
import { X, MoreHorizontal, Printer, Edit, Trash2, PlusCircle, Undo2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import type { Transaction, Sale } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useData } from "@/firebase/data/data-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";


function AddPaymentForm({ onTransactionAdded, onOpenChange }: { onTransactionAdded: (newTransaction: Omit<Transaction, 'id'>) => Promise<void>, onOpenChange: (open: boolean) => void }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const { customers } = useData();
  const { toast } = useToast();
  
  useEffect(() => {
    if (selectedCustomerId) {
        const customer = customers.find(c => c.id === selectedCustomerId);
        if (customer) {
            if (type === 'credit') {
                setDescription(`Cash received from ${customer.customerName}`);
            } else {
                 // For debit, clear the description so user can type.
                setDescription('');
            }
        }
    } else {
        setDescription('');
    }
  }, [type, selectedCustomerId, customers]);


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); 
    if (!description || amount <= 0 || !date) {
      toast({ variant: 'destructive', title: 'Please fill all fields correctly.' });
      return;
    }
    
    const customer = customers.find(c => c.id === selectedCustomerId);

    const newTransaction: Omit<Transaction, 'id'> = {
      description,
      amount,
      type,
      category: type === 'credit' ? (customer ? 'Customer Payment' : 'Cash Received') : (customer ? 'Customer Debit' : 'Payment'),
      date: new Date(date),
      customerId: selectedCustomerId,
      customerName: customer?.customerName,
    };

    try {
        await onTransactionAdded(newTransaction);
        toast({ title: 'Transaction Added!', description: `A transaction of ${formatCurrency(amount)} has been recorded.` });
        
        setDescription('');
        setAmount(0);
        setDate(new Date().toISOString().split('T')[0]);
        setType('credit');
        setSelectedCustomerId(undefined);
        onOpenChange(false);
    } catch(e) {
        console.error("Failed to add transaction: ", e);
        toast({ variant: 'destructive', title: 'Error', description: "Could not save the transaction." });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Transaction</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Transaction Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select onValueChange={(value: 'credit' | 'debit') => { setType(value); }} value={type}>
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Cash Received (Credit)</SelectItem>
                <SelectItem value="debit">Payment / Debit Note (Debit)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
           <div className="space-y-2">
              <Label htmlFor="customer">For Customer (Optional)</Label>
              <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId}>
                  <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>)}
                  </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder={type === 'debit' ? "e.g. Fine for late payment" : "e.g. Cash from sale"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} placeholder="Amount in PKR"/>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Transaction</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}


export default function LedgerPage() {
  const { customers, vendors, addTransaction, unpostSale, deleteTransaction } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const transactionsCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'transactions'), orderBy('date', 'asc')) : null, [firestore, shouldFetch]);
  const salesCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'sales') : null, [firestore, shouldFetch]);

  const { data: transactionsData } = useCollection<Transaction>(transactionsCol);
  const { data: salesData } = useCollection<Sale>(salesCol);

  const transactions = transactionsData || [];
  const sales = salesData || [];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const { toast } = useToast();

  const handleTransactionAdded = async (newTransaction: Omit<Transaction, 'id'>) => {
    await addTransaction(newTransaction);
  }

  const handleDelete = async (transaction: Transaction) => {
    if (transaction.category === 'Sale' && transaction.description.includes('Invoice:')) {
        const sale = sales.find(s => transaction.description.includes(s.id));
        if (sale) {
            await unpostSale(sale);
            toast({ title: 'Sale Un-posted', description: `Sale ${sale.id} has been reverted to draft.` });
        } else {
             const invoiceId = transaction.description.split('Invoice: ')[1]?.slice(0, -1);
             toast({ variant: 'destructive', title: 'Sale not found', description: `Could not find sale with ID ${invoiceId}. It might be on a different page or already deleted.`});
        }
        return;
    }
    
    if (transaction.category === 'Salary') {
      toast({
        variant: 'destructive',
        title: 'Deletion Not Allowed',
        description: 'System-generated transactions cannot be deleted from the ledger directly.',
      });
      return;
    }
    deleteTransaction(transaction.id);
    toast({ title: "Transaction Deleted" });
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedCustomerId) {
        filtered = transactions.filter(t => t.customerId === selectedCustomerId);
    } else if (selectedVendorId) {
        filtered = transactions.filter(t => t.vendorId === selectedVendorId);
    }
    return filtered;
  }, [transactions, selectedCustomerId, selectedVendorId]);

  let runningBalance = 0;
  const transactionsWithBalance = filteredTransactions.map(t => {
      if (selectedCustomerId) {
        runningBalance += (t.type === 'debit' ? t.amount : -t.amount);
      } else if (selectedVendorId) {
         runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
      } else {
        runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
      }
      return { ...t, balance: runningBalance };
  });

  const clearFilters = () => {
    setSelectedCustomerId(null);
    setSelectedVendorId(null);
  }

  const handlePrint = () => {
    document.body.classList.add('printing-now');
    window.print();
    document.body.classList.remove('printing-now');
  }

  const hasFilter = selectedCustomerId || selectedVendorId;

  return (
    <>
      <PageHeader
        title="Ledger"
        description="A record of all financial transactions."
      >
        <div className="flex items-center gap-2 no-print">
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" /> Print Page
            </Button>
            <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Transaction
                    </Button>
                </DialogTrigger>
                <AddPaymentForm onTransactionAdded={handleTransactionAdded} onOpenChange={setAddModalOpen} />
            </Dialog>
        </div>
      </PageHeader>

    <div className="printable-area">
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg no-print">
        <h3 className="text-sm font-medium">Filters</h3>
        <div className="flex items-center gap-2">
            <Label htmlFor="customer-filter" className="text-sm">Customer</Label>
            <Select onValueChange={(value) => { setSelectedCustomerId(value || null); setSelectedVendorId(null); }} value={selectedCustomerId || ''}>
                <SelectTrigger id="customer-filter" className="w-[200px]"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="vendor-filter" className="text-sm">Vendor</Label>
            <Select onValueChange={(value) => { setSelectedVendorId(value || null); setSelectedCustomerId(null); }} value={selectedVendorId || ''}>
                <SelectTrigger id="vendor-filter" className="w-[200px]"><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        {hasFilter && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" /> Clear Filter
            </Button>
        )}
      </div>
      
      <div className="hidden print:block text-center my-6">
          <h1 className="text-2xl font-bold font-headline">ARCO Aluminium Company</h1>
          <p className="text-lg font-semibold mt-1">Ledger Report</p>
      </div>

      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              {hasFilter && <TableHead className="text-right">Balance</TableHead>}
              <TableHead className="no-print"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithBalance.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={hasFilter ? 7 : 6} className="h-24 text-center">
                        {transactions.length === 0 ? "No transactions yet." : "No transactions for selected filter."}
                    </TableCell>
                </TableRow>
            ) : (
                transactionsWithBalance.map((transaction) => (
                <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>
                        <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", transaction.type === 'debit' && "font-semibold")}>
                        {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", transaction.type === 'credit' && "font-semibold")}>
                        {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    {hasFilter && <TableCell className="text-right font-mono">{formatCurrency(transaction.balance)}</TableCell>}
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
                           <DropdownMenuItem disabled>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                          </DropdownMenuItem>
                           {transaction.category === 'Sale' && transaction.description.includes('Invoice:') ? (
                                <DropdownMenuItem onSelect={() => handleDelete(transaction)} className="text-blue-500 focus:bg-blue-500/10 focus:text-blue-500">
                                    <Undo2 className="mr-2 h-4 w-4" />
                                    Unpost Sale
                                </DropdownMenuItem>
                           ) : (
                            <DropdownMenuItem
                                onSelect={() => handleDelete(transaction)}
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                disabled={transaction.category === 'Salary'}
                            >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                            </DropdownMenuItem>
                           )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
           {hasFilter && transactionsWithBalance.length > 0 && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Final Balance</TableCell>
                        <TableCell className={cn("text-right font-bold font-mono", runningBalance >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(runningBalance)}
                        </TableCell>
                         <TableCell className="no-print"></TableCell>
                    </TableRow>
                </TableFooter>
           )}
        </Table>
      </div>
    </div>
    </>
  );
}

    

    