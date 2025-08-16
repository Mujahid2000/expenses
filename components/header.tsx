"use client"


import { useEffect } from "react"
import { Button } from "./ui/button"
import { useLogout } from "@/lib/Logout"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()
  const { handleLogout } = useLogout()

useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("jwt")) {
      router.push("/")
    }
  }, [router])


  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2" role="img" aria-label="Expense Tracker Logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">$</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6" role="navigation">
          <p
            
            className="text-sm cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Go to Dashboard"
          >
            Dashboard
          </p>
          <p
           
            className="text-sm cursor-pointer font-medium text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View Expenses"
          >
            Expenses
          </p>
          <Button onClick={handleLogout} aria-label="Logout">
            Logout
          </Button>
        </nav>
      </div>
    </header>
  )
}