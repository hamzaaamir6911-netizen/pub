
"use client";

import { useState, useMemo, useEffect } from "react";
import { MoreHorizontal, Trash2, CheckCircle, FileText, Undo2, Edit, Printer } from "lucide-react";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Transaction, Customer } from "@/lib/types";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewSaleForm } from "./_components/new-sale-form";


function SaleDetailsView({ sale, customer, onClose }: { sale: Sale; customer: Customer | undefined; onClose: () => void }) {
    
    const handlePrint = (type: 'invoice' | 'challan') => {
        document.body.setAttribute('data-print-view', type);
        window.print();
        document.body.removeAttribute('data-print-view');
    };

    const subtotal = sale.items.reduce((acc, item) => {
        const itemTotal = (item.feet || 1) * item.price * item.quantity;
        const discountAmount = itemTotal * ((item.discount || 0) / 100);
        return acc + (itemTotal - discountAmount);
    }, 0);
    const overallDiscountAmount = (subtotal * sale.discount) / 100;
    const grandTotal = subtotal - overallDiscountAmount;

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader className="no-print">
                    <DialogTitle>Details for Sale: {sale.id}</DialogTitle>
                    <div className="flex items-center gap-2 pt-4">
                        <Button variant="outline" onClick={() => handlePrint('invoice')}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
                        <Button variant="outline" onClick={() => handlePrint('challan')}><Printer className="mr-2 h-4 w-4" /> Print Challan</Button>
                    </div>
                </DialogHeader>

                <div id="printable-area" className="flex-grow overflow-y-auto">
                    {/* This is the printable area for the INVOICE */}
                    <div id="printable-invoice" className="p-6 font-sans">
                         <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold font-headline mb-1">ARCO Aluminium Company</h1>
                            <h2 className="text-2xl font-semibold">INVOICE</h2>
                            <p className="text-muted-foreground">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="font-semibold text-muted-foreground mb-1">Bill To:</h3>
                                <p className="font-bold text-lg">{sale.customerName}</p>
                                {customer?.address && <p>{customer.address}</p>}
                                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                            </div>
                            <div className="text-right">
                                <p><span className="font-semibold text-muted-foreground">Invoice #:</span> {sale.id}</p>
                                <p><span className="font-semibold text-muted-foreground">Date:</span> {formatDate(sale.date)}</p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader><TableRow><TableHead className="font-bold">Description</TableHead><TableHead className="text-right font-bold">Feet</TableHead><TableHead className="text-right font-bold">Qty</TableHead><TableHead className="text-right font-bold">Rate</TableHead><TableHead className="text-right font-bold">Amount</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {sale.items.map((item, index) => {
                                const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                                return (<TableRow key={index}><TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.thickness} - {item.color})</span></TableCell><TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrency(item.price)}</TableCell><TableCell className="text-right font-medium">{formatCurrency(itemSubtotal)}</TableCell></TableRow>);
                            })}
                            </TableBody>
                        </Table>
                         <div className="flex justify-end mt-6">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Overall Discount ({sale.discount}%)</span><span>- {formatCurrency(overallDiscountAmount)}</span></div>
                                <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2 mt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* This is the printable area for the CHALLAN */}
                    <div id="printable-challan" className="p-4 font-sans text-sm">
                        <div className="text-center mb-4">
                            <h1 className="text-xl font-extrabold font-headline">ARCO Aluminium Company</h1>
                            <p className="mt-1 text-lg font-extrabold">Delivery Challan</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="font-bold">Customer:</p>
                                <p>{sale.customerName}</p>
                                {customer?.address && <p>{customer.address}</p>}
                                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                            </div>
                            <div className="text-right">
                                <p className="font-bold">Challan No: <span className="font-normal">{sale.id}</span></p>
                                <p className="font-bold">Date: <span className="font-normal">{formatDate(sale.date)}</span></p>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Item</TableHead>
                                    <TableHead>Colour</TableHead>
                                    <TableHead>Thickness</TableHead>
                                    <TableHead className="text-right">Feet</TableHead>
                                    <TableHead className="text-right">Quantity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sale.items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.itemName}</TableCell>
                                        <TableCell>{item.color}</TableCell>
                                        <TableCell>{item.thickness || '-'}</TableCell>
                                        <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <div className="mt-16 grid grid-cols-2 gap-4 text-center text-sm">
                            <div className="border-t-2 border-black pt-2 font-bold"><p>Receiver's Signature</p></div>
                            <div className="border-t-2 border-black pt-2 font-bold"><p>Driver's Signature</p></div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function SalesPage() {
  const { customers, deleteSale, postSale, unpostSale, loading: isDataLoading } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  
  const sales = salesData || [];
  
  const [activeTab, setActiveTab] = useState("history");
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const sortedSales = useMemo(() => {
    if (!sales) return [];
    return [...sales].sort((a, b) => {
        const numA = parseInt(a.id.split('-')[1] || '0', 10);
        const numB = parseInt(b.id.split('-')[1] || '0', 10);
        return numB - numA; 
    });
  }, [sales]);
  
  const handleDelete = (sale: Sale) => {
    const transactions: Transaction[] = []; // Placeholder for now
    deleteSale(sale, transactions);
  };

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

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("new");
  };

  const handleFormSuccess = () => {
    setEditingSale(null);
    setActiveTab("history");
  }

  useEffect(() => {
    if (activeTab === "history") {
      setEditingSale(null);
    }
  }, [activeTab]);

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Sales History</TabsTrigger>
          <TabsTrigger value="new">
            {editingSale ? 'Edit Sale' : 'New Sale'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div className="rounded-lg border shadow-sm mt-8 overflow-x-auto">
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
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleEditClick(sale)} disabled={sale.status === 'posted'}>
                                <Edit className="mr-2 h-4 w-4"/>
                                Edit
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
                            <DropdownMenuSeparator />
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
            <div className="mt-4">
              <NewSaleForm 
                  initialData={editingSale} 
                  onSuccess={handleFormSuccess}
              />
            </div>
        </TabsContent>
      </Tabs>


      {viewingSale && (
          <SaleDetailsView 
            sale={viewingSale}
            customer={customers.find(c => c.id === viewingSale.customerId)}
            onClose={() => setViewingSale(null)}
          />
      )}
    </>
  );
}
