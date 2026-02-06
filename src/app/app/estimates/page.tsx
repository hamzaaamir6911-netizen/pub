

"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, PlusCircle, Trash2, RotateCcw, FileText, Printer, ShoppingCart } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Estimate, SaleItem, Customer, Item } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { cn } from "@/lib/utils";

function EstimatePrint({ estimate }: { estimate: Estimate }) {
    const { customersMap } = useData();
    const customer = customersMap.get(estimate.customerId);
    
    let subtotal = 0;
    
    const handlePrint = () => {
      document.body.classList.add('printing-now');
      window.print();
      document.body.classList.remove('printing-now');
    };


    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
             <DialogHeader className="flex-shrink-0 no-print">
                <div className="flex flex-col items-center justify-center pt-4">
                    <DialogTitle>Estimate: {estimate.id}</DialogTitle>
                </div>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto bg-gray-100 p-4 printable-area">
                 <div className="p-8 bg-white shadow-lg rounded-sm text-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">ARCO Aluminium Company</h1>
                            <p className="text-gray-500">B-5, PLOT 59, Industrial Estate, Hayatabad, Peshawar</p>
                            <p className="text-gray-500">+92 333 4646356</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold uppercase text-gray-800">Estimate</h2>
                            <div className="grid grid-cols-2 gap-x-2 mt-2">
                                <span className="font-semibold">Estimate #:</span>
                                <span>{estimate.id}</span>
                                <span className="font-semibold">Date:</span>
                                <span>{formatDate(estimate.date)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-8">
                        <p className="font-semibold text-gray-700 mb-1">TO:</p>
                        <p className="font-bold text-gray-900">{estimate.customerName}</p>
                        <p className="text-gray-600">{customer?.address}</p>
                        <p className="text-gray-600">{customer?.phoneNumber}</p>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto mb-8">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="px-4 py-2 font-bold text-gray-600">ITEM</TableHead>
                                    <TableHead className="px-4 py-2 text-right font-bold text-gray-600">QTY</TableHead>
                                    <TableHead className="px-4 py-2 text-right font-bold text-gray-600">RATE</TableHead>
                                    <TableHead className="px-4 py-2 text-right font-bold text-gray-600">AMOUNT</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {estimate.items.map((item, index) => {
                                    const itemSubtotal = (item.feet || 1) * item.price * item.quantity;
                                    const discountAmount = itemSubtotal * ((item.discount || 0) / 100);
                                    const finalAmount = itemSubtotal - discountAmount;
                                    subtotal += finalAmount;
                                    
                                    return (
                                        <TableRow key={index} className="border-b">
                                            <TableCell className="px-4 py-2 font-medium text-gray-800">
                                                {item.itemName}
                                                <span className="text-gray-500 text-xs block">
                                                    {item.thickness} - {item.color} {item.feet ? `| ${item.feet.toFixed(2)} ft` : ''}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-right text-gray-600">{item.quantity}</TableCell>
                                            <TableCell className="px-4 py-2 text-right text-gray-600">{formatCurrency(item.price)}</TableCell>
                                            <TableCell className="px-4 py-2 text-right font-medium text-gray-800">{formatCurrency(finalAmount)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                             <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-800">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Overall Discount ({estimate.discount}%)</span>
                                <span className="text-gray-800">- {formatCurrency(subtotal * (estimate.discount / 100))}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>Total</span>
                                <span>{formatCurrency(estimate.total)}</span>
                            </div>
                        </div>
                    </div>

                     {/* Footer */}
                    <div className="mt-12 text-center text-xs text-gray-400 border-t pt-4">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
            
            <DialogFooter className="mt-4 flex-shrink-0 no-print">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save PDF
                </Button>
            </DialogFooter>
        </DialogContent>
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
      balanceType,
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


function NewEstimateForm({ onEstimateAdded }: { onEstimateAdded: (newEstimate: Omit<Estimate, 'id' | 'date' | 'total'>) => void }) {
    const { toast } = useToast();
    const { customers, items: allItems, itemsMap, customersMap, addCustomer, rateListNames } = useData();
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [selectedRateList, setSelectedRateList] = useState("default");
    const [saleItems, setSaleItems] = useState<Partial<SaleItem>[]>([{itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: '', price: 0 }]);
    const [overallDiscount, setOverallDiscount] = useState(0);
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);

    useEffect(() => {
        setSaleItems(currentItems => currentItems.map(si => {
            if (!si.itemId) return si;
            const itemDetails = itemsMap.get(si.itemId);
            if (!itemDetails) return si;

            const newPrice = selectedRateList === 'default'
                ? itemDetails.salePrice
                : itemDetails.salePrices?.[selectedRateList] || itemDetails.salePrice;
            
            return { ...si, price: newPrice };
        }));
    }, [selectedRateList, itemsMap]);

    const handleAddItem = () => {
        setSaleItems([...saleItems, {itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: '', price: 0 }]);
    }

    const handleRemoveItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    }

    const handleItemChange = (index: number, key: keyof SaleItem, value: any) => {
        const newItems = [...saleItems];
        const currentItem = { ...newItems[index] };
        (currentItem as any)[key] = value;
        
        if (key === 'itemId') {
            const itemDetails = itemsMap.get(value);
            if (itemDetails) {
                currentItem.color = itemDetails.color;
                currentItem.thickness = itemDetails.thickness;
                currentItem.price = selectedRateList === 'default'
                    ? itemDetails.salePrice
                    : itemDetails.salePrices?.[selectedRateList] || itemDetails.salePrice;
            }
        }

        newItems[index] = currentItem;
        setSaleItems(newItems);
    }

    const calculateTotal = () => {
        const subtotal = saleItems.reduce((total, currentItem) => {
            if (!currentItem.itemId || currentItem.price === undefined) return total;
            
            const itemDetails = itemsMap.get(currentItem.itemId);
            if (!itemDetails) return total;

            let feet = currentItem.feet || 1;
            if (itemDetails.category !== 'Aluminium') {
                feet = 1;
            }
            
            const itemTotal = feet * currentItem.price * (currentItem.quantity || 1);
            const discountAmount = itemTotal * ((currentItem.discount || 0) / 100);
            
            return total + (itemTotal - discountAmount);
        }, 0);
        
        const overallDiscountAmount = (subtotal * overallDiscount) / 100;
        return subtotal - overallDiscountAmount;
    }

    const clearForm = () => {
        setSelectedCustomer("");
        setSaleItems([{itemId: "", quantity: 1, feet: 1, discount: 0, color: '', thickness: '', price: 0}]);
        setOverallDiscount(0);
        setSelectedRateList("default");
    }
    
    const handleSaveEstimate = async () => {
        if (!selectedCustomer) {
            toast({ variant: "destructive", title: "Please select a customer." });
            return;
        }
        if (saleItems.some(item => !item.itemId || (item.quantity || 0) <= 0)) {
            toast({ variant: "destructive", title: "Please fill all item details correctly." });
            return;
        }

        const customer = customersMap.get(selectedCustomer);
        if (!customer) return;

        const finalSaleItems = saleItems.map(si => {
            const item = itemsMap.get(si.itemId!)!;
            
            let feet = si.feet || 1;
            if (item.category !== 'Aluminium') {
                feet = 1;
            }
            
            return {
                itemId: item.id,
                itemName: item.name,
                quantity: si.quantity || 1,
                price: si.price!,
                color: si.color || item.color,
                weight: item.weight,
                thickness: si.thickness || '',
                feet: feet,
                discount: si.discount || 0,
            }
        }) as SaleItem[];

        const newEstimate: Omit<Estimate, 'id' | 'date' | 'total'> = {
            customerId: selectedCustomer,
            customerName: customer.customerName,
            items: finalSaleItems,
            discount: overallDiscount,
            rateListName: selectedRateList
        };

        await onEstimateAdded(newEstimate);
        toast({ title: "Estimate Saved!", description: `Estimate has been saved.` });
        clearForm();
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
                <CardTitle>Create New Estimate</CardTitle>
                 <Button variant="ghost" size="icon" onClick={clearForm}>
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
                        <Label htmlFor="rate-list">Select Rate List</Label>
                        <Select onValueChange={setSelectedRateList} value={selectedRateList}>
                            <SelectTrigger id="rate-list">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="default">Default</SelectItem>
                                {rateListNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                            </SelectContent>
                        </Select>
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
                         const itemDetails = itemsMap.get(saleItem.itemId || "");
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
                <Button onClick={handleSaveEstimate}>Save Estimate</Button>
            </CardFooter>
        </Card>
        </>
    )
}

export default function EstimatesPage() {
  const { estimates, addEstimate, deleteEstimate, createSaleFromEstimate } = useData();

  const [activeTab, setActiveTab] = useState("history");
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteEstimate(id);
  };
  
  const handleEstimateAdded = (newEstimate: Omit<Estimate, 'id'|'date'|'total'>) => {
    addEstimate(newEstimate);
    setActiveTab("history");
  }

  const handleCreateSale = (estimate: Estimate) => {
    createSaleFromEstimate(estimate);
    toast({ title: "Sale Created", description: `A new sale draft has been created from estimate ${estimate.id}.` });
  }

  return (
    <>
      <PageHeader
        title="Estimates"
        description="Create and manage quotations for customers."
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 no-print">
          <TabsTrigger value="history">Estimates History</TabsTrigger>
          <TabsTrigger value="new">New Estimate</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div className="rounded-lg border shadow-sm mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rate List</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="no-print">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No estimates recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  estimates.map((estimate) => (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">{estimate.id}</TableCell>                      <TableCell>{estimate.customerName}</TableCell>
                      <TableCell>{formatDate(estimate.date)}</TableCell>
                      <TableCell>{estimate.rateListName === 'default' ? 'Default' : estimate.rateListName}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(estimate.total)}
                      </TableCell>
                      <TableCell className="no-print">
                        <Dialog onOpenChange={(open) => !open && setSelectedEstimate(null)}>
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
                                <DropdownMenuItem onSelect={() => setSelectedEstimate(estimate)}>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem onSelect={() => handleCreateSale(estimate)}>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Create Sale Order
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => handleDelete(estimate.id)}
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {selectedEstimate && selectedEstimate.id === estimate.id && (
                              <EstimatePrint estimate={selectedEstimate} />
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
                <NewEstimateForm onEstimateAdded={handleEstimateAdded} />
            </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
