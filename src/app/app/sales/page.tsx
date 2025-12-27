
"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Trash2, RotateCcw, FileText, CheckCircle, Edit, Calendar as CalendarIcon, Undo2, Printer } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { Sale, SaleItem, Customer, Item } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";


function SaleInvoice({ sale, onPost, onUnpost }: { sale: Sale, onPost: (saleId: string) => void, onUnpost: (saleId: string) => void }) {
    const { customers } = useData();
    const customer = customers.find(c => c.id === sale.customerId);
    const { toast } = useToast();
    
    let runningTotal = 0;

    const handlePost = () => {
        onPost(sale.id);
        toast({ title: 'Sale Posted!', description: `Sale ${sale.id} has been posted to the ledger.`});
    }

    const handleUnpost = () => {
        onUnpost(sale.id);
        toast({ variant: 'destructive', title: 'Sale Unposted!', description: `Sale ${sale.id} has been reverted to draft.`});
    }

    return (
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 no-print">
                <div className="flex flex-col items-center justify-center pt-4">
                    <DialogTitle>Sale Invoice: {sale.id}</DialogTitle>
                </div>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto" id="printable-invoice">
                 <div className="p-6">
                    <div className="text-center mb-8">
                      <h1 className="text-5xl font-bold" style={{fontFamily: 'serif'}}>ARCO</h1>
                      <p className="text-lg font-semibold tracking-widest">AR ALUMINIUM COMPANY</p>
                      <p className="mt-4">Sale Invoice: {sale.id}</p>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="font-semibold">Customer:</p>
                                <p>{sale.customerName}</p>
                                <p>{customer?.address}</p>
                                <p>{customer?.phoneNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Date:</p>
                                <p>{formatDate(sale.date)}</p>
                                <p className="font-semibold mt-2">Status:</p>
                                <Badge variant={sale.status === 'posted' ? 'default' : 'secondary'}>{sale.status}</Badge>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead>Colour</TableHead>
                                        <TableHead>Thickness</TableHead>
                                        <TableHead className="text-right">Feet</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Discount</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sale.items.map((item, index) => {
                                        const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                                        const discountAmount = itemSubtotal * ((item.discount || 0) / 100);
                                        const finalAmount = itemSubtotal - discountAmount;
                                        runningTotal += finalAmount;
                                        
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{item.itemName}</TableCell>
                                                <TableCell>{item.color}</TableCell>
                                                <TableCell>{item.thickness || '-'}</TableCell>
                                                <TableCell className="text-right">{item.feet ? item.feet.toFixed(2) : '-'}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                <TableCell className="text-right">{item.discount || 0}%</TableCell>
                                                <TableCell className="text-right">{formatCurrency(finalAmount)}</TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <div className="w-80 space-y-2">
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(sale.total)}</span>
                                </div>
                            </div>
                        </div>

                         <div className="mt-24 text-center text-xs text-gray-500 border-t pt-4">
                            <p className="font-semibold">Industrial Estate, Hayatabad Road B-5 PLOT 59 PESHAWAR</p>
                            <p className="font-semibold">Phone: +923334646356</p>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter className="mt-4 flex-shrink-0 no-print">
                 <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
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

function AddCustomerForm({ onCustomerAdded }: { onCustomerAdded: (newCustomer: Omit<Customer, 'id' | 'createdAt'>) => void }) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
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
    };
    await onCustomerAdded(newCustomer);
    toast({ title: 'Customer Added!', description: `${customerName} has been added.` });
    setCustomerName('');
    setPhoneNumber('');
    setAddress('');
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
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Add Customer</Button>
      </DialogFooter>
    </DialogContent>
  );
}


function NewSaleForm({ onSaleAdded, onSaleUpdated, initialData }: { onSaleAdded: (newSale: Omit<Sale, 'id' | 'total' | 'status'>) => void, onSaleUpdated: (saleId: string, updatedSale: Omit<Sale, 'id' | 'total' | 'status'>) => void, initialData?: Sale | null }) {
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
                                        {allItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name} ({i.color})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Colour</Label>
                                <Input 
                                    placeholder="e.g. White" 
                                    value={saleItem.color}
                                    onChange={(e) => handleItemChange(index, "color", e.target.value)}
                                />
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

export default function SalesPage() {
  const { sales, addSale, updateSale, deleteSale, postSale, unpostSale } = useData();
  const [activeTab, setActiveTab] = useState("history");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const handleDelete = (id: string) => {
    deleteSale(id);
  };
  
  const handleSaleAdded = (newSale: Omit<Sale, 'id' |'total'|'status'>) => {
    addSale(newSale);
    setActiveTab("history");
  }

  const handleSaleUpdated = (saleId: string, updatedSale: Omit<Sale, 'id'|'total'|'status'>) => {
    updateSale(saleId, updatedSale);
    setActiveTab("history");
    setEditingSale(null);
  }

  const handlePostSale = (saleId: string) => {
      postSale(saleId);
      // Close the dialog by resetting the selected sale
      setSelectedSale(null);
  }

   const handleUnpostSale = (saleId: string) => {
      unpostSale(saleId);
      // Close the dialog
      setSelectedSale(null);
  }

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setActiveTab("new");
  }
  
  useEffect(() => {
      // If we switch away from the 'new' tab, clear any editing state.
      if (activeTab !== 'new') {
          setEditingSale(null);
      }
  }, [activeTab]);

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="printable-area">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 no-print">
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
                  <TableHead className="no-print">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No sales recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
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
                      <TableCell className="no-print">
                        <Dialog onOpenChange={(open) => !open && setSelectedSale(null)}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                               <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={() => setSelectedSale(sale)}>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem
                                onSelect={() => handleEditClick(sale)}
                                disabled={sale.status === 'posted'}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => handleDelete(sale.id)}
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {selectedSale && selectedSale.id === sale.id && (
                              <SaleInvoice sale={selectedSale} onPost={handlePostSale} onUnpost={handleUnpostSale} />
                          )}
                        </Dialog>
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
                    onSaleAdded={handleSaleAdded} 
                    onSaleUpdated={handleSaleUpdated}
                    initialData={editingSale} 
                />
            </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

    