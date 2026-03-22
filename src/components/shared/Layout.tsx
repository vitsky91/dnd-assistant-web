import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface Props {
  children: React.ReactNode
}

export function Layout({ children }: Props) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0F14]">
      <header className="flex items-center justify-between px-6 py-3 bg-[#161B24] border-b border-[#2A3347]">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-[#C9963A] text-xl font-bold">⚔</span>
          <span className="text-[#F0EBE1] font-semibold text-base tracking-wide">DnD Assistant</span>
        </Link>

        {user && (
          <nav className="flex items-center gap-1">
            <Link
              to="/characters"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive('/characters')
                  ? 'bg-[#C9963A]/20 text-[#C9963A]'
                  : 'text-[#8B9BB0] hover:text-[#F0EBE1]'
              }`}
            >
              Characters
            </Link>
            <Link
              to="/campaigns"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive('/campaigns')
                  ? 'bg-[#C9963A]/20 text-[#C9963A]'
                  : 'text-[#8B9BB0] hover:text-[#F0EBE1]'
              }`}
            >
              Campaigns
            </Link>
            <Link
              to="/maps"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive('/maps')
                  ? 'bg-[#C9963A]/20 text-[#C9963A]'
                  : 'text-[#8B9BB0] hover:text-[#F0EBE1]'
              }`}
            >
              Maps
            </Link>
          </nav>
        )}

        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[#8B9BB0]">{user.username}</span>
            {user.role === 'admin' && (
              <span className="text-xs bg-[#9B2335]/30 text-[#FF6B6B] px-2 py-0.5 rounded">
                Admin
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-[#8B9BB0] hover:text-[#F0EBE1] transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  )
}
