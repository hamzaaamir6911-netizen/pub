

"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/utils";
import type { Item } from "@/lib/types";
import { useDataContext } from "@/context/data-provider";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function AddItemForm({ onItemAdded }: { onItemAdded: (newItem: Omit<Item, 'id'>) => void }) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'Aluminium' | 'Glass' | 'Accessories'>('Aluminium');
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
        const newItem: Omit<Item, 'id'> = {
            name, category, unit, purchasePrice, salePrice, color, weight,
        };
        onItemAdded(newItem as Omit<Item, 'id'>);
        toast({ title: "Item Added!", description: `${name} has been added to inventory.` });
        // Reset form
        setName(''); setCategory('Aluminium'); setUnit('Feet'); setPurchasePrice(0); setSalePrice(0); setColor(''); setWeight(0);
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Add New Item</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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

export default function InventoryPage() {
  const { items, addItem, deleteItem } = useDataContext();
  const [isItemModalOpen, setItemModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    deleteItem(id);
  };
  
  const handleItemAdded = (newItem: Omit<Item, 'id'>) => {
    addItem(newItem);
    setItemModalOpen(false);
  }

  const categoryVariant = {
    Aluminium: "default",
    Glass: "secondary",
    Accessories: "outline",
  } as const;

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Manage your stock of materials and accessories."
      >
        <Dialog open={isItemModalOpen} onOpenChange={setItemModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </DialogTrigger>
            <AddItemForm onItemAdded={handleItemAdded} />
        </Dialog>
      </PageHeader>
      <div className="rounded-lg border shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead className="text-right">Sale Price</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <Badge variant={categoryVariant[item.category]}>
                    {item.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.color}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.purchasePrice)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(item.salePrice)}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleDelete(item.id)}
                        className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
