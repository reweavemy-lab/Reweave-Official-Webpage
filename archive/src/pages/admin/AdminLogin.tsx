import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { Toaster, toast } from 'sonner'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/admin/auth/login', formData)
      
      if ((response as any).success) {
        const { data } = response as any
        
        // Store admin token
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminRefreshToken', data.refreshToken)
        localStorage.setItem('adminRole', data.role)
        
        toast.success('Admin login successful!')
        navigate('/admin/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-navy-800 to-terracotta-800 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #1A2741 0%, #0E1824 50%, #8C4B36 100%)'
    }}>
      <Toaster position="top-right" />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-4 border-gold" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C4A96A\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        backgroundSize: '60px 60px'
      }}>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-sage to-gold rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-indigo mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Admin Portal
          </h1>
          <p className="text-pebble">Reweave Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-indigo mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent transition-colors"
              placeholder="admin@reweave.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-indigo mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent transition-colors"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-sage to-gold text-white py-3 px-4 rounded-lg font-medium hover:from-terracotta hover:to-gold focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sage hover:text-terracotta text-sm font-medium">
            Back to Website
          </a>
        </div>
      </div>
    </div>
  )
}