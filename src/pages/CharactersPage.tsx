import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout } from '../components/shared/Layout'
import { Spinner } from '../components/shared/Spinner'
import { charactersApi } from '../api/charactersApi'
import type { Character } from '../types'

const CLASS_ICONS: Record<string, string> = {
  fighter: '⚔️', wizard: '🧙', rogue: '🗡️', cleric: '✝️',
  ranger: '🏹', paladin: '🛡️', barbarian: '💪', bard: '🎵',
  druid: '🌿', monk: '👊', sorcerer: '✨', warlock: '👁️',
}

function hpColor(hp: number, max: number): string {
  const ratio = max > 0 ? hp / max : 0
  if (ratio > 0.5) return 'bg-[#2D6A4F]'
  if (ratio > 0.25) return 'bg-[#B8860B]'
  return 'bg-[#9B2335]'
}

function CharacterCard({ character, onLevelUp }: { character: Character; onLevelUp: (id: string) => void }) {
  const hpRatio = character.max_hit_points > 0
    ? character.hit_points / character.max_hit_points
    : 0
  const icon = CLASS_ICONS[character.class?.toLowerCase() ?? ''] ?? '🧝'

  return (
    <div className="bg-[#161B24] border border-[#2A3347] rounded-xl p-4 hover:border-[#C9963A]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1E2535] rounded-lg flex items-center justify-center text-xl">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-[#F0EBE1] text-sm">{character.name}</h3>
            <p className="text-xs text-[#8B9BB0]">
              {character.race}
              {character.subrace ? ` (${character.subrace})` : ''} •{' '}
              {character.class}
              {character.subclass ? ` – ${character.subclass}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs bg-[#1E2535] text-[#8B9BB0] px-2 py-0.5 rounded">
            Lv {character.level}
          </span>
          <span className="text-xs text-[#8B9BB0]">
            {character.ruleset}
          </span>
        </div>
      </div>

      <div className="flex gap-3 text-xs text-[#8B9BB0] mb-3">
        <span className="flex items-center gap-1">
          <span className="text-[#C9963A]">🛡</span> {character.armor_class} AC
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[#C9963A]">💨</span> {character.speed} ft
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-[#8B9BB0] mb-1">
          <span>HP</span>
          <span>{character.hit_points} / {character.max_hit_points}</span>
        </div>
        <div className="h-1.5 bg-[#1E2535] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${hpColor(character.hit_points, character.max_hit_points)}`}
            style={{ width: `${Math.max(0, Math.min(100, hpRatio * 100))}%` }}
          />
        </div>
      </div>

      {character.level < 20 && (
        <button
          onClick={() => onLevelUp(character.id)}
          className="mt-3 w-full py-1.5 rounded-lg border border-[#C9963A]/40 text-xs font-semibold text-[#C9963A] hover:bg-[#C9963A]/10 transition-colors"
        >
          ↑ Level Up
        </button>
      )}
    </div>
  )
}

export function CharactersPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    charactersApi.list()
      .then((res) => setCharacters(res.data))
      .catch((err) => setError(err.message ?? 'Failed to load characters'))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const msg = (location.state as { toast?: string } | null)?.toast
    if (msg) {
      setToast(msg)
      window.history.replaceState({}, '')
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto w-full">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#52B788] text-[#0D0F14] text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#F0EBE1]">Characters</h1>
            <p className="text-sm text-[#8B9BB0] mt-0.5">Your adventurers</p>
          </div>
          <button
            onClick={() => navigate('/characters/new')}
            className="px-4 py-2 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors"
          >
            + New Character
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size={32} />
          </div>
        )}

        {error && (
          <div className="bg-[#9B2335]/20 border border-[#9B2335]/50 rounded-xl px-4 py-3 text-sm text-[#FF6B6B]">
            {error}
          </div>
        )}

        {!isLoading && !error && characters.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🧝</div>
            <p className="text-[#8B9BB0] text-sm mb-4">No characters yet.</p>
            <button
              onClick={() => navigate('/characters/new')}
              className="px-5 py-2.5 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors"
            >
              Create Your First Character
            </button>
          </div>
        )}

        {!isLoading && !error && characters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((c) => (
              <CharacterCard key={c.id} character={c} onLevelUp={(id) => navigate(`/characters/${id}/level-up`)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
