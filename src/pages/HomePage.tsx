import { Link } from 'react-router-dom'
import { Layout } from '../components/shared/Layout'
import { useAuthStore } from '../stores/authStore'

export function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        <div className="text-6xl mb-4">⚔️</div>
        <h1 className="text-2xl font-bold text-[#F0EBE1] mb-2">
          Welcome, {user?.username ?? 'Adventurer'}!
        </h1>
        <p className="text-[#8B9BB0] text-sm mb-8 max-w-sm">
          Manage your characters, design battle maps, and run live combat sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <Link
            to="/characters"
            className="bg-[#161B24] border border-[#2A3347] rounded-xl p-5 hover:border-[#C9963A]/50 transition-colors text-left group"
          >
            <div className="text-3xl mb-3">🧝</div>
            <h3 className="font-semibold text-[#F0EBE1] text-sm mb-1">Characters</h3>
            <p className="text-xs text-[#8B9BB0]">View your adventurers</p>
          </Link>

          <Link
            to="/campaigns"
            className="bg-[#161B24] border border-[#2A3347] rounded-xl p-5 hover:border-[#C9963A]/50 transition-colors text-left group"
          >
            <div className="text-3xl mb-3">⚔️</div>
            <h3 className="font-semibold text-[#F0EBE1] text-sm mb-1">Campaigns</h3>
            <p className="text-xs text-[#8B9BB0]">Manage your campaigns</p>
          </Link>

          <Link
            to="/maps"
            className="bg-[#161B24] border border-[#2A3347] rounded-xl p-5 hover:border-[#C9963A]/50 transition-colors text-left group"
          >
            <div className="text-3xl mb-3">🗺️</div>
            <h3 className="font-semibold text-[#F0EBE1] text-sm mb-1">Battle Maps</h3>
            <p className="text-xs text-[#8B9BB0]">Design and run combat</p>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
