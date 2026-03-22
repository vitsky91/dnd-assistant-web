import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/shared/Spinner'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, isLoading, error, user, clearError } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0F14] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-2xl font-bold text-[#F0EBE1]">DnD Assistant</h1>
          <p className="text-[#8B9BB0] mt-1 text-sm">Sign in to your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#161B24] border border-[#2A3347] rounded-xl p-6 flex flex-col gap-4"
        >
          {error && (
            <div className="bg-[#9B2335]/20 border border-[#9B2335]/50 rounded-lg px-4 py-3 text-sm text-[#FF6B6B] flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="text-[#FF6B6B]/60 hover:text-[#FF6B6B] ml-2"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#8B9BB0]">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2.5 text-[#F0EBE1] placeholder-[#4A5568] text-sm outline-none focus:border-[#C9963A] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#8B9BB0]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-[#1E2535] border border-[#2A3347] rounded-lg px-3 py-2.5 text-[#F0EBE1] placeholder-[#4A5568] text-sm outline-none focus:border-[#C9963A] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 bg-[#C9963A] hover:bg-[#E8B84B] disabled:opacity-50 disabled:cursor-not-allowed text-[#0D0F14] font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Spinner size={16} /> : null}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-[#8B9BB0] mt-4">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#C9963A] hover:text-[#E8B84B] transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
