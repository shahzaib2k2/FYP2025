"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// ✅ Configure axios for session-based auth
const API = axios.create({
  baseURL: "http://localhost:3000", // Adjust if needed
  withCredentials: true             // ✅ Always send cookies (sessions)
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await API.get("/auth/user")
      if (response.data.loggedIn) {
        setUser(response.data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await API.post("/login", { email, password })
      toast.success(response.data.message)
      await checkAuthStatus()
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const signup = async (name, email, password) => {
    try {
      const response = await API.post("/signup", { full_name: name, email, password })
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Signup failed"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await API.post("/logout")
      setUser(null)
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Logout failed")
    }
  }

  const forgotPassword = async (email) => {
    try {
      await API.post("/forgot-password", { email })
      toast.success("Password reset email sent")
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send reset email"
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const response = await API.post('/api/reset-password', {
        token,
        password,
        confirmPassword
      });
      toast.success(response.data.message)
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reset password"
      console.error('Password reset error:', error)
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}