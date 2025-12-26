"use client"

import { DollarSign, Warehouse, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

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
import { getDashboardStats, getMonthlySalesData, mockSales } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const stats = getDashboardStats();
  const monthlySales = getMonthlySalesData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A real-time overview of your factory's performance."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">Based on purchase price</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit / Loss</CardTitle>
             {stats.profitLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.profitLoss)}
            </div>
            <p className="text-xs text-muted-foreground">Calculated for the period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
              <BarChart accessibilityLayer data={monthlySales}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${formatCurrency(value as number)}`}
                />
                 <ChartTooltip
                  cursor={{ fill: 'hsl(var(--accent))' }}
                  content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-12 lg:col-span-3">
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
            <CardDescription>Sales and expenses for today.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                        <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Today's Sales</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(stats.todaySummary.sales.reduce((sum, s) => sum + s.total, 0))}</p>
                    </div>
                    <div className="ml-auto font-medium">+{stats.todaySummary.sales.length} orders</div>
                </div>
                 <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-md">
                        <ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Today's Expenses</p>
                        <p className="text-sm text-muted-foreground">{formatCurrency(stats.todaySummary.expenses.reduce((sum, e) => sum + e.amount, 0))}</p>
                    </div>
                     <div className="ml-auto font-medium">+{stats.todaySummary.expenses.length} records</div>
                </div>
            </div>
            
            <h3 className="font-semibold mt-6 mb-2">Recent Sales</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSales.slice(0, 3).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      <div className="font-medium">{sale.customerName}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {sale.id}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

          </CardContent>
        </Card>
      </div>
    </>
  );
}
