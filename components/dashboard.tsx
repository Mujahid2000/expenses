"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarDays, DollarSign, TrendingUp, Filter } from "lucide-react"

export interface Expenses {
  _id: string
  title: string
  amount: number
  category: "Food" | "Transport" | "Shopping" | "Others"
  date: string
  createdAt: string
  updatedAt: string
  __v: number
}

interface DashboardProps {
  expenses?: Expenses[] // Make expenses optional
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Food":
      return "bg-green-100 text-green-800"
    case "Transport":
      return "bg-blue-100 text-blue-800"
    case "Shopping":
      return "bg-orange-100 text-orange-800"
    case "Others":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function Dashboard({ expenses = [] }: DashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")

  // Calculate totals
  const totalExpenses = Array.isArray(expenses)
    ? expenses.reduce((sum, expense) => sum + expense.amount, 0)
    : 0
  const totalTransactions = Array.isArray(expenses) ? expenses.length : 0

  // Calculate category breakdowns
  const categoryTotals = Array.isArray(expenses)
    ? expenses.reduce(
        (acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount
          return acc
        },
        {} as Record<string, number>,
      )
    : {}

  // Get current month expenses
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentMonthExpenses = Array.isArray(expenses)
    ? expenses.filter((expense) => {
        const expenseDate = new Date(expense.date)
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
      })
    : []
  const monthlyTotal = Array.isArray(currentMonthExpenses)
    ? currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    : 0

  // Calculate average per transaction
  const averagePerTransaction = totalTransactions > 0 ? totalExpenses / totalTransactions : 0

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#F1FCF0] border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F1FCF0] border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">This Month</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${monthlyTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{currentMonthExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F1FCF0] border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Total count</p>
          </CardContent>
        </Card>

        <Card className="bg-[#F1FCF0] border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${averagePerTransaction.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-[#F1FCF0] border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? ((amount as number) / totalExpenses) * 100 : 0
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryColor(category)}>{category}</Badge>
                      <div className="flex-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">${(amount as number).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                )
              })}
          </div>

          {Object.keys(categoryTotals).length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No expenses yet. Add your first expense to see the breakdown!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card className="bg-[#F1FCF0] border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground mb-2 block">Filter by Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-card-foreground mb-2 block">Filter by Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedCategory("all")
                  setSelectedPeriod("all")
                }}
                className="bg-transparent"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}