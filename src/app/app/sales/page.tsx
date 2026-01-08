
"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { MoreHorizontal, Trash2, CheckCircle, FileText, Undo2, ArrowLeft, Printer, DollarSign, Edit } from "lucide-react";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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

function ChallanPrintView({ saleId, onBack, customers }: { saleId: string; onBack: () => void, customers: Customer[] }) {
    const { sales, loading } = useData();
    const sale = sales.find(s => s.id === saleId);
    const customer = sale ? customers.find(c => c.id === sale.customerId) : null;

    if (loading) {
        return <div className="p-10 text-center text-lg font-semibold">Loading challan...</div>;
    }

    if (!sale) {
        return <div className="p-10 text-center text-lg font-semibold">Challan not found.</div>;
    }

    return (
        <>
            <PageHeader title={`Challan: ${sale.id}`} description={`Delivery challan for ${sale.customerName}`}>
                <div className="flex flex-wrap gap-2 no-print">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sales List
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Challan
                    </Button>
                </div>
            </PageHeader>
            <div id="printable-area" className="bg-background text-foreground p-4 sm:p-8 font-sans text-sm rounded-lg border shadow-sm">
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
        </>
    )
}

function InvoiceView({ sale, customers, onBack }: { sale: Sale; customers: Customer[]; onBack: () => void }) {
    const customerForInvoice = customers.find(c => c.id === sale.customerId);
    const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<Sale | null>(null);
    const [viewingChallanId, setViewingChallanId] = useState<string | null>(null);
    const { addTransaction } = useData();
    const { toast } = useToast();

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
        setViewingChallanId(saleId);
    };

    const handleBackToSalesList = () => {
        setViewingChallanId(null);
    }
    
    const sales = useData().sales;

    if (viewingChallanId) {
        return <ChallanPrintView saleId={viewingChallanId} onBack={handleBackToSalesList} customers={customers}/>
    }
    
    return (
        <>
            <PageHeader
                title={`Invoice: ${sale.id}`}
                description={`Details for invoice sent to ${sale.customerName}`}
            >
                <div className="flex flex-wrap gap-2 no-print">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Sales List
                    </Button>
                    <Button onClick={() => window.print()}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                    <Button variant="outline" onClick={() => handlePrintChallan(sale.id)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Print Challan
                    </Button>
                    {sale.status === 'posted' && (
                        <Button variant="outline" onClick={() => setSelectedSaleForPayment(sale)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Receive Payment
                        </Button>
                    )}
                </div>
            </PageHeader>
            <div id="printable-area" className="bg-background text-foreground p-4 sm:p-8 font-sans text-sm rounded-lg border shadow-sm">
                <div className="flex justify-between items-start mb-8">
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
                        <p><span className="font-semibold text-muted-foreground">Status:</span> <Badge variant={sale.status === 'posted' ? 'default' : 'secondary'}>{sale.status}</Badge></p>
                    </div>
                    </div>
                </div>
                
                <div className="mb-8">
                    <h3 className="font-semibold text-muted-foreground mb-1">Bill To:</h3>
                    <p className="font-bold text-lg">{sale.customerName}</p>
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
                        <span>{formatCurrency(sale.items.reduce((acc, item) => acc + (item.feet || 1) * item.price * item.quantity, 0))}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Overall Discount ({sale.discount}%)</span>
                        <span>- {formatCurrency((sale.items.reduce((acc, item) => acc + (item.feet || 1) * item.price * item.quantity, 0)) * sale.discount / 100)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t-2 border-black dark:border-white pt-2 mt-2">
                        <span>Grand Total</span>
                        <span>{formatCurrency(sale.total)}</span>
                    </div>
                    </div>
                </div>
                
                <div className="mt-20 text-center text-xs text-gray-500 border-t pt-4">
                    <p>Thank you for your business!</p>
                </div>
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

export default function SalesPage() {
  const { customers, updateSale, deleteSale, postSale, unpostSale, loading: isDataLoading } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const transactionsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'transactions') : null, [firestore, shouldFetch]);

  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  const { data: transactionsData } = useCollection<Transaction>(transactionsCol);
  
  const sales = salesData || [];
  const transactions = transactionsData || [];
  
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [activeTab, setActiveTab] = useState("history");


  useEffect(() => {
      if (activeTab !== 'new') {
          setEditingSale(null);
      }
  }, [activeTab]);


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
        if (viewingSale?.id === saleId) {
            setViewingSale({ ...saleToPost, status: 'posted' });
        }
      }
  }

   const handleUnpostSale = (saleId: string) => {
      const saleToUnpost = sales.find(s => s.id === saleId);
      if(saleToUnpost) {
        unpostSale(saleToUnpost);
         if (viewingSale?.id === saleId) {
            setViewingSale({ ...saleToUnpost, status: 'draft' });
        }
      }
  }

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("new");
  };

  const handleSaleUpdated = () => {
    setEditingSale(null);
    setActiveTab("history");
  };


  if (viewingSale) {
    return <InvoiceView sale={viewingSale} customers={customers} onBack={() => setViewingSale(null)} />;
  }

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      >
      </PageHeader>
      
       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 no-print">
          <TabsTrigger value="history">Sales History</TabsTrigger>
          <TabsTrigger value="new" disabled>
            {editingSale ? "Edit Sale" : "New Sale"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history">
            <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto no-print">
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
                                <DropdownMenuItem onSelect={() => handleEditClick(sale)}>
                                    <Edit className="mr-2 h-4 w-4"/>
                                    Edit
                                </DropdownMenuItem>
                            )}
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
        </TabsContent>
         <TabsContent value="new">
            {/* The form will be rendered here when editingSale is not null */}
            {/* The logic for New/Edit form needs to be created or moved here */}
             <div className="mt-4">
                <p>To create a new sale, go to the "Estimates" page and create a sale from an estimate.</p>
                {editingSale && (
                     <p className="font-bold mt-4">Now editing Sale ID: {editingSale.id}. Please make your changes in the form below.</p>
                    /*
                    <NewSaleForm 
                        initialData={editingSale} 
                        onSaleUpdated={handleSaleUpdated}
                        onSaleAdded={() => {}} // Not needed for update
                    />
                    */
                )}
             </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
