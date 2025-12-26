
"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
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
  const { transactions, addTransaction } = useDataContext();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleTransactionAdded = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    addTransaction(newTransaction);
    setModalOpen(false);
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
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No transactions yet.</TableCell>
                </TableRow>
            ) : (
                transactions.map((transaction) => (
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
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

    