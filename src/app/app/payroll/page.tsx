
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Labour, SalaryPayment } from "@/lib/types";
import { useData } from "@/firebase/data/data-provider";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

type SalaryInput = {
    labourId: string;
    daysWorked: number;
    overtimeAmount: number;
};

const MONTHS = [
    { label: "January", value: 1 }, { label: "February", value: 2 }, { label: "March", value: 3 },
    { label: "April", value: 4 }, { label: "May", value: 5 }, { label: "June", value: 6 },
    { label: "July", value: 7 }, { label: "August", value: 8 }, { label: "September", value: 9 },
    { label: "October", value: 10 }, { label: "November", value: 11 }, { label: "December", value: 12 },
];

const getYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
};

function SalaryGenerationForm() {
    const { labour, generateSalaries, salaryPayments } = useData();
    const { toast } = useToast();
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [workingDays, setWorkingDays] = useState(30);
    const [salaryInputs, setSalaryInputs] = useState<Record<string, SalaryInput>>({});
    const [selectedLabourIds, setSelectedLabourIds] = useState<string[]>([]);

    const alreadyPaidLabourIds = useMemo(() => {
        return salaryPayments
            .filter(p => p.month === month && p.year === year)
            .map(p => p.labourId);
    }, [salaryPayments, month, year]);
    
    const unpaidLabour = labour.filter(l => !alreadyPaidLabourIds.includes(l.id));

    useEffect(() => {
        // When month/year changes, reset selections
        setSelectedLabourIds([]);
        setSalaryInputs({});
    }, [month, year]);

    const handleInputChange = (labourId: string, field: 'daysWorked' | 'overtimeAmount', value: string) => {
        const numValue = parseFloat(value) || 0;
        setSalaryInputs(prev => ({
            ...prev,
            [labourId]: {
                labourId: labourId,
                daysWorked: field === 'daysWorked' ? numValue : (prev[labourId]?.daysWorked ?? workingDays),
                overtimeAmount: field === 'overtimeAmount' ? numValue : (prev[labourId]?.overtimeAmount ?? 0),
            }
        }));
    };

    const handleGenerate = async () => {
        if (selectedLabourIds.length === 0) {
            toast({ variant: 'destructive', title: "No labourers selected." });
            return;
        }

        const salariesToGenerate = labour
            .filter(l => selectedLabourIds.includes(l.id))
            .map(l => {
                const input = salaryInputs[l.id] || { daysWorked: workingDays, overtimeAmount: 0 };
                const perDaySalary = l.salary / workingDays;
                const calculatedSalary = perDaySalary * input.daysWorked;
                const totalPayable = calculatedSalary + input.overtimeAmount;

                return {
                    labourId: l.id,
                    labourName: l.name,
                    month,
                    year,
                    baseSalary: l.salary,
                    daysWorked: input.daysWorked,
                    overtimeAmount: input.overtimeAmount,
                    totalPayable,
                };
            });
        
        try {
            await generateSalaries(salariesToGenerate);
            toast({ title: "Salaries Generated!", description: `Salaries for selected labourers for ${MONTHS.find(m=>m.value === month)?.label} ${year} have been processed.` });
            setSelectedLabourIds([]); // Reset selection after generation
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    };
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLabourIds(unpaidLabour.map(l => l.id));
        } else {
            setSelectedLabourIds([]);
        }
    }

    const handleSelectLabourer = (labourId: string, checked: boolean) => {
        if (checked) {
            setSelectedLabourIds(prev => [...prev, labourId]);
        } else {
            setSelectedLabourIds(prev => prev.filter(id => id !== labourId));
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generate Monthly Salaries</CardTitle>
                <CardDescription>Select the month and year, then enter the days worked and overtime for each labourer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Month</Label>
                        <Select onValueChange={(v) => setMonth(parseInt(v))} value={String(month)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Year</Label>
                        <Select onValueChange={(v) => setYear(parseInt(v))} value={String(year)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {getYears().map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Working Days in Month</Label>
                        <Input type="number" value={workingDays} onChange={(e) => setWorkingDays(parseInt(e.target.value) || 30)} />
                    </div>
                </div>

                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                     <Checkbox
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        checked={unpaidLabour.length > 0 && selectedLabourIds.length === unpaidLabour.length}
                                        aria-label="Select all"
                                    />
                                </TableHead>
                                <TableHead>Labourer</TableHead>
                                <TableHead>Base Salary</TableHead>
                                <TableHead>Days Worked</TableHead>
                                <TableHead>Overtime</TableHead>
                                <TableHead className="text-right">Total Payable</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {unpaidLabour.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        {labour.length === 0 ? "No labourers found. Please add labourers first." : "All salaries for this month have been paid."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                unpaidLabour.map(l => {
                                    const input = salaryInputs[l.id] || { daysWorked: workingDays, overtimeAmount: 0 };
                                    const perDaySalary = l.salary / workingDays;
                                    const calculatedSalary = perDaySalary * input.daysWorked;
                                    const totalPayable = calculatedSalary + input.overtimeAmount;

                                    return (
                                        <TableRow key={l.id} data-state={selectedLabourIds.includes(l.id) && "selected"}>
                                            <TableCell>
                                                <Checkbox
                                                    onCheckedChange={(checked) => handleSelectLabourer(l.id, !!checked)}
                                                    checked={selectedLabourIds.includes(l.id)}
                                                    aria-label={`Select ${l.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{l.name}</TableCell>
                                            <TableCell>{formatCurrency(l.salary)}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    defaultValue={workingDays}
                                                    onChange={(e) => handleInputChange(l.id, 'daysWorked', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    className="w-24"
                                                    placeholder="0"
                                                    onChange={(e) => handleInputChange(l.id, 'overtimeAmount', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(totalPayable)}</TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleGenerate} disabled={selectedLabourIds.length === 0}>Generate & Pay Selected Salaries</Button>
            </CardFooter>
        </Card>
    )
}

function PayrollHistory() {
    const { salaryPayments } = useData();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payslip History</CardTitle>
                <CardDescription>View all previously generated salary payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Payment Date</TableHead>
                                <TableHead>Labourer</TableHead>
                                <TableHead>Salary Period</TableHead>
                                <TableHead className="text-right">Total Paid</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salaryPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No salary payments found.</TableCell>
                                </TableRow>
                            ) : (
                                salaryPayments.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{formatDate(p.paymentDate)}</TableCell>
                                        <TableCell className="font-medium">{p.labourName}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {MONTHS.find(m => m.value === p.month)?.label} {p.year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(p.totalPayable)}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}

export default function PayrollPage() {
    return (
        <>
            <PageHeader
                title="Payroll"
                description="Generate monthly salaries and view payment history."
            />
            <Tabs defaultValue="generate">
                <TabsList className="w-full sm:w-auto grid grid-cols-2">
                    <TabsTrigger value="generate">Generate Salaries</TabsTrigger>
                    <TabsTrigger value="history">Payment History</TabsTrigger>
                </TabsList>
                <TabsContent value="generate" className="mt-4">
                    <SalaryGenerationForm />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <PayrollHistory />
                </TabsContent>
            </Tabs>
        </>
    );
}

    