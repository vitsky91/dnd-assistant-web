import { useNavigate } from 'react-router-dom'
import { CreationWizard } from '../components/characterCreation/CreationWizard'
import { useCharacterCreationStore } from '../stores/characterCreationStore'

export function CharacterCreationPage() {
  const navigate = useNavigate()
  const reset = useCharacterCreationStore((s) => s.reset)

  function handleBack() {
    reset()
    navigate('/characters')
  }

  return (
    <div className="flex flex-col h-screen bg-[#0D0F14]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2A3347] shrink-0">
        <button onClick={handleBack} className="text-[#8B9BB0] hover:text-[#F0EBE1] text-sm">←</button>
        <span className="text-sm font-semibold text-[#F0EBE1]">New Character</span>
      </div>

      {/* Wizard fills remaining height */}
      <div className="flex-1 overflow-hidden">
        <CreationWizard />
      </div>
    </div>
  )
}
