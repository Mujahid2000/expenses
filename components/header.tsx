import { redirect } from "next/navigation"
import { Button } from "./ui/button"

export function Header() {
    const logout = () =>{
        localStorage.removeItem('jwt')
    }

    if(!localStorage.getItem('jwt')){
      redirect('/')
    }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">$</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Expense Tracker</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Expenses
          </a>
          <Button onClick={logout}>Logout</Button>
        </nav>
      </div>
    </header>
  )
}
