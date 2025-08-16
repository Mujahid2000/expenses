"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Dashboard } from "@/components/dashboard"

// Interface for the API response
export interface ExpenseResponse {
  success: boolean
  data: Expenses
}

// Interface for individual expense data
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

const API_BASE_URL = "https://expenss-server.vercel.app/expenses"

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expenses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expenses | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    expense: Expenses | null
  }>({ open: false, expense: null })

  useEffect(() => {
    fetchExpenses()
  }, [])

const fetchExpenses = async () => {
  const token = localStorage.getItem("jwt");

  if (!token) {
    setError("No token found, please login");
    console.error("No token found, please login");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const response = await fetch(`${API_BASE_URL}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // ✅ attach JWT
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized! Token may be expired. Please login again.");
      }
      throw new Error(`Failed to fetch expenses: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("API Response:", data);

    // If your backend returns { data: [...] }
    setExpenses(data.data);

    // If your backend just returns [...]
    // setExpenses(data);

  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to fetch expenses");
    console.error("Error fetching expenses:", err);
  } finally {
    setLoading(false);
  }
};


  const handleAddExpense = async (newExpense: Omit<Expenses, "_id" | "createdAt" | "updatedAt" | "__v">) => {
     const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ attach JWT
        },
        body: JSON.stringify(newExpense),
      })

      if (!response.ok) {
        throw new Error(`Failed to create expense: ${response.statusText}`)
      }

      const createdExpense: ExpenseResponse = await response.json()
      setExpenses((prev) => [...prev, createdExpense.data])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense")
      console.error("Error creating expense:", err)
    }
  }

  const handleEditExpense = (expense: Expenses) => {
    setEditingExpense(expense)
  }

  const handleUpdateExpense = async (updatedExpense: Expenses) => {
     const token = localStorage.getItem("jwt");
    try {
      const response = await fetch(`${API_BASE_URL}/${updatedExpense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ attach JWT
        },
        body: JSON.stringify(updatedExpense),
      })

      if (!response.ok) {
        throw new Error(`Failed to update expense: ${response.statusText}`)
      }

      const updated: ExpenseResponse = await response.json()
      setExpenses((prev) => prev.map((expense) => (expense._id === updated.data._id ? updated.data : expense)))
      setEditingExpense(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update expense")
      console.error("Error updating expense:", err)
    }
  }

  const handleCancelEdit = () => {
    setEditingExpense(null)
  }

  const handleDeleteExpense = (_id: string) => {
    const expense = expenses.find((exp) => exp._id === _id)
    if (expense) {
      setDeleteDialog({ open: true, expense })
    }
  }

  const confirmDelete = async () => {
     const token = localStorage.getItem("jwt");
    if (deleteDialog.expense) {
      try {
        const response = await fetch(`${API_BASE_URL}/${deleteDialog.expense._id}`, {
          method: "DELETE",
          headers: {
             "Authorization": `Bearer ${token}`, // ✅ attach JWT
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to delete expense: ${response.statusText}`)
        }

        setExpenses((prev) => prev.filter((expense) => expense._id !== deleteDialog.expense!._id))
        setDeleteDialog({ open: false, expense: null })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete expense")
        console.error("Error deleting expense:", err)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading expenses...</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive font-medium">Error: {error}</p>
            <button onClick={fetchExpenses} className="mt-2 text-sm text-destructive hover:underline">
              Try again
            </button>
          </div>
        )}

        <div className="mb-8">
          
          <Dashboard expenses={expenses} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <AddExpenseForm
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />

          <div className="lg:col-span-1">
            
            <ExpenseList expenses={expenses} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} />
          </div>
        </div>

        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ open, expense: null })}
          onConfirm={confirmDelete}
          expenseTitle={deleteDialog.expense?.title || ""}
        />
      </main>
    </div>
  )
}