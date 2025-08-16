"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AddExpenseForm } from "@/components/add-expense-form"
import { ExpenseList } from "@/components/expense-list"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { Dashboard } from "@/components/dashboard"
import { useRouter } from "next/navigation"

// Interface for the API response (updated to allow data as array or single object)
export interface ExpenseResponse {
  success: boolean
  data: Expenses[] | Expenses // Flexible for list vs. single
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
  const router = useRouter()
  const [expenses, setExpenses] = useState<Expenses[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null) // Initialize to null for "not loaded"
  const [editingExpense, setEditingExpense] = useState<Expenses | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; expense: Expenses | null }>({
    open: false,
    expense: null,
  })

  // Combined useEffect for token handling and redirect (runs only on client)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Extra safety, though useEffect already skips server

    const jwt = localStorage.getItem('jwt');
    if (!jwt) {
      router.push('/');
      return;
    }

    setToken(jwt);
  }, [router]);

  // Fetch expenses only after token is set
  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  const fetchExpenses = async () => {
    if (!token) {
      setError("No token found, please login");
      console.error("No token found, please login");
      setLoading(false); // Ensure loading ends even on error
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized! Token may be expired. Please login again.");
          localStorage.removeItem("jwt");
          return;
        }
        throw new Error(`Failed to fetch expenses: ${response.statusText}`);
      }

      const data = await response.json();
      setExpenses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch expenses");
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (newExpense: Omit<Expenses, "_id" | "createdAt" | "updatedAt" | "__v">) => {
    if (!token) {
      setError("No token found, please login")
      return
    }

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ attach JWT
        },
        body: JSON.stringify(newExpense),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized! Token may be expired. Please login again.")
          localStorage.removeItem("jwt")
          return
        }
        throw new Error(`Failed to create expense: ${response.statusText}`)
      }

      const createdExpense: ExpenseResponse = await response.json()
      setExpenses((prev) => [...prev, createdExpense.data as Expenses]) // Treat data as single object
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create expense")
      console.error("Error creating expense:", err)
    }
  }

  const handleEditExpense = (expense: Expenses) => {
    setEditingExpense(expense)
  }

  const handleUpdateExpense = async (updatedExpense: Expenses) => {
    if (!token) {
      setError("No token found, please login")
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${updatedExpense._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ attach JWT
        },
        body: JSON.stringify(updatedExpense),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError("Unauthorized! Token may be expired. Please login again.")
          localStorage.removeItem("jwt")
          return
        }
        throw new Error(`Failed to update expense: ${response.statusText}`)
      }

      const updated: ExpenseResponse = await response.json()
      setExpenses((prev) => prev.map((expense) => (expense._id === (updated.data as Expenses)._id ? updated.data as Expenses : expense)))
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
    if (!token) {
      setError("No token found, please login")
      return
    }

    if (deleteDialog.expense) {
      try {
        const response = await fetch(`${API_BASE_URL}/${deleteDialog.expense._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ attach JWT
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError("Unauthorized! Token may be expired. Please login again.")
            localStorage.removeItem("jwt")
            return
          }
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

  // Add a check for token === null (initial client load state)
  if (token === null || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading...</div>
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