"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle, Trash2, RotateCcw, FileText } from "lucide-react";
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
import { mockSales, mockCustomers, mockItems, mockExpenses } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, SaleItem, Customer, Item, Expense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function SaleInvoice({ sale }: { sale: Sale }) {
    const subtotal = sale.items.reduce((acc, item) => {
        const itemDetails = mockItems.find(i => i.id === item.itemId);
        if (!itemDetails) return acc;
        
        if (itemDetails.unit === 'Feet' && item.length && item.width) {
            const totalFeet = (item.length * item.width / 144) * item.quantity;
            return acc + (itemDetails.salePrice * totalFeet);
        }
        return acc + (item.price * item.quantity);
    }, 0);
    const discountAmount = (subtotal * sale.discount) / 100;
    const total = subtotal - discountAmount;

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Sale Invoice: {sale.id}</DialogTitle>
            </DialogHeader>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="font-semibold">Customer:</p>
                        <p>{sale.customerName}</p>
                        <p>{mockCustomers.find(c => c.id === sale.customerId)?.address}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold">Date:</p>
                        <p>{formatDate(sale.date)}</p>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead className="text-right">Qty (Pcs)</TableHead>
                            <TableHead className="text-right">Total Feet</TableHead>
                            <TableHead className="text-right">Rate (per Ft.)</TableHead>
                            <TableHead className="text-right">Total Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sale.items.map((item, index) => {
                             const itemDetails = mockItems.find(i => i.id === item.itemId);
                             const totalFeet = item.length && item.width ? (item.length * item.width / 144) * item.quantity : (itemDetails?.weight || 0) * item.quantity;
                             const rate = itemDetails?.salePrice || 0;
                             const itemSubtotal = totalFeet * rate;

                             return (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="font-medium">{item.itemName}</div>
                                        {itemDetails?.weight && <div className="text-xs text-muted-foreground">({itemDetails.weight} kg/ft)</div>}
                                    </TableCell>
                                    <TableCell>{item.color}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{totalFeet.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(rate)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(itemSubtotal)}</TableCell>
                                </TableRow>
                             )
                        })}
                    </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount ({sale.discount}%):</span>
                            <span className="text-red-500">- {formatCurrency(discountAmount)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button onClick={() => window.print()}>Print Invoice</Button>
                </div>
            </div>
        </DialogContent>
    )
}

function AddCustomerForm({ onCustomerAdded }: { onCustomerAdded: (newCustomer: Customer) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !phone || !address) {
      toast({ variant: 'destructive', title: 'Please fill all fields.' });
      return;
    }
    const newCustomer: Customer = {
      id: `CUST${(mockCustomers.length + 1).toString().padStart(3, '0')}`,
      name,
      phone,
      address,
    };
    onCustomerAdded(newCustomer);
    toast({ title: 'Customer Added!', description: `${name} has been added.` });
    setName('');
    setPhone('');
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
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300-1234567" />
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

function AddItemForm({ onItemAdded }: { onItemAdded: (newItem: Item) => void }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'Aluminium' | 'Glass' | 'Accessories'>('Aluminium');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState<'Kg' | 'Feet' | 'Piece'>('Feet');
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [salePrice, setSalePrice] = useState(0);
    const [color, setColor] = useState('');
    const [weight, setWeight] = useState(0);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!name || !category || !unit || !color) {
            toast({ variant: "destructive", title: "Please fill all required fields." });
            return;
        }
        const newItem: Item = {
            id: `ITM${(mockItems.length + 1).toString().padStart(3, '0')}`,
            name, category, quantity, unit, purchasePrice, salePrice, color, weight,
        };
        onItemAdded(newItem);
        toast({ title: "Item Added!", description: `${name} has been added to inventory.` });
        // Reset form
        setName(''); setCategory('Aluminium'); setQuantity(0); setUnit('Feet'); setPurchasePrice(0); setSalePrice(0); setColor(''); setWeight(0);
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Item</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                    <Label>Item Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. D 40" />
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={(v: any) => setCategory(v)} value={category}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Aluminium">Aluminium</SelectItem>
                            <SelectItem value="Glass">Glass</SelectItem>
                            <SelectItem value="Accessories">Accessories</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={quantity} onChange={(e) => setQuantity(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                     <Select onValueChange={(v: any) => setUnit(v)} value={unit}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Feet">Feet</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                             <SelectItem value="Piece">Piece</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Purchase Price</Label>
                    <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label>Sale Price</Label>
                    <Input type="number" value={salePrice} onChange={(e) => setSalePrice(parseFloat(e.target.value))} />
                </div>
                 <div className="space-y-2">
                    <Label>Color</Label>
                    <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. Silver" />
                </div>
                 <div className="space-y-2">
                    <Label>Weight (kg/ft)</Label>
                    <Input type="number" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value))} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Add Item</Button>
            </DialogFooter>
        </DialogContent>
    );
}

