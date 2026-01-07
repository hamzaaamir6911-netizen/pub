

"use client"

import React, { useState, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableFooter,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { PageHeader } from "@/components/page-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/firebase/data/data-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Printer, FileText, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { SalaryPayment } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const chartConfig = {
  sales: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function LedgerReport() {
    const { transactions, customers, vendors } = useData();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        
        // Date filtering
        filtered = filtered.filter(t => {
            const transactionDate = new Date(t.date);
            return (!date?.from || transactionDate >= date.from) && (!date?.to || transactionDate <= date.to);
        });

        // Customer or Vendor filtering
        if (selectedCustomerId) {
            filtered = filtered.filter(t => t.customerId === selectedCustomerId);
        } else if (selectedVendorId) {
            filtered = filtered.filter(t => t.vendorId === selectedVendorId);
        }
        
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    }, [transactions, date, selectedCustomerId, selectedVendorId]);

    let runningBalance = 0;
    const reportData = filteredTransactions.map(t => {
        if (selectedCustomerId) {
            runningBalance += (t.type === 'debit' ? t.amount : -t.amount);
        } else if (selectedVendorId) {
            runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
        } else {
            runningBalance += (t.type === 'credit' ? t.amount : -t.amount);
        }
        return { ...t, balance: runningBalance };
    });
    
    const clearFilters = () => {
        setSelectedCustomerId(null);
        setSelectedVendorId(null);
    }

    const hasFilter = selectedCustomerId || selectedVendorId;

    return (
        <Card className="mt-4 border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader>
                <div>
                    <CardTitle>Ledger Report</CardTitle>
                    <CardDescription>View transactions within a specific date range.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-0 sm:px-6">
                <div className="flex flex-wrap items-center gap-4 no-print p-4 bg-muted/50 rounded-lg">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[300px] justify-start text-left font-normal bg-background",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="customer-filter" className="text-sm shrink-0">Customer</Label>
                        <Select onValueChange={(value) => { setSelectedCustomerId(value || null); setSelectedVendorId(null); }} value={selectedCustomerId || ''}>
                            <SelectTrigger id="customer-filter" className="w-full sm:w-[200px] bg-background"><SelectValue placeholder="Select Customer" /></SelectTrigger>
                            <SelectContent>
                                {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-2">
                        <Label htmlFor="vendor-filter" className="text-sm shrink-0">Vendor</Label>
                        <Select onValueChange={(value) => { setSelectedVendorId(value || null); setSelectedCustomerId(null); }} value={selectedVendorId || ''}>
                            <SelectTrigger id="vendor-filter" className="w-full sm:w-[200px] bg-background"><SelectValue placeholder="Select Vendor" /></SelectTrigger>
                            <SelectContent>
                                {vendors.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     {hasFilter && (
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <X className="mr-2 h-4 w-4" /> Clear Filter
                        </Button>
                    )}
                </div>

                 <div className="hidden print:block text-center my-6">
                    <h1 className="text-2xl font-bold font-headline">ARCO Aluminium Company</h1>
                    <p className="text-lg font-semibold mt-1">
                        Account Statement for {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.customerName : selectedVendorId ? vendors.find(v => v.id === selectedVendorId)?.name : 'General Ledger'}
                    </p>
                     {date?.from && date?.to && (
                        <p className="text-sm text-muted-foreground">{format(date.from, "LLL dd, y")} to {format(date.to, "LLL dd, y")}</p>
                    )}
                </div>

                <div>
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">No transactions in selected range.</TableCell>
                                    </TableRow>
                                ) : (
                                    reportData.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{formatDate(transaction.date)}</TableCell>
                                            <TableCell className="font-medium">{transaction.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{transaction.category}</Badge>
                                            </TableCell>
                                            <TableCell className={cn("text-right font-mono", transaction.type === 'debit' && "font-semibold")}>
                                                {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                                            </TableCell>
                                            <TableCell className={cn("text-right font-mono", transaction.type === 'credit' && "font-semibold")}>
                                                {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">{formatCurrency(transaction.balance)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                              {hasFilter && reportData.length > 0 && (
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-right font-bold">Final Balance</TableCell>
                                        <TableCell className={cn("text-right font-bold font-mono", runningBalance >= 0 ? "text-green-600" : "text-red-600")}>
                                            {formatCurrency(runningBalance)}
                                        </TableCell>
                                    </TableRow>
                                </TableFooter>
                           )}
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SalaryPayslip({ payment }: { payment: SalaryPayment }) {
    const handlePrint = () => {
        document.body.classList.add('printing-now');
        window.print();
        document.body.classList.remove('printing-now');
    };
    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0 no-print">
                <DialogTitle>Payslip for {payment.month} {payment.year}</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto">
                <div className="p-6">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold">Salary Payslip</h1>
                        <p className="text-lg font-semibold">{payment.month} {payment.year}</p>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Labourer</TableHead>
                                <TableHead className="text-right">Monthly Salary</TableHead>
                                <TableHead className="text-right">Days Worked</TableHead>
                                <TableHead className="text-right">Overtime (hrs)</TableHead>
                                <TableHead className="text-right">Deductions</TableHead>
                                <TableHead className="text-right font-bold">Total Payable</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payment.labourers.map(l => (
                                <TableRow key={l.labourerId}>
                                    <TableCell className="font-medium">{l.labourerName}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(l.monthlySalary)}</TableCell>
                                    <TableCell className="text-right">{l.daysWorked}</TableCell>
                                    <TableCell className="text-right">{l.overtimeHours}</TableCell>
                                    <TableCell className="text-right text-red-500">{formatCurrency(l.deductions)}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(l.totalPayable)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableRow className="bg-muted/50 font-bold">
                            <TableCell colSpan={5} className="text-right">Grand Total Paid</TableCell>
                            <TableCell className="text-right">{formatCurrency(payment.totalAmountPaid)}</TableCell>
                        </TableRow>
                    </Table>
                </div>
            </div>
            <DialogFooter className="mt-4 flex-shrink-0 no-print">
                <Button variant="outline" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

function SalaryReport() {
    const { salaryPayments } = useData();
    const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);

    return (
        <Card className="mt-4 border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader>
                <CardTitle>Salary Payment History</CardTitle>
                <CardDescription>Review all past salary payments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead className="text-right">Total Amount Paid</TableHead>
                                <TableHead className="no-print"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salaryPayments.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No salary payments found.</TableCell></TableRow>
                            ) : (
                                salaryPayments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{payment.month}</TableCell>
                                        <TableCell>{payment.year}</TableCell>
                                        <TableCell>{formatDate(payment.date)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(payment.totalAmountPaid)}</TableCell>
                                        <TableCell className="text-right no-print">
                                            <Dialog onOpenChange={(open) => !open && setSelectedPayment(null)}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(payment)}>
                                                        <FileText className="mr-2 h-4 w-4" /> View Details
                                                    </Button>
                                                </DialogTrigger>
                                                {selectedPayment && selectedPayment.id === payment.id && (
                                                    <SalaryPayslip payment={selectedPayment} />
                                                )}
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReportsPage() {
    const { getDashboardStats, getMonthlySalesData } = useData();
    const stats = getDashboardStats();
    const monthlyData = getMonthlySalesData();
    const [activeTab, setActiveTab] = useState("monthly");
    
    const handlePrint = () => {
        window.print();
    }
    
    const dailyReportData = [
        { date: "Today", sales: stats.todaySummary.sales.reduce((acc, s) => acc + s.total, 0), expenses: stats.todaySummary.expenses.reduce((acc, e) => acc + e.amount, 0)},
        // Note: Yesterday's data is hardcoded as an example.
        { date: "Yesterday", sales: 34500, expenses: 12000 }, 
    ]

  return (
    <>
      <PageHeader
        title="Reports"
        description="Analyze your factory's financial performance."
      >
        <Button variant="outline" onClick={handlePrint} className="no-print">
            <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </PageHeader>

      <div className="printable-area">
       <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 md:w-auto no-print">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
          <TabsTrigger value="salary">Salary Report</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
             <div>
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Daily Report</CardTitle>
                        <CardDescription>{formatDate(new Date())}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <BarChart accessibilityLayer data={dailyReportData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis tickFormatter={(value) => formatCurrency(value as number)} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--accent))' }}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Legend />
                                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="monthly">
             <div>
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Monthly Performance</CardTitle>
                        <CardDescription>Comparison of revenue and expenses over the months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={monthlyData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    
                                />
                                 <YAxis tickFormatter={(value) => formatCurrency(value as number).slice(0,-3)+'k'} />
                                <Tooltip
                                    cursor={{ fill: 'hsl(var(--accent))' }}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Legend />
                                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="pl">
            <div>
                 <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Profit & Loss Statement</CardTitle>
                        <CardDescription>A summary of revenues, costs, and expenses.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border p-4 grid gap-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Revenue</span>
                                <span className="font-medium text-green-600">{formatCurrency(stats.totalSales)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Expenses</span>
                                <span className="font-medium text-red-600">- {formatCurrency(stats.totalExpenses)}</span>
                            </div>
                             <div className="border-t pt-4 flex justify-between font-bold text-lg">
                                <span>Net Profit / Loss</span>
                                <span className={stats.profitLoss >= 0 ? 'text-green-700' : 'text-red-700'}>{formatCurrency(stats.profitLoss)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="ledger">
            <LedgerReport />
        </TabsContent>
        <TabsContent value="salary">
            <SalaryReport />
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
