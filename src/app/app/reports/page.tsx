

"use client"

import React, { useState, useRef } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDataContext } from "@/context/data-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Printer } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import type { Transaction } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useReactToPrint } from "react-to-print";


const monthlyData = [
    { month: "Jan", sales: 186000, expenses: 80000 },
    { month: "Feb", sales: 305000, expenses: 200000 },
    { month: "Mar", sales: 237000, expenses: 120000 },
    { month: "Apr", sales: 73000, expenses: 190000 },
    { month: "May", sales: 209000, expenses: 130000 },
    { month: "Jun", sales: 214000, expenses: 140000 },
]

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
    const { transactions } = useDataContext();
    const printRef = useRef(null);
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
    });

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        bodyClass: "print-body",
    });

    const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return (!date?.from || transactionDate >= date.from) && (!date?.to || transactionDate <= date.to);
    });

    let balance = 0;
    const reportData = filteredTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => {
        if(t.type === 'credit') {
            balance += t.amount;
        } else {
            balance -= t.amount;
        }
        return {...t, balance};
    });

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Ledger Report</CardTitle>
                    <CardDescription>View transactions within a specific date range.</CardDescription>
                </div>
                 <Button variant="outline" onClick={handlePrint} className="print:hidden">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Report
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 print:hidden">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[300px] justify-start text-left font-normal",
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
                </div>
                <div ref={printRef} className="print-area rounded-lg border print:border-none print:shadow-none">
                     <div className="p-4 print:block hidden">
                        <h2 className="text-2xl font-bold text-center">Ledger Report</h2>
                        <p className="text-center text-sm text-muted-foreground">
                            {date?.from && format(date.from, "LLL dd, y")} - {date?.to && format(date.to, "LLL dd, y")}
                        </p>
                    </div>
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
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}

export default function ReportsPage() {
    const { getDashboardStats, getMonthlySalesData } = useDataContext();
    const stats = getDashboardStats();
    const monthlyData = getMonthlySalesData();
    const printRef = useRef(null);
    const [activeTab, setActiveTab] = useState("monthly");

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        bodyClass: "print-body",
    });
    
    const dailyReportData = [
        { date: "Today", sales: stats.todaySummary.sales.reduce((acc, s) => acc + s.total, 0), expenses: stats.todaySummary.expenses.reduce((acc, e) => acc + e.amount, 0)},
        { date: "Yesterday", sales: 34500, expenses: 12000 },
    ]

  return (
    <>
      <PageHeader
        title="Reports"
        description="Analyze your factory's financial performance."
      >
        <Button variant="outline" onClick={handlePrint} className="print:hidden">
            <Printer className="mr-2 h-4 w-4" />
            Print Active Report
        </Button>
      </PageHeader>

       <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[500px] print:hidden">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
             <div ref={activeTab === 'daily' ? printRef : null}>
                 <Card className="print-area mt-4">
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
             <div ref={activeTab === 'monthly' ? printRef : null}>
                 <Card className="print-area mt-4">
                    <CardHeader>
                        <CardTitle>Monthly Performance</CardTitle>
                        <CardDescription>Comparison of revenue and expenses over the months.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                            <BarChart accessibilityLayer data={monthlyData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
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
            <div ref={activeTab === 'pl' ? printRef : null}>
                 <Card className="print-area mt-4">
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
      </Tabs>
    </>
  );
}
