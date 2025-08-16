"use client"

import React, { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Zap } from "lucide-react"
import { toast, Toaster } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"


type Theme = {
  name: string
  icon: React.ComponentType<{ className?: string }>
  bg: string
  cardBg: string
  text: string
  accent: string
  border: string
  button: string
  input: string
  themeButton: string
}

const theme: Theme = {
  name: "Cyberpunk",
  icon: Zap,
  bg: "bg-gray-900",
  cardBg: "bg-black",
  text: "text-green-400",
  accent: "text-cyan-400",
  border: "border-green-400",
  button: "bg-green-400 text-black hover:bg-green-300",
  input: "border-green-400 bg-black text-green-400 focus:ring-green-400",
  themeButton: "bg-gray-800 hover:bg-gray-700 text-green-400",
}

interface FormData {
  email: string
  password: string
  name?: string // Optional for login
  confirmPassword?: string
}

interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name: string
  }
  message?: string
}

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const handleLogin = async (data: FormData) => {
    try {
      const response = await axios.post<AuthResponse>("https://expenss-server.vercel.app/auth/login", {
        email: data.email,
        password: data.password,
      })
      if (response.data.success) {
        localStorage.setItem("jwt", response.data.token!)
        toast.success("Login successful!")
        router.push("/dashboard")
      } else {
        throw new Error(response.data.message || "Login failed")
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "An unexpected error occurred"
      toast.error(errorMessage)
    }
  }

  const handleSignup = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      throw new Error("Passwords do not match")
    }
    try {
      const response = await axios.post<AuthResponse>("https://expenss-server.vercel.app/auth/register", {
        email: data.email,
        password: data.password,
        name: data.name,
      })
      if (response.data.success) {
        toast.success("Signup successful!")
        reset()
        setIsLogin(true)
      } else {
        throw new Error(response.data.message || "Signup failed")
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : "An unexpected error occurred"
      toast.error(errorMessage)
    }
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true)
    try {
      if (isLogin) {
        await handleLogin(data)
      } else {
        await handleSignup(data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin((prev) => !prev)
    reset({ name: "", email: "", password: "", confirmPassword: "" }) // Explicitly reset all fields
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ease-in-out ${theme.bg} ${theme.text} font-mono`}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card
          className={`w-full max-w-md ${theme.cardBg} ${theme.border} border-2 transition-all duration-500 ease-in-out transform`}
        >
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl font-bold ${theme.text} transition-colors duration-300`}>
              {isLogin ? "LOGIN" : "SIGNUP"}
            </CardTitle>
            <CardDescription className={`${theme.accent} transition-colors duration-300`}>
              {isLogin ? "Access your account" : "Create new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                  <Label htmlFor="name" className={theme.text}>
                    NAME
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    {...register("name", { required: !isLogin })}
                    className={`${theme.input} transition-all duration-300 focus:scale-105`}
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className={theme.text}>
                  EMAIL
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })}
                  className={`${theme.input} transition-all duration-300 focus:scale-105`}
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {errors.email.type === "required" ? "Email is required" : "Invalid email format"}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={theme.text}>
                  PASSWORD
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", { required: true, minLength: 6 })}
                    className={`${theme.input} pr-10 transition-all duration-300 focus:scale-105`}
                    placeholder="Enter password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-0 top-0 h-full px-3 ${theme.text} hover:bg-transparent`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.type === "required"
                      ? "Password is required"
                      : "Password must be at least 6 characters"}
                  </p>
                )}
              </div>
              {!isLogin && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                  <Label htmlFor="confirmPassword" className={theme.text}>
                    CONFIRM PASSWORD
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword", {
                      required: !isLogin,
                      validate: (val) => val === watch("password") || "Passwords do not match",
                    })}
                    className={`${theme.input} transition-all duration-300 focus:scale-105`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                </div>
              )}
              <Button
                type="submit"
                className={`w-full ${theme.button} transition-all duration-300 hover:scale-105 active:scale-95`}
                disabled={isLoading}
              >
                {isLoading ? "PROCESSING..." : isLogin ? "LOGIN" : "CREATE ACCOUNT"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={toggleMode}
                className={`${theme.text} hover:bg-transparent transition-all duration-300 hover:scale-105`}
                disabled={isLoading}
              >
                {isLogin ? "Don't have an account? SIGNUP" : "Already have an account? LOGIN"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-10 left-10 w-4 h-4 ${theme.border} border-2 animate-pulse`} />
        <div className={`absolute top-20 right-20 w-6 h-6 ${theme.border} border-2 animate-bounce`} />
        <div className={`absolute bottom-20 left-20 w-3 h-3 ${theme.border} border-2 animate-ping`} />
        <div className={`absolute bottom-10 right-10 w-5 h-5 ${theme.border} border-2 animate-pulse`} />
      </div>
      <Toaster richColors />
    </div>
  )
}