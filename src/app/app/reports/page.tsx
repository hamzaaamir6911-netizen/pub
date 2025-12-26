"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDataContext } from "@/context/data-provider"


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
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Expenses",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
    const { getDashboardStats } = useDataContext();
    const stats = getDashboardStats();
    
    const dailyReportData = [
        { date: "Today", sales: stats.todaySummary.sales.reduce((acc, s) => acc + s.total, 0), expenses: stats.todaySummary.expenses.reduce((acc, e) => acc + e.amount, 0)},
        { date: "Yesterday", sales: 34500, expenses: 12000 },
    ]

  return (
    <>
      <PageHeader
        title="Reports"
        description="Analyze your factory's financial performance."
      />

       <Tabs defaultValue="monthly">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
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
        </TabsContent>
        <TabsContent value="monthly">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Monthly Performance</CardTitle>
                    <CardDescription>Comparison of sales and expenses over the months.</CardDescription>
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
        </TabsContent>
        <TabsContent value="pl">
             <Card className="mt-4">
                <CardHeader>
                    <CardTitle>Profit & Loss Statement</CardTitle>
                    <CardDescription>A summary of revenues, costs, and expenses.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 grid gap-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Sales (Revenue)</span>
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
        </TabsContent>
      </Tabs>
    </>
  );
}
