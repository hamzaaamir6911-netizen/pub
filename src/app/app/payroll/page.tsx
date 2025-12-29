
"use client";

import { useState, useMemo } from "react";
import { PlusCircle, Trash2, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/utils";
import type { SalaryLabourer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/firebase/data/data-provider";
import { Combobox } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function PayrollPage() {
  const { toast } = useToast();
  const { labourers, addSalaryPayment } = useData();

  const [selectedMonth, setSelectedMonth] = useState<string>(months[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [salaryItems, setSalaryItems] = useState<Partial<SalaryLabourer>[]>([]);
  const [selectedLabourer, setSelectedLabourer] = useState("");
  const [overtimeRate, setOvertimeRate] = useState(200);

  const labourerOptions = useMemo(() => 
    labourers.map(l => ({
        value: l.id,
        label: `${l.name} - Salary: ${formatCurrency(l.monthlySalary)}`
    })), [labourers]);

  const handleAddLabourer = () => {
    if (!selectedLabourer) {
        toast({ variant: 'destructive', title: 'Please select a labourer to add.'});
        return;
    }
    if (salaryItems.some(item => item.labourerId === selectedLabourer)) {
        toast({ variant: 'destructive', title: 'Labourer already added.'});
        return;
    }
    
    const labourerDetails = labourers.find(l => l.id === selectedLabourer);
    if (labourerDetails) {
        setSalaryItems([...salaryItems, {
            labourerId: labourerDetails.id,
            labourerName: labourerDetails.name,
            monthlySalary: labourerDetails.monthlySalary,
            daysWorked: 30, // Default working days
            overtimeHours: 0,
            overtimeRate: overtimeRate,
            deductions: 0,
        }]);
        setSelectedLabourer(""); // Reset selector
    }
  }

  const handleRemoveItem = (index: number) => {
    setSalaryItems(salaryItems.filter((_, i) => i !== index));
  }

  const handleItemChange = (index: number, key: keyof SalaryLabourer, value: any) => {
    const newItems = [...salaryItems];
    const currentItem = { ...newItems[index] };
    (currentItem as any)[key] = value;
    newItems[index] = currentItem;
    setSalaryItems(newItems);
  }

  const calculateTotalPayable = (item: Partial<SalaryLabourer>): number => {
      const perDaySalary = (item.monthlySalary || 0) / 30;
      const baseSalary = (item.daysWorked || 0) * perDaySalary;
      const overtimePay = (item.overtimeHours || 0) * (item.overtimeRate || 0);
      const totalDeductions = item.deductions || 0;
      return baseSalary + overtimePay - totalDeductions;
  }
  
  const calculateGrandTotal = () => {
      return salaryItems.reduce((total, item) => {
          const itemPayable = calculateTotalPayable(item);
          item.totalPayable = itemPayable; // Update the item with calculated total
          return total + itemPayable;
      }, 0);
  }

  const handleGeneratePayslip = async () => {
    if (salaryItems.length === 0) {
      toast({ variant: "destructive", title: "Please add at least one labourer." });
      return;
    }
    
    const finalSalaryItems = salaryItems.map(item => ({
        ...item,
        totalPayable: calculateTotalPayable(item),
    })) as SalaryLabourer[];

    const totalAmountPaid = finalSalaryItems.reduce((sum, item) => sum + item.totalPayable, 0);

    await addSalaryPayment({
        month: selectedMonth,
        year: selectedYear,
        labourers: finalSalaryItems,
        totalAmountPaid: totalAmountPaid
    });

    toast({ title: "Payslip Generated!", description: `Salary for ${selectedMonth} ${selectedYear} has been processed.` });
    setSalaryItems([]);
  };

  return (
    <>
      <PageHeader
        title="Monthly Salary"
        description="Create and manage monthly salaries for your workforce."
      />
      <Card>
        <CardHeader>
          <CardTitle>Generate Monthly Salaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Overtime Rate (per hour)</Label>
              <Input
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-4">
              <Label>Add Labourer to Payslip</Label>
              <div className="flex gap-2 items-center">
                  <div className="flex-grow">
                      <Combobox
                          options={labourerOptions}
                          value={selectedLabourer}
                          onValueChange={setSelectedLabourer}
                          placeholder="Select a labourer..."
                      />
                  </div>
                  <Button onClick={handleAddLabourer} size="sm">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
              </div>
          </div>
          
          <div className="space-y-4">
            <Label>Salary Details</Label>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Labourer</TableHead>
                    <TableHead className="w-[120px]">Days Worked</TableHead>
                    <TableHead className="w-[120px]">Overtime (hrs)</TableHead>
                    <TableHead className="w-[120px]">Deductions</TableHead>
                    <TableHead className="text-right w-[150px]">Total Payable</TableHead>
                    <TableHead className="w-[50px]"><span className="sr-only">Remove</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">No labourers added to the payslip yet.</TableCell>
                    </TableRow>
                  ) : (
                    salaryItems.map((item, index) => (
                      <TableRow key={item.labourerId}>
                        <TableCell className="font-medium">
                          {item.labourerName}<br/>
                          <span className="text-xs text-muted-foreground">Salary: {formatCurrency(item.monthlySalary || 0)}/month</span>
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.daysWorked} onChange={(e) => handleItemChange(index, 'daysWorked', Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                           <Input type="number" value={item.overtimeHours} onChange={(e) => handleItemChange(index, 'overtimeHours', Number(e.target.value))} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={item.deductions} onChange={(e) => handleItemChange(index, 'deductions', Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(calculateTotalPayable(item))}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center bg-muted/50 p-4 rounded-b-lg">
          <div className="text-xl font-bold">
            Grand Total: {formatCurrency(calculateGrandTotal())}
          </div>
          <Button onClick={handleGeneratePayslip} disabled={salaryItems.length === 0}>
            <DollarSign className="mr-2 h-4 w-4" />
            Generate & Save Payslip
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
