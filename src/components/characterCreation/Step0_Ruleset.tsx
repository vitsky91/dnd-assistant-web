import { useCharacterCreationStore } from '../../stores/characterCreationStore'

export function Step0_Ruleset() {
  const { ruleset, setRuleset } = useCharacterCreationStore()

  const options = [
    {
      id: '2014' as const,
      label: 'D&D 5e (2014)',
      description: 'Player\'s Handbook 2014. Fixed racial stat bonuses. Classic system.',
    },
    {
      id: '2024' as const,
      label: 'D&D 5e (2024)',
      description: 'Player\'s Handbook 2024. Free ability score improvements. Updated rules.',
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#8B9BB0]">Choose the edition rules for this character.</p>
      <div className="flex flex-col gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setRuleset(opt.id)}
            className={`text-left px-4 py-4 rounded-xl border transition-colors ${
              ruleset === opt.id
                ? 'border-[#C9963A] bg-[#C9963A]/10'
                : 'border-[#2A3347] bg-[#161B24] hover:border-[#3A4357]'
            }`}
          >
            <div className={`font-semibold text-sm ${ruleset === opt.id ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
              {opt.label}
            </div>
            <div className="text-xs text-[#8B9BB0] mt-1">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
