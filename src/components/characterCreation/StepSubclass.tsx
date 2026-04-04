import { useCharacterCreationStore } from '../../stores/characterCreationStore'

export function StepSubclass() {
  const { gameClass, subclass, setSubclass } = useCharacterCreationStore()

  if (!gameClass) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#8B9BB0]">
        Choose your {gameClass.subclass_name}.
      </p>
      <div className="flex flex-col gap-2">
        {gameClass.subclasses.map((sc) => {
          const isSelected = subclass?.id === sc.id
          return (
            <button
              key={sc.id}
              onClick={() => setSubclass(sc)}
              className={`text-left px-4 py-3 rounded-xl border transition-colors ${
                isSelected
                  ? 'border-[#C9963A] bg-[#C9963A]/10'
                  : 'border-[#2A3347] bg-[#161B24] hover:border-[#3A4357]'
              }`}
            >
              <span className={`text-sm font-semibold ${isSelected ? 'text-[#C9963A]' : 'text-[#F0EBE1]'}`}>
                {sc.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