function AddExpenseForm({ onExpenseAdded }: { onExpenseAdded: (newExpense: Expense) => void }) {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState<'Labour' | 'Transport' | 'Electricity' | 'Other'>('Other');
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!title || amount <= 0) {
            toast({ variant: "destructive", title: "Please enter a valid title and amount." });
            return;
        }
        const newExpense: Expense = {
            id: `EXP${(mockExpenses.length + 1).toString().padStart(3, '0')}`,
            title,
            amount,
            category,
            date: new Date(),
        };
        onExpenseAdded(newExpense);
        toast({ title: "Expense Added!", description: `${title} has been recorded.` });
        setTitle(''); setAmount(0); setCategory('Other');
    };
    
    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Add New Expense</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Factory Rent" />
                </div>
                <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} />
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select onValueChange={(v: any) => setCategory(v)} value={category}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Labour">Labour</SelectItem>
                            <SelectItem value="Transport">Transport</SelectItem>
                            <SelectItem value="Electricity">Electricity</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Add Expense</Button>
            </DialogFooter>
        </DialogContent>
    );
}


function NewSaleForm({ onSaleAdded }: { onSaleAdded: (newSale: Sale) => void }) {
    const { toast } = useToast();
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [saleItems, setSaleItems] = useState<Partial<SaleItem>[]>([{itemId: "", quantity: 1, length: 0, width: 0}]);
    const [discount, setDiscount] = useState(0);

    const handleAddItem = () => {
        setSaleItems([...saleItems, {itemId: "", quantity: 1, length: 0, width: 0}]);
    }

    const handleRemoveItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    }

    const handleItemChange = (index: number, key: keyof SaleItem, value: any) => {
        const newItems = [...saleItems];
        (newItems[index] as any)[key] = value;
        setSaleItems(newItems);
    }

    const calculateTotal = () => {
        const subtotal = saleItems.reduce((total, currentItem) => {
            if (!currentItem.itemId) return total;
            const itemDetails = mockItems.find(i => i.id === currentItem.itemId);
            if (!itemDetails) return total;

            if (itemDetails.unit === 'Feet' && currentItem.length && currentItem.width) {
                 const totalFeet = (currentItem.length * currentItem.width / 144) * (currentItem.quantity || 1);
                 return total + (itemDetails.salePrice * totalFeet);
            }
            return total + (itemDetails.salePrice * (currentItem.quantity || 1));
        }, 0);
        
        const discountAmount = (subtotal * discount) / 100;
        return subtotal - discountAmount;
    }

    const clearForm = () => {
        setSelectedCustomer("");
        setSaleItems([{itemId: "", quantity: 1, length: 0, width: 0}]);
        setDiscount(0);
    }
    
    const handleSaveSale = () => {
        if (!selectedCustomer) {
            toast({ variant: "destructive", title: "Please select a customer." });
            return;
        }
        if (saleItems.some(item => !item.itemId || (item.quantity || 0) <= 0)) {
            toast({ variant: "destructive", title: "Please fill all item details correctly." });
            return;
        }

        const customer = mockCustomers.find(c => c.id === selectedCustomer);
        if (!customer) return;

        const finalSaleItems = saleItems.map(si => {
            const item = mockItems.find(i => i.id === si.itemId)!;
            const pricePerUnit = item.salePrice;
            let price = pricePerUnit;

            if (item.unit === 'Feet' && si.length && si.width) {
                const totalFeet = (si.length * si.width / 144) * (si.quantity || 1);
                // The price here is total price for the line item, not per unit
                price = pricePerUnit * totalFeet;
            } else {
                 price = pricePerUnit * (si.quantity || 1);
            }


            return {
                ...si,
                itemId: item.id,
                itemName: item.name,
                quantity: si.quantity || 1,
                price: price / (si.quantity || 1), // price per piece
                color: item.color,
                weight: item.weight,
            }
        }) as SaleItem[];

        const newSale: Sale = {
            id: `SALE${(mockSales.length + 1).toString().padStart(3, '0')}`,
            customerId: selectedCustomer,
            customerName: customer.name,
            date: new Date(),
            items: finalSaleItems,
            total: calculateTotal(),
            discount: discount,
        };

        onSaleAdded(newSale);
        toast({ title: "Sale Saved!", description: `Sale ${newSale.id} has been recorded.` });
        clearForm();
    }

    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Create New Sale</CardTitle>
                 <Button variant="ghost" size="icon" onClick={clearForm}>
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only">Clear Form</span>
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <Select onValueChange={setSelectedCustomer} value={selectedCustomer}>
                            <SelectTrigger id="customer">
                                <SelectValue placeholder="Select a customer" />
                            </SelectTrigger>
                            <SelectContent>
                                {mockCustomers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input 
                            id="discount"
                            type="number"
                            placeholder="e.g. 5"
                            value={discount}
                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label>Items</Label>
                    {saleItems.map((saleItem, index) => {
                         const itemDetails = mockItems.find(i => i.id === saleItem.itemId);
                         return (
                         <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end p-3 border rounded-md">
                            <div className="md:col-span-2 space-y-2">
                                <Label>Item</Label>
                                <Select onValueChange={(value) => handleItemChange(index, "itemId", value)} value={saleItem.itemId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {itemDetails?.unit === "Feet" ? (
                                <>
                                    <div className="space-y-2">
                                        <Label>Length (in)</Label>
                                        <Input 
                                            type="number" 
                                            placeholder="L" 
                                            value={saleItem.length}
                                            onChange={(e) => handleItemChange(index, "length", parseFloat(e.target.value))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Width (in)</Label>
                                        <Input 
                                            type="number" 
                                            placeholder="W" 
                                            value={saleItem.width}
                                            onChange={(e) => handleItemChange(index, "width", parseFloat(e.target.value))}
                                        />
                                    </div>
                                </>
                            ) : <div className="md:col-span-2" /> }
                           
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
                <Button onClick={handleSaveSale}>Save Sale</Button>
            </CardFooter>
        </Card>
    )
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [items, setItems] = useState<Item[]>(mockItems);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [activeTab, setActiveTab] = useState("history");

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setSales(sales.filter((sale) => sale.id !== id));
  };
  
  const handleSaleAdded = (newSale: Sale) => {
    setSales(prevSales => [newSale, ...prevSales]);
    setActiveTab("history");
  }

  const handleCustomerAdded = (newCustomer: Customer) => {
    setCustomers(prev => [newCustomer, ...prev]);
    setCustomerModalOpen(false);
  }

  const handleItemAdded = (newItem: Item) => {
    setItems(prev => [newItem, ...prev]);
    setItemModalOpen(false);
  }
  
  const handleExpenseAdded = (newExpense: Expense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setExpenseModalOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Sales"
        description="Record new sales and view sales history."
      />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="history">Sales History</TabsTrigger>
          <TabsTrigger value="new">New Sale</TabsTrigger>
        </TabsList>
        <TabsContent value="history">
          <div className="rounded-lg border shadow-sm mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No sales recorded yet.</TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(sale.total)}
                      </TableCell>
                      <TableCell>
                        <Dialog>
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
                                <DropdownMenuItem>
                                    <FileText className="mr-2 h-4 w-4"/>
                                    View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DropdownMenuItem
                                onSelect={() => handleDelete(sale.id)}
                                className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <SaleInvoice sale={sale} />
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
                <NewSaleForm onSaleAdded={handleSaleAdded} />
            </div>
        </TabsContent>
      </Tabs>
       <Dialog open={isCustomerModalOpen} onOpenChange={setCustomerModalOpen}>
        <AddCustomerForm onCustomerAdded={handleCustomerAdded} />
      </Dialog>
      <Dialog open={isItemModalOpen} onOpenChange={setItemModalOpen}>
        <AddItemForm onItemAdded={handleItemAdded} />
      </Dialog>
      <Dialog open={isExpenseModalOpen} onOpenChange={setExpenseModalOpen}>
        <AddExpenseForm onExpenseAdded={handleExpenseAdded} />
      </Dialog>
    </>
  );
}
