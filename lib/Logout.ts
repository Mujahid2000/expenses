// logout-utils.ts
import { useRouter } from "next/navigation"

export const useLogout = () => {
  const router = useRouter()

  const handleLogout = () => {
    try {
      localStorage.removeItem("jwt")
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
      // Optionally add a toast or state update for error handling
    }
  }

  return { handleLogout }
}