
"use client"

import React, { useState } from "react"
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
} from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/firebase/data/data-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Printer } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { addDays, format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
    const { transactions } = useData();
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addDays(new Date(), -30),
        to: new Date(),
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
        <Card className="mt-4 border-none shadow-none sm:border sm:shadow-sm">
            <CardHeader>
                <div>
                    <CardTitle>Ledger Report</CardTitle>
                    <CardDescription>View transactions within a specific date range.</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-0 sm:px-6">
                <div className="flex items-center gap-2 no-print">
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
                        </Table>
                    </div>
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
        <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Printer className="mr-2 h-4 w-4" /> Print Report
        </Button>
      </PageHeader>

      <div className="printable-area">
       <Tabs defaultValue="monthly" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:w-[500px] no-print">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="ledger">Ledger</TabsTrigger>
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
      </Tabs>
      </div>
    </>
  );
}
