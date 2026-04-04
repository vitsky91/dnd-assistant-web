import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { ALL_SKILLS, availableClassSkills } from '../../utils/characterCreation'

export function Step5_Skills() {
  const { gameClass, background, classSkills, setClassSkills } = useCharacterCreationStore()

  if (!gameClass) return null

  const bgSkills = new Set(background?.skill_proficiencies ?? [])
  const available = availableClassSkills(gameClass)
  const maxChoice = gameClass.skill_choices.count

  function toggleSkill(skillId: string) {
    if (bgSkills.has(skillId)) return // background skills are locked in
    if (classSkills.includes(skillId)) {
      setClassSkills(classSkills.filter((s) => s !== skillId))
    } else if (classSkills.length < maxChoice) {
      setClassSkills([...classSkills, skillId])
    }
  }

  const classChosen = classSkills.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8B9BB0]">
          Choose {maxChoice} skill{maxChoice !== 1 ? 's' : ''} from your class list.
        </p>
        <span className={`text-xs font-semibold ${classChosen === maxChoice ? 'text-[#52B788]' : 'text-[#8B9BB0]'}`}>
          {classChosen}/{maxChoice}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {ALL_SKILLS.map((skill) => {
          const fromBg = bgSkills.has(skill.id)
          const fromClass = classSkills.includes(skill.id)
          const isAvailable = available.includes(skill.id)
          const isSelected = fromBg || fromClass

          const canSelect = isAvailable && !fromBg && (fromClass || classChosen < maxChoice)

          return (
            <button
              key={skill.id}
              onClick={() => toggleSkill(skill.id)}
              disabled={!isAvailable && !fromBg}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors text-left ${
                fromBg
                  ? 'border-[#52B788]/40 bg-[#52B788]/10 cursor-default'
                  : isSelected
                  ? 'border-[#C9963A] bg-[#C9963A]/10'
                  : canSelect
                  ? 'border-[#2A3347] bg-[#161B24] hover:border-[#3A4357]'
                  : 'border-[#1A2030] bg-[#111520] opacity-40 cursor-not-allowed'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                fromBg ? 'border-[#52B788] bg-[#52B788]/20' :
                isSelected ? 'border-[#C9963A] bg-[#C9963A]' :
                'border-[#2A3347]'
              }`}>
                {isSelected && (
                  <span className="text-[9px] text-[#0D0F14] font-bold">✓</span>
                )}
              </div>
              <span className={`text-sm flex-1 ${isSelected ? 'text-[#F0EBE1]' : 'text-[#8B9BB0]'}`}>
                {skill.label}
              </span>
              <span className="text-xs text-[#4A5568]">{skill.stat.toUpperCase()}</span>
              {fromBg && <span className="text-[10px] text-[#52B788]">BG</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
