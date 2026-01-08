
"use client";

import { useState, useMemo } from "react";
import { MoreHorizontal, Trash2, Edit, Printer, PlusCircle, FileText } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Customer } from "@/lib/types";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { NewSaleForm } from "./_components/new-sale-form";


function SaleDetailsView({ sale }: { sale: Sale }) {
    const { customers } = useData();
    const customer = customers.find(c => c.id === sale.customerId);

    const handlePrint = (view: 'invoice' | 'challan') => {
        document.body.setAttribute('data-print-view', view);
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
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
             <DialogHeader className="flex-shrink-0 no-print">
                 <div className="flex items-center justify-between">
                    <DialogTitle>Sale Details: {sale.id}</DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handlePrint('invoice')}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Invoice
                        </Button>
                         <Button variant="outline" onClick={() => handlePrint('challan')}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Challan
                        </Button>
                    </div>
                </div>
            </DialogHeader>

            <div id="printable-area" className="flex-grow bg-gray-50 overflow-visible">
                {/* INVOICE VIEW - default */}
                <div id="printable-invoice" className="p-8 bg-white text-black">
                     <div className="flex justify-between items-start mb-10">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">ARCO Aluminium Company</h1>
                            <p className="text-sm text-gray-500">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                            <p className="text-sm text-gray-500">+92 333 4646356</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-semibold uppercase text-gray-500">Invoice</h2>
                            <div className="grid grid-cols-2 gap-x-4 mt-2 text-sm">
                                <span className="font-semibold text-gray-600">Date:</span>
                                <span>{formatDate(sale.date)}</span>
                                <span className="font-semibold text-gray-600">Invoice #:</span>
                                <span>{sale.id}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="bg-teal-600 text-white font-bold text-sm uppercase px-4 py-2 rounded-md inline-block">From</div>
                            <div className="text-sm text-gray-700">
                                <p className="font-bold">ARCO Aluminium Company</p>
                                <p>B-5, PLOT 59, Industrial Estate,</p>
                                <p>Hayatabad, Peshawar</p>
                                <p>+92 333 4646356</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                             <div className="bg-teal-600 text-white font-bold text-sm uppercase px-4 py-2 rounded-md inline-block">To</div>
                            <div className="text-sm text-gray-700">
                                <p className="font-bold">{sale.customerName}</p>
                                {customer?.address && <p>{customer.address}</p>}
                                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                            </div>
                        </div>
                    </div>


                    <Table className="text-sm">
                        <TableHeader>
                            <TableRow className="bg-teal-600 hover:bg-teal-700">
                                <TableHead className="font-bold text-white uppercase w-[50%]">Description</TableHead>
                                <TableHead className="text-right font-bold text-white uppercase">Qty</TableHead>
                                <TableHead className="text-right font-bold text-white uppercase">Rate</TableHead>
                                <TableHead className="text-right font-bold text-white uppercase">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {sale.items.map((item, index) => {
                            const itemTotal = (item.feet || 1) * item.price * item.quantity;
                            return (
                            <TableRow key={index} className="border-gray-200">
                                <TableCell className="font-medium text-gray-800">
                                    {item.itemName}
                                    <span className="text-gray-500 text-xs block">
                                        {item.thickness} - {item.color} {item.feet ? `| ${item.feet.toFixed(2)} ft` : ''}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right text-gray-600">{item.quantity}</TableCell>
                                <TableCell className="text-right text-gray-600">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right font-medium text-gray-800">{formatCurrency(itemTotal)}</TableCell>
                            </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between items-start mt-8">
                         <div className="w-1/2">
                            <div className="bg-teal-600 text-white font-bold text-sm uppercase px-4 py-2 rounded-md inline-block">Notes</div>
                            <p className="text-xs text-gray-500 mt-4">
                                Thank you for your business. Please contact us for any queries regarding this invoice.
                            </p>
                        </div>
                        <div className="w-full max-w-xs space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600"><span >Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                            <div className="flex justify-between text-gray-600"><span>Overall Discount ({sale.discount}%)</span><span>- {formatCurrency(overallDiscountAmount)}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t-2 border-gray-800 pt-2 mt-2"><span>Grand Total</span><span>{formatCurrency(grandTotal)}</span></div>
                        </div>
                    </div>
                </div>

                {/* CHALLAN VIEW - hidden by default */}
                <div id="printable-challan" className="p-8 bg-white text-black">
                     <div>
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold font-headline">ARCO Aluminium Company</h1>
                            <p className="mt-1 text-lg font-bold">Delivery Challan</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <p className="font-semibold">Customer:</p>
                                <p>{sale.customerName}</p>
                                {customer?.address && <p>{customer.address}</p>}
                                {customer?.phoneNumber && <p>{customer.phoneNumber}</p>}
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Challan No: <span className="font-normal">{sale.id}</span></p>
                                <p className="font-semibold">Date: <span className="font-normal">{formatDate(sale.date)}</span></p>
                            </div>
                        </div>
                        <Table className="text-sm">
                            <TableHeader>
                                <TableRow className="bg-gray-100">
                                    <TableHead className="w-[40%] font-bold text-black">Item</TableHead>
                                    <TableHead className="font-bold text-black">Colour</TableHead>
                                    <TableHead className="font-bold text-black">Thickness</TableHead>
                                    <TableHead className="text-right font-bold text-black">Feet</TableHead>
                                    <TableHead className="text-right font-bold text-black">Quantity</TableHead>
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
                         <div className="mt-24 grid grid-cols-2 gap-8 text-sm">
                            <div className="border-t-2 border-black pt-2 font-semibold text-center"><p>Receiver's Signature</p></div>
                            <div className="border-t-2 border-black pt-2 font-semibold text-center"><p>Driver's Signature</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </DialogContent>
    )
}


export default function SalesPage() {
  const { deleteSale, loading: isDataLoading } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  
  const sales = salesData || [];
  
  const [activeTab, setActiveTab] = useState("history");
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const sortedSales = useMemo(() => {
    if (!sales) return [];
    return [...sales].sort((a, b) => {
        const numA = parseInt(a.id.split('-')[1] || '0', 10);
        const numB = parseInt(b.id.split('-')[1] || '0', 10);
        return numB - numA; 
    });
  }, [sales]);
  
  const handleDelete = (sale: Sale) => {
    deleteSale(sale, []);
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("new");
  };
  
  const handleViewDetails = (sale: Sale) => {
      setSelectedSale(sale);
      setDetailsOpen(true);
  }
  
  const handleFormSuccess = () => {
    setActiveTab("history");
    setEditingSale(null); // Clear editing state
  }

  const handleCancelEdit = () => {
    setActiveTab("history");
    setEditingSale(null);
  }

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Sales History</TabsTrigger>
          <TabsTrigger value="new">{editingSale ? 'Edit Sale' : 'New Sale'}</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto">
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
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DropdownMenuItem onSelect={() => handleViewDetails(sale)}>
                                  <FileText className="mr-2 h-4 w-4"/>
                                  View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleEditClick(sale)} disabled={sale.status === 'posted'}>
                                  <Edit className="mr-2 h-4 w-4"/>
                                  Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                               <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the sale record {sale.id}. If the sale is 'posted', its corresponding ledger entry will also be removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(sale)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                       </AlertDialog>
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
                    key={editingSale?.id || 'new'}
                    initialData={editingSale} 
                    onSaleAdded={handleFormSuccess}
                    onSaleUpdated={handleFormSuccess}
                    onCancel={handleCancelEdit}
                />
            </div>
        </TabsContent>
      </Tabs>

      {/* Details View Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
          {selectedSale && <SaleDetailsView sale={selectedSale} />}
      </Dialog>
    </>
  );
}
