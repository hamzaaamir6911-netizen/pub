
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Factory, LayoutDashboard, Warehouse, ShoppingCart, Users, CreditCard, BarChart3, LogOut, BookUser, Settings, Truck } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"

const navItems = [
  { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/inventory", icon: Warehouse, label: "Inventory" },
  { href: "/app/sales", icon: ShoppingCart, label: "Sales" },
  { href: "/app/customers", icon: Users, label: "Customers" },
  { href: "/app/vendors", icon: Truck, label: "Vendors" },
  { href: "/app/expenses", icon: CreditCard, label: "Expenses" },
  { href: "/app/ledger", icon: BookUser, label: "Ledger" },
  { href: "/app/reports", icon: BarChart3, label: "Reports" },
  { href: "/app/settings", icon: Settings, label: "Settings" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Factory className="size-8 text-primary-foreground" />
          <h1 className="text-xl font-bold text-primary-foreground font-headline group-data-[collapsible=icon]:hidden">
            ARCO
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className="justify-start"
                >
                  <item.icon className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <SidebarMenu>
          <SidebarMenuItem>
             <Link href="/login">
                <SidebarMenuButton tooltip="Logout" className="justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOut className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
              </Link>
          </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
