
"use client";

import { useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
import type { Labour } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useData } from "@/firebase/data/data-provider";
import { formatCurrency } from "@/lib/utils";

function AddLabourForm({ onLabourAdded }: { onLabourAdded: (newLabour: Omit<Labour, 'id' | 'createdAt'>) => void }) {
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState(0);
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !designation || salary <= 0) {
      toast({ variant: 'destructive', title: 'Please fill all fields correctly.' });
      return;
    }
    const newLabour: Omit<Labour, 'id' | 'createdAt'> = {
      name,
      designation,
      salary,
    };
    onLabourAdded(newLabour);
    toast({ title: 'Labourer Added!', description: `${name} has been added.` });
    setName('');
    setDesignation('');
    setSalary(0);
  };

  return (
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Add New Labourer</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Labourer Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Smith" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Welder, Helper" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Monthly Salary</Label>
          <Input id="salary" type="number" value={salary} onChange={(e) => setSalary(parseFloat(e.target.value) || 0)} placeholder="e.g. 25000" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit}>Add Labourer</Button>
      </DialogFooter>
    </DialogContent>
  );
}


export default function LabourPage() {
  const { labour, addLabour, deleteLabour } = useData();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    deleteLabour(id);
  };

  const handleLabourAdded = (newLabour: Omit<Labour, 'id' | 'createdAt'>) => {
    addLabour(newLabour);
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        title="Labour Management"
        description="Manage your employees and labourers."
      >
        <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Labourer
                </Button>
            </DialogTrigger>
            <AddLabourForm onLabourAdded={handleLabourAdded} />
        </Dialog>
      </PageHeader>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Labourer Name</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead className="text-right">Salary</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labour.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
                <TableCell>{person.designation}</TableCell>
                <TableCell className="text-right">{formatCurrency(person.salary)}</TableCell>
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
                        onSelect={() => handleDelete(person.id)}
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
