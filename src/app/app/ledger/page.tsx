
"use client";

import { useState, useEffect, useMemo } from "react";
import { PlusCircle, X } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDataContext } from "@/context/data-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


function AddTransactionForm({ onTransactionAdded }: { onTransactionAdded: (newTransaction: Omit<Transaction, 'id' | 'date'>) => void }) {
  const { customers } = useDataContext();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState<'credit' | 'debit'>('debit');
  const [category, setCategory] = useState('');
  const [customerId, setCustomerId] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    if (type === 'credit' && customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
            setDescription(`Cash received from ${customer.name}`);
            setCategory('Customer Payment');
        }
    } else if (type === 'debit') {
        setDescription('');
        setCategory('');
        setCustomerId(undefined);
    }
  }, [type, customerId, customers]);

  const handleSubmit = () => {
    if (!description || amount <= 0 || !category) {
      toast({ variant: 'destructive', title: 'Please fill all fields.' });
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    const newTransaction: Omit<Transaction, 'id' | 'date'> = {
      description,
      amount,
      type,
      category,
      customerId: customerId,
      customerName: customer?.name
    };
    onTransactionAdded(newTransaction);
    toast({ title: 'Transaction Added!', description: `A ${type} of ${formatCurrency(amount)} has been recorded.` });
    setDescription('');
    setAmount(0);
    setCategory('');
    setCustomerId(undefined);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Transaction</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select onValueChange={(v: any) => setType(v)} value={type}>
                <SelectTrigger id="type">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="credit">Cash Received (Credit)</SelectItem>
                    <SelectItem value="debit">Vendor Payment (Debit)</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {type === 'credit' && (
            <div className="space-y-2">
                <Label htmlFor="customer">Customer</Label>
                <Select onValueChange={setCustomerId} value={customerId}>
                    <SelectTrigger id="customer">
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder={type === 'debit' ? "Payment to supplier" : "Cash from customer"}
            disabled={type === 'credit' && !!customerId}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} placeholder="Amount in PKR"/>
        </div>
         <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input 
            id="category" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            placeholder={type === 'debit' ? "Vendor Payment" : "Customer Payment"}
            disabled={type === 'credit' && !!customerId}
          />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Add Transaction</Button>
      </DialogFooter>
    </DialogContent>
  );
}


export default function LedgerPage() {
  const { transactions, addTransaction, customers, vendors } = useDataContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const handleTransactionAdded = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    addTransaction(newTransaction);
    setModalOpen(false);
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedCustomerId) {
        filtered = transactions.filter(t => t.customerId === selectedCustomerId);
    }
    if (selectedVendorId) {
        filtered = transactions.filter(t => t.vendorId === selectedVendorId);
    }
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedCustomerId, selectedVendorId]);

  let runningBalance = 0;
  const transactionsWithBalance = filteredTransactions.map(t => {
      if (t.type === 'credit') {
          runningBalance += t.amount;
      } else {
          runningBalance -= t.amount;
      }
      return { ...t, balance: runningBalance };
  });

  const clearFilters = () => {
    setSelectedCustomerId(null);
    setSelectedVendorId(null);
  }

  return (
    <>
      <PageHeader
        title="Ledger"
        description="A record of all financial transactions."
      >
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Voucher
                </Button>
            </DialogTrigger>
            <AddTransactionForm onTransactionAdded={handleTransactionAdded} />
        </Dialog>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
        <h3 className="text-sm font-medium">Filters</h3>
        <div className="flex items-center gap-2">
            <Label htmlFor="customer-filter" className="text-sm">Customer</Label>
            <Select onValueChange={(value) => { setSelectedCustomerId(value); setSelectedVendorId(null); }} value={selectedCustomerId || ''}>
                <SelectTrigger id="customer-filter" className="w-[200px]"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                <SelectContent>
                    {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Label htmlFor="vendor-filter" className="text-sm">Vendor</Label>
            <Select onValueChange={(value) => { setSelectedVendorId(value); setSelectedCustomerId(null); }} value={selectedVendorId || ''}>
                <SelectTrigger id="vendor-filter" className="w-[200px]"><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                <SelectContent>
                    {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        {(selectedCustomerId || selectedVendorId) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" /> Clear Filter
            </Button>
        )}
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
              {(selectedCustomerId || selectedVendorId) && <TableHead className="text-right">Balance</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactionsWithBalance.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={(selectedCustomerId || selectedVendorId) ? 6 : 5} className="h-24 text-center">
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
                    <TableCell className={cn("text-right font-mono", transaction.type === 'debit' && "text-red-500")}>
                        {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    <TableCell className={cn("text-right font-mono", transaction.type === 'credit' && "text-green-500")}>
                        {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                    </TableCell>
                    {(selectedCustomerId || selectedVendorId) && <TableCell className="text-right font-mono">{formatCurrency(transaction.balance)}</TableCell>}
                </TableRow>
                ))
            )}
          </TableBody>
           {(selectedCustomerId || selectedVendorId) && transactionsWithBalance.length > 0 && (
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Final Balance</TableCell>
                        <TableCell className={cn("text-right font-bold font-mono", runningBalance >= 0 ? "text-green-600" : "text-red-600")}>
                            {formatCurrency(runningBalance)}
                        </TableCell>
                    </TableRow>
                </TableFooter>
           )}
        </Table>
      </div>
    </>
  );
}
    
