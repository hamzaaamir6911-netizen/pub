"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle, Trash2, RotateCcw } from "lucide-react";
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
import { mockSales, mockCustomers, mockItems } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function NewSaleForm({ onSaleAdded }: { onSaleAdded: (newSale: Sale) => void }) {
    const { toast } = useToast();
    const [selectedCustomer, setSelectedCustomer] = useState("");
    const [saleItems, setSaleItems] = useState<{itemId: string; quantity: number}[]>([{itemId: "", quantity: 1}]);

    const handleAddItem = () => {
        setSaleItems([...saleItems, {itemId: "", quantity: 1}]);
    }

    const handleRemoveItem = (index: number) => {
        setSaleItems(saleItems.filter((_, i) => i !== index));
    }

    const handleItemChange = (index: number, itemId: string) => {
        const newItems = [...saleItems];
        newItems[index].itemId = itemId;
        setSaleItems(newItems);
    }
    
    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...saleItems];
        newItems[index].quantity = quantity;
        setSaleItems(newItems);
    }

    const calculateTotal = () => {
        return saleItems.reduce((total, currentItem) => {
            const itemDetails = mockItems.find(i => i.id === currentItem.itemId);
            if (!itemDetails) return total;
            return total + (itemDetails.salePrice * currentItem.quantity);
        }, 0);
    }

    const clearForm = () => {
        setSelectedCustomer("");
        setSaleItems([{itemId: "", quantity: 1}]);
    }
    
    const handleSaveSale = () => {
        if (!selectedCustomer) {
            toast({ variant: "destructive", title: "Please select a customer." });
            return;
        }
        if (saleItems.some(item => !item.itemId || item.quantity <= 0)) {
            toast({ variant: "destructive", title: "Please fill all item details correctly." });
            return;
        }

        const customer = mockCustomers.find(c => c.id === selectedCustomer);
        if (!customer) return;

        const newSale: Sale = {
            id: `SALE${(mockSales.length + 1).toString().padStart(3, '0')}`,
            customerId: selectedCustomer,
            customerName: customer.name,
            date: new Date(),
            items: saleItems.map(si => {
                const item = mockItems.find(i => i.id === si.itemId)!;
                return {
                    itemId: si.itemId,
                    itemName: item.name,
                    quantity: si.quantity,
                    price: item.salePrice,
                }
            }),
            total: calculateTotal(),
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
                
                <div className="space-y-4">
                    <Label>Items</Label>
                    {saleItems.map((saleItem, index) => (
                         <div key={index} className="flex gap-2 items-center">
                            <Select onValueChange={(value) => handleItemChange(index, value)} value={saleItem.itemId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockItems.map(i => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input 
                                type="number" 
                                placeholder="Qty" 
                                className="w-24"
                                value={saleItem.quantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                min="1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={saleItems.length === 1}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddItem}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>

            </CardContent>
            <CardFooter className="flex justify-between items-center">
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
  const [activeTab, setActiveTab] = useState("history");

  const handleDelete = (id: string) => {
    setSales(sales.filter((sale) => sale.id !== id));
  };
  
  const handleSaleAdded = (newSale: Sale) => {
    setSales(prevSales => [...prevSales, newSale]);
    setActiveTab("history");
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleDelete(sale.id)}
                              className="text-red-600"
                            >
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
                <NewSaleForm onSaleAdded={handleSaleAdded} />
            </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
