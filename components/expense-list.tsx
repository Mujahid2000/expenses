"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

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

interface ExpenseListProps {
  expenses: Expenses[]
  onEditExpense?: (expense: Expenses) => void
  onDeleteExpense?: (_id: string) => void
}

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case "Food":
      return "bg-green-100 text-green-800 hover:bg-green-200"
    case "Transport":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    case "Shopping":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200"
    case "Others":
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
}

export function ExpenseList({ expenses, onEditExpense, onDeleteExpense }: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (expenses.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-foreground">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses yet. Add your first expense to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className=" border-border bg-[#F1FCF0]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mobile Card Layout */}
        <div className="space-y-4 md:hidden">
          {expenses.map((expense) => (
            <div key={expense._id} className="border border-border rounded-lg p-4 bg-background">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{expense.title}</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${expense.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge className={getCategoryBadgeColor(expense.category)}>{expense.category}</Badge>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditExpense?.(expense)}
                    className="h-8 w-8 p-0 hover:bg-accent"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteExpense?.(expense._id)}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-card-foreground">Title</th>
                  <th className="text-left py-3 px-2 font-medium text-card-foreground">Amount</th>
                  <th className="text-left py-3 px-2 font-medium text-card-foreground">Category</th>
                  <th className="text-left py-3 px-2 font-medium text-card-foreground">Date</th>
                  <th className="text-right py-3 px-2 font-medium text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-2 font-medium text-foreground">{expense.title}</td>
                    <td className="py-3 px-2 text-foreground">${expense.amount.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <Badge className={getCategoryBadgeColor(expense.category)}>{expense.category}</Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{formatDate(expense.date)}</td>
                    <td className="py-3 px-2">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditExpense?.(expense)}
                          className="h-8 w-8 p-0 hover:bg-accent"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteExpense?.(expense._id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}