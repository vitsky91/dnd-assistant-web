import type { useLevelUp } from '../../hooks/useLevelUp'

interface Props {
  lu: ReturnType<typeof useLevelUp>
}

export function LevelUp_SubclassStep({ lu }: Props) {
  const { gameClass, chosenSubclass, setChosenSubclass } = lu

  if (!gameClass) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#8B9BB0]">
        At level {lu.newLevel}, your {gameClass.name} chooses a {gameClass.subclass_name}.
      </p>
      <div className="flex flex-col gap-2">
        {gameClass.subclasses.map((sc) => {
          const isSelected = chosenSubclass === sc.id
          return (
            <button
              key={sc.id}
              onClick={() => setChosenSubclass(sc.id)}
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
