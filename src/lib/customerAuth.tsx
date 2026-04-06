'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string | null
}

interface CustomerAuthContextType {
  customer: Customer | null
  loading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customer: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
})

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/customer/me')
      const data = await res.json()
      setCustomer(data.customer ?? null)
    } catch {
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/customer/logout', { method: 'POST' })
    setCustomer(null)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, refresh, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
