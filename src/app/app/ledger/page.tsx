
"use client";

import { useState, useMemo } from "react";
import { X, MoreHorizontal, Printer, Edit, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import type { Transaction } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useData } from "@/firebase/data/data-provider";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";


export default function LedgerPage() {
  const { transactions, deleteTransaction, customers, vendors } = useData();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    // Check if the transaction is linked to a system process that shouldn't be deleted from here
    const transaction = transactions.find(t => t.id === id);
    if (transaction && ['Sale', 'Opening Balance', 'Salary'].includes(transaction.category)) {
      toast({
        variant: 'destructive',
        title: 'Deletion Not Allowed',
        description: 'System-generated transactions (like Sales or Opening Balances) cannot be deleted from the ledger directly.',
      });
      return;
    }
    deleteTransaction(id);
    toast({ title: "Transaction Deleted" });
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedCustomerId) {
        filtered = transactions.filter(t => t.customerId === selectedCustomerId);
    } else if (selectedVendorId) { // Use else if to make filters mutually exclusive
        filtered = transactions.filter(t => t.vendorId === selectedVendorId);
    }
    // Correct sorting: oldest to newest for chronological order
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedCustomerId, selectedVendorId]);

  let runningBalance = 0;
  const transactionsWithBalance = filteredTransactions.map(t => {
      if (selectedCustomerId) {
        // Customer perspective: debit increases their due, credit decreases it.
        runningBalance += (t.type === 'debit' ? t.amount : -t.amount);
      } else if (selectedVendorId) {
        // Vendor perspective: credit increases what we owe them, debit decreases it.
         runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
      } else {
        // General cash ledger: credit is cash in, debit is cash out.
        runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
      }
      return { ...t, balance: runningBalance };
  });

  const clearFilters = () => {
    setSelectedCustomerId(null);
    setSelectedVendorId(null);
  }

  const hasFilter = selectedCustomerId || selectedVendorId;

  return (
    <>
      <PageHeader
        title="Ledger"
        description="A record of all financial transactions."
      >
        <div className="flex items-center gap-2 no-print">
            <Button variant="outline" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print Page
            </Button>
            {/* "Add Voucher" button has been removed as per the request */}
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
                          <DropdownMenuItem
                            onSelect={() => handleDelete(transaction.id)}
                            className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                            disabled={['Sale', 'Opening Balance', 'Salary'].includes(transaction.category)}
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
