import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { charactersApi } from '../api/charactersApi'
import { LevelUpWizardModal } from '../components/levelUp/LevelUpWizardModal'
import { Spinner } from '../components/shared/Spinner'
import type { Character } from '../types'

export function LevelUpPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    charactersApi.get(id)
      .then((res) => setCharacter(res.data))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load character'))
      .finally(() => setLoading(false))
  }, [id])

  function handleDone(success: boolean) {
    navigate('/characters', { state: success ? { toast: 'Level up saved!' } : undefined })
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0F14]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A3347] shrink-0">
        <button onClick={() => navigate('/characters')} className="text-[#8B9BB0] hover:text-[#F0EBE1] text-sm">←</button>
        <span className="text-sm font-semibold text-[#F0EBE1]">
          {character ? `${character.name} — Level Up` : 'Level Up'}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex justify-center py-20"><Spinner size={32} /></div>
        )}
        {error && (
          <div className="p-6 text-sm text-[#FF6B6B]">{error}</div>
        )}
        {!loading && !error && character && character.level >= 20 && (
          <div className="flex flex-col items-center py-20 gap-3">
            <span className="text-5xl">🏆</span>
            <p className="text-[#8B9BB0] text-sm">Already at max level!</p>
          </div>
        )}
        {!loading && !error && character && character.level < 20 && (
          <LevelUpWizardModal character={character} onDone={handleDone} />
        )}
      </div>
    </div>
  )
}
