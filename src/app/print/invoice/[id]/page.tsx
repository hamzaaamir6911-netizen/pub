"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { MoreHorizontal, Trash2, CheckCircle, FileText, Undo2, ArrowLeft, Printer, Edit, PlusCircle, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
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
import type { Sale, Transaction, Customer, SaleItem, Item } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, orderBy, query } from "firebase/firestore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";


function SaleDetailsView({ sale, customer, onClose }: { sale: Sale; customer: Customer | undefined; onClose: () => void }) {
    
    const handlePrint = (type: 'invoice' | 'challan') => {
        const printableArea = document.getElementById(type === 'invoice' ? 'printable-invoice' : 'printable-challan');
        if (printableArea) {
            const printContents = printableArea.innerHTML;
            const originalContents = document.body.innerHTML;

            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            // We need to reload to re-attach React components and event listeners
            window.location.reload();
        }
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
                <DialogHeader>
                    <DialogTitle>Details for Sale: {sale.id}</DialogTitle>
                    <div className="flex items-center gap-2 pt-4">
                        <Button variant="outline" onClick={() => handlePrint('invoice')}><Printer className="mr-2 h-4 w-4" /> Print Invoice</Button>
                        <Button variant="outline" onClick={() => handlePrint('challan')}><Printer className="mr-2 h-4 w-4" /> Print Challan</Button>
                    </div>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto">
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
                            <TableHeader><TableRow><TableHead className="font-bold">Description</TableHead><TableHead className="text-right font-bold">Qty</TableHead><TableHead className="text-right font-bold">Rate</TableHead><TableHead className="text-right font-bold">Amount</TableHead></TableRow></TableHeader>
                            <TableBody>
                            {sale.items.map((item, index) => {
                                const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                                return (<TableRow key={index}><TableCell className="font-medium">{item.itemName} <span className="text-gray-500">({item.thickness} - {item.color})</span></TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrency(item.price)}</TableCell><TableCell className="text-right font-medium">{formatCurrency(itemSubtotal)}</TableCell></TableRow>);
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
                    
                    {/* This is the printable area for the CHALLAN, hidden by default */}
                    <div id="printable-challan" className="hidden">
                        <div className="p-4 font-sans text-sm">
                            <div className="text-center mb-4">
                                <h1 className="text-xl font-extrabold font-headline">ARCO Aluminium Company</h1>
                                <p className="mt-1 text-lg font-extrabold">Delivery Challan</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="font-bold">Customer:</p>
                                    <p>{sale.customerName}</p>
                                    <p>{customer?.address}</p>
                                    <p>{customer?.phoneNumber}</p>
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
                </div>
            </DialogContent>
        </Dialog>
    );
}


function NewSaleForm({ onSaleAdded, onSaleUpdated, initialData, onDoneEditing }: { onSaleAdded: (newSale: Omit<Sale, 'id' | 'total' | 'status'>) => void, onSaleUpdated: (saleId: string, updatedSale: Omit<Sale, 'id' | 'total' | 'status'>) => void, initialData?: Sale | null, onDoneEditing: () => void }) {
    const { toast } = useToast();
    const { customers, items: allItems, addCustomer } = useData();
    
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [saleItems, setSaleItems] = useState<Partial<SaleItem>[]>([{itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: '' }]);
    const [overallDiscount, setOverallDiscount] = useState(0);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [saleDate, setSaleDate] = useState<Date | undefined>(new Date());

    const isEditMode = !!initialData;

    useEffect(() => {
        if (initialData) {
            setSelectedCustomer(initialData.customerId);
            setSaleItems(initialData.items.map(item => ({ ...item })));
            setOverallDiscount(initialData.discount || 0);
            setSaleDate(new Date(initialData.date));
        } else {
            clearForm();
        }
    }, [initialData]);


    const handleAddItem = () => {
        setSaleItems([...saleItems, {itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: '' }]);
    }

    const handleRemoveItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    }

    const handleItemChange = (index: number, key: keyof SaleItem, value: any) => {
        const newItems = [...saleItems];
        const currentItem = { ...newItems[index] };
        (currentItem as any)[key] = value;
        
        if (key === 'itemId') {
            const itemDetails = allItems.find(i => i.id === value);
            if (itemDetails) {
                currentItem.color = itemDetails.color;
                currentItem.thickness = itemDetails.thickness;
            }
        }

        newItems[index] = currentItem;
        setSaleItems(newItems);
    }

    const calculateTotal = () => {
        const subtotal = saleItems.reduce((total, currentItem) => {
            if (!currentItem.itemId) return total;
            const itemDetails = allItems.find(i => i.id === currentItem.itemId);
            if (!itemDetails) return total;

            const feet = currentItem.feet || 1;
            const itemTotal = feet * itemDetails.salePrice * (currentItem.quantity || 1);
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            
            return total + (itemTotal - discountAmount);
        }, 0);
        
        const overallDiscountAmount = (subtotal * overallDiscount) / 100;
        return subtotal - overallDiscountAmount;
    }

    const clearForm = () => {
        if (isEditMode) return; // Don't clear in edit mode
        setSelectedCustomer("");
        setSaleItems([{itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: ''}]);
        setOverallDiscount(0);
        setSaleDate(new Date());
    }
    
    const handleSave = async () => {
        if (!selectedCustomer) {
            toast({ variant: "destructive", title: "Please select a customer." });
            return;
        }
        if (!saleDate) {
            toast({ variant: "destructive", title: "Please select a sale date." });
            return;
        }
        if (saleItems.some(item => !item.itemId || (item.quantity || 0) <= 0)) {
            toast({ variant: "destructive", title: "Please fill all item details correctly." });
            return;
        }

        const customer = customers.find(c => c.id === selectedCustomer);
        if (!customer) return;

        const finalSaleItems = saleItems.map(si => {
            const item = allItems.find(i => i.id === si.itemId)!;
            
            let feet = si.feet || 1;
            if (item.category !== 'Aluminium') {
                feet = 1;
            }
            
            return {
                itemId: item.id,
                itemName: item.name,
                quantity: si.quantity || 1,
                price: item.salePrice,
                color: si.color || item.color,
                weight: item.weight,
                thickness: si.thickness || '',
                feet: feet,
                discount: si.discount || 0,
            }
        }) as SaleItem[];

        const saleData: Omit<Sale, 'id' | 'total' | 'status'> = {
            customerId: selectedCustomer,
            customerName: customer.customerName,
            items: finalSaleItems,
            discount: overallDiscount,
            date: saleDate,
        };

        if (isEditMode && initialData) {
            await onSaleUpdated(initialData.id, saleData);
            toast({ title: "Sale Updated!", description: `Sale ${initialData.id} has been updated.` });
        } else {
            await onSaleAdded(saleData);
            toast({ title: "Sale Draft Saved!", description: `Sale has been saved as a draft.` });
            clearForm();
        }
        onDoneEditing();
    }
    
    const handleCustomerAdded = async (newCustomer: Omit<Customer, 'id'| 'createdAt'>) => {
        const addedCustomer = await addCustomer(newCustomer);
        if (addedCustomer?.id) {
            setSelectedCustomer(addedCustomer.id);
        }
        setCustomerModalOpen(false);
    }

    return (
        <>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{isEditMode ? `Edit Sale ${initialData.id}` : 'Create New Sale'}</CardTitle>
                 <Button variant="ghost" size="icon" onClick={clearForm} disabled={isEditMode}>
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only">Clear Form</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <div className="flex gap-2">
                        <Select onValueChange={setSelectedCustomer} value={selectedCustomer}>
                            <SelectTrigger id="customer">
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Dialog open={isCustomerModalOpen} onOpenChange={setCustomerModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon"><PlusCircle className="h-4 w-4" /></Button>
                            </DialogTrigger>
                             <AddCustomerForm onCustomerAdded={handleCustomerAdded} />
                        </Dialog>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="date">Sale Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !saleDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {saleDate ? format(saleDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={saleDate}
                                    onSelect={setSaleDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discount">Overall Discount (%)</Label>
                        <Input 
                            id="discount"
                            type="number"
                            placeholder="e.g. 5"
                            value={overallDiscount}
                            onChange={(e) => setOverallDiscount(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label>Items</Label>
                    {saleItems.map((saleItem, index) => {
                         const itemDetails = allItems.find(i => i.id === saleItem.itemId);
                         return (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-2 items-end p-3 border rounded-md">
                            <div className="md:col-span-2 space-y-2">
                                <Label>Item</Label>
                                <Select onValueChange={(value) => handleItemChange(index, "itemId", value)} value={saleItem.itemId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} {i.thickness ? `(${i.thickness})` : ''} - {i.color}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Colour</Label>
                                <Select onValueChange={(value) => handleItemChange(index, "color", value)} value={saleItem.color}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="9016">9016</SelectItem>
                                        <SelectItem value="Black">Black</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                             <div className="space-y-2">
                                <Label>Thickness</Label>
                                <Input 
                                    placeholder="e.g. 1.2mm" 
                                    value={saleItem.thickness}
                                    onChange={(e) => handleItemChange(index, "thickness", e.target.value)}
                                />
                            </div>

                            {itemDetails?.category === "Aluminium" ? (
                                <div className="space-y-2">
                                    <Label>Feet</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="e.g. 12.5" 
                                        value={saleItem.feet}
                                        onChange={(e) => handleItemChange(index, "feet", parseFloat(e.target.value))}
                                    />
                                </div>
                            ) : <div className="md:col-span-1"/> }
                           
                            <div className="space-y-2">
                                <Label>Discount (%)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="%" 
                                    value={saleItem.discount}
                                    onChange={(e) => handleItemChange(index, "discount", parseInt(e.target.value) || 0)}
                                    min="0"
                                />
                            </div>
                            <div className="flex gap-2 items-end">
                                <div className="flex-grow space-y-2">
                                    <Label>Qty</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="Qty" 
                                        value={saleItem.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)}
                                        min="1"
                                    />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={saleItems.length === 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                         )
                    })}
                    <Button variant="outline" size="sm" onClick={handleAddItem}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
                <div className="text-xl font-bold">
                    Total: {formatCurrency(calculateTotal())}
                </div>
                <Button onClick={handleSave}>{isEditMode ? 'Update Sale' : 'Save Draft'}</Button>
            </CardFooter>
        </Card>
        </>
    )
}

function AddCustomerForm({ onCustomerAdded }: { onCustomerAdded: (newCustomer: Omit<Customer, 'id' | 'createdAt'>) => void }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [balanceType, setBalanceType] = useState<'debit' | 'credit'>('debit');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!customerName || !phoneNumber || !address) {
      toast({ variant: 'destructive', title: 'Please fill all fields.' });
      return;
    }
    const newCustomer: Omit<Customer, 'id' | 'createdAt'> = {
      customerName,
      phoneNumber,
      address,
      openingBalance,
      balanceType
    };
    await onCustomerAdded(newCustomer);
    toast({ title: 'Customer Added!', description: `${customerName} has been added.` });
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
    setOpeningBalance(0);
    setBalanceType('debit');
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Customer</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name</Label>
          <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="0300-1234567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123, Main Street, City" />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input id="openingBalance" type="number" value={openingBalance} onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="balanceType">Balance Type</Label>
                <Select onValueChange={(v: 'debit' | 'credit') => setBalanceType(v)} value={balanceType}>
                    <SelectTrigger id="balanceType">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="debit">Debit (Owed by Customer)</SelectItem>
                        <SelectItem value="credit">Credit (Paid by Customer)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Add Customer</Button>
      </DialogFooter>
    </DialogContent>
  );
}


export default function SalesPage() {
  const { customers, updateSale, deleteSale, postSale, unpostSale, loading: isDataLoading, addTransaction, addSale } = useData();
  const firestore = useFirestore();
  const { user } = useUser();
  const shouldFetch = !!user;

  const salesCol = useMemoFirebase(() => shouldFetch ? query(collection(firestore, 'sales'), orderBy('date', 'desc')) : null, [firestore, shouldFetch]);
  const transactionsCol = useMemoFirebase(() => shouldFetch ? collection(firestore, 'transactions') : null, [firestore, shouldFetch]);

  const { data: salesData, isLoading: isSalesLoading } = useCollection<Sale>(salesCol);
  const { data: transactionsData } = useCollection<Transaction>(transactionsCol);
  
  const sales = salesData || [];
  const transactions = transactionsData || [];
  
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
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

  const handleSaleAdded = (newSale: Omit<Sale, 'id' | 'total' | 'status'>) => {
    addSale(newSale);
    setActiveTab("history");
  }

  const handleSaleUpdated = (saleId: string, updatedSale: Omit<Sale, 'id' | 'total' | 'status'>) => {
    updateSale(saleId, updatedSale);
    setActiveTab("history");
    setEditingSale(null);
  };

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      >
      </PageHeader>
      
       <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="history">Sales History</TabsTrigger>
          <TabsTrigger value="new">
            {editingSale ? "Edit Sale" : "New Sale"}
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
                    onSaleUpdated={handleSaleUpdated}
                    onSaleAdded={handleSaleAdded}
                    onDoneEditing={() => setActiveTab('history')}
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