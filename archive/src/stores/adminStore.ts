import { create } from 'zustand'

interface Admin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'founder' | 'admin' | 'manager'
  permissions: string[]
}

interface AdminState {
  admin: Admin | null
  isAuthenticated: boolean
  isLoading: boolean
  setAdmin: (admin: Admin | null) => void
  setIsAuthenticated: (isAuthenticated: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: false,
  
  setAdmin: (admin) => set({ admin }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminRole')
    set({ 
      admin: null, 
      isAuthenticated: false 
    })
  }
}))