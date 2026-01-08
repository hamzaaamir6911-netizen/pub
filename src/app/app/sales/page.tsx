
"use client";

import { useState, useMemo, useEffect } from "react";
import { MoreHorizontal, Trash2, Edit, Printer, PlusCircle } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Transaction } from "@/lib/types";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewSaleForm } from "./_components/new-sale-form";


export default function SalesPage() {
  const { deleteSale, loading: isDataLoading } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  
  const sales = salesData || [];
  
  const [activeTab, setActiveTab] = useState("history");
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
    const transactions: Transaction[] = []; // Placeholder, can be removed if not needed by deleteSale
    deleteSale(sale, transactions);
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("new");
  };

  const handleFormSuccess = () => {
    setActiveTab("history");
    setEditingSale(null); // Clear editing state on success
  };

  const handlePrint = (type: 'invoice' | 'challan', saleId: string) => {
    window.open(`/app/print/${type}/${saleId}`, '_blank');
  };

  // When switching back to the history tab, always clear the editing state
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
            {editingSale ? `Edit Sale: ${editingSale.id}` : 'New Sale'}
          </TabsTrigger>
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
                               <DropdownMenuItem onSelect={() => handlePrint('challan', sale.id)}>
                                  <Printer className="mr-2 h-4 w-4"/>
                                  Print Challan
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handlePrint('invoice', sale.id)}>
                                  <Printer className="mr-2 h-4 w-4"/>
                                  Print Invoice
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
                  initialData={editingSale} 
                  onSuccess={handleFormSuccess}
              />
            </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
