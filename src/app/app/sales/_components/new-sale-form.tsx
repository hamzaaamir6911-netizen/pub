
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
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
import { formatCurrency, cn } from "@/lib/utils";
import type { Sale, SaleItem, Customer, Item } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function AddCustomerForm({ onCustomerAdded, onOpenChange }: { onCustomerAdded: (newCustomer: Omit<Customer, 'id' | 'createdAt'>) => void, onOpenChange: (open: boolean) => void }) {
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
    onOpenChange(false);
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


export function NewSaleForm({ initialData, onSuccess }: { initialData?: Sale | null; onSuccess: () => void; }) {
    const { toast } = useToast();
    const { customers, items: allItems, addCustomer, addSale, updateSale } = useData();
    
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
            await updateSale(initialData.id, saleData);
            toast({ title: "Sale Updated!", description: `Sale ${initialData.id} has been updated.` });
        } else {
            await addSale(saleData);
            toast({ title: "Sale Draft Saved!", description: `Sale has been saved as a draft.` });
        }
        onSuccess();
    }
    
    const handleCustomerAdded = async (newCustomer: Omit<Customer, 'id'| 'createdAt'>) => {
        const addedCustomer = await addCustomer(newCustomer);
        if (addedCustomer?.id) {
            setSelectedCustomer(addedCustomer.id);
        }
    }
    
    const itemOptions = allItems.map(item => ({
        value: item.id,
        label: `${item.name} ${item.thickness ? `(${item.thickness})` : ''} - ${item.color}`
    }));

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{isEditMode ? `Edit Sale ${initialData?.id}` : 'Create New Sale'}</CardTitle>
                 {!isEditMode && (
                    <Button variant="ghost" size="icon" onClick={clearForm}>
                        <RotateCcw className="h-4 w-4" />
                        <span className="sr-only">Clear Form</span>
                    </Button>
                )}
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
                            <AddCustomerForm onCustomerAdded={handleCustomerAdded} onOpenChange={setCustomerModalOpen} />
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
                                        {itemOptions.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
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
    )
}
