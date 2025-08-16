"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface category {
    category : "Food" | "Transport" | "Shopping" | "Others" | ""
}

interface AddExpenseFormProps {
  onAddExpense: (expense: Omit<Expenses, "_id" | "createdAt" | "updatedAt" | "__v">) => void
  onUpdateExpense?: (expense: Expenses) => Promise<void> // Updated to handle async
  editingExpense?: Expenses | null
  onCancelEdit?: () => void
}

export function AddExpenseForm({ onAddExpense, onUpdateExpense, editingExpense, onCancelEdit }: AddExpenseFormProps) {
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title)
      setAmount(editingExpense.amount.toString())
      setCategory(editingExpense.category)
      setDate(editingExpense.date)
    } else {
      // Reset form when not editing
      setTitle("")
      setAmount("")
      setCategory("")
      setDate(new Date().toISOString().split("T")[0])
    }
  }, [editingExpense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !amount || !category || !date) {
      return
    }

    const expenseData: Omit<Expenses, "_id" | "createdAt" | "updatedAt" | "__v"> = {
      title,
      amount: Number.parseFloat(amount),
      category: category as "Food" | "Transport" | "Shopping" | "Others",
      date,
    }

    if (editingExpense && onUpdateExpense) {
      await onUpdateExpense({
        ...expenseData,
        _id: editingExpense._id,
        createdAt: editingExpense.createdAt,
        updatedAt: editingExpense.updatedAt,
        __v: editingExpense.__v,
      })
      onCancelEdit?.()
    } else {
      onAddExpense(expenseData)
    }

    // Reset form
    setTitle("")
    setAmount("")
    setCategory("")
    setDate(new Date().toISOString().split("T")[0])
  }

  const handleCancel = () => {
    onCancelEdit?.()
    // Reset form
    setTitle("")
    setAmount("")
    setCategory("")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Card className="bg-[#F1FCF0] border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-card-foreground">
          {editingExpense ? "Edit Expense" : "Add New Expense"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-card-foreground">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter expense title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-card-foreground">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-card-foreground">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Transport">Transport</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
                <SelectItem value="Others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-card-foreground">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
              {editingExpense ? "Update Expense" : "Add Expense"}
            </Button>
            {editingExpense && (
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}