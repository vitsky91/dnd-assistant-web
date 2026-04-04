import { useCharacterCreationStore } from '../../stores/characterCreationStore'
import { ALIGNMENTS, abilityModifier, STAT_KEYS, STAT_LABELS, proficiencyBonus } from '../../utils/characterCreation'

export function Step6_Details() {
  const store = useCharacterCreationStore()
  const { name, alignment, personalityTraits, ideals, bonds, flaws, setDetails } = store

  const finalScores = store.getFinalScores()
  const cls = store.gameClass
  const hitDieFaces = cls ? parseInt(cls.hit_die.replace('d', ''), 10) : 8
  const conMod = abilityModifier(finalScores.con)
  const maxHp = Math.max(1, hitDieFaces + conMod)
  const pb = proficiencyBonus(1)

  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#8B9BB0]">Character Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setDetails({ name: e.target.value })}
          placeholder="Enter name…"
          className="bg-[#0D0F14] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] placeholder-[#4A5568] focus:outline-none focus:border-[#C9963A]"
        />
      </div>

      {/* Alignment */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-[#8B9BB0]">Alignment</label>
        <select
          value={alignment}
          onChange={(e) => setDetails({ alignment: e.target.value })}
          className="bg-[#0D0F14] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] focus:outline-none focus:border-[#C9963A]"
        >
          <option value="">— none —</option>
          {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Personality */}
      {([
        { key: 'personalityTraits' as const, label: 'Personality Traits', placeholder: 'How do others see you?' },
        { key: 'ideals' as const, label: 'Ideals', placeholder: 'What do you believe in?' },
        { key: 'bonds' as const, label: 'Bonds', placeholder: 'What ties you to the world?' },
        { key: 'flaws' as const, label: 'Flaws', placeholder: 'What are your weaknesses?' },
      ]).map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#8B9BB0]">{label}</label>
          <textarea
            value={store[key]}
            onChange={(e) => setDetails({ [key]: e.target.value })}
            placeholder={placeholder}
            rows={2}
            className="bg-[#0D0F14] border border-[#2A3347] rounded-lg px-3 py-2 text-sm text-[#F0EBE1] placeholder-[#4A5568] focus:outline-none focus:border-[#C9963A] resize-none"
          />
        </div>
      ))}

      {/* Stats preview */}
      <div className="bg-[#161B24] rounded-xl border border-[#2A3347] p-4">
        <h4 className="text-xs font-semibold text-[#8B9BB0] mb-3">Character Preview</h4>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {STAT_KEYS.map((stat) => {
            const val = finalScores[stat]
            const mod = abilityModifier(val)
            return (
              <div key={stat} className="flex flex-col items-center bg-[#0D0F14] rounded-lg px-2 py-2">
                <span className="text-[10px] text-[#8B9BB0]">{STAT_LABELS[stat]}</span>
                <span className="text-base font-bold text-[#F0EBE1]">{val}</span>
                <span className="text-[10px] text-[#8B9BB0]">{mod >= 0 ? '+' : ''}{mod}</span>
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 text-xs text-[#8B9BB0]">
          <span>HP: <b className="text-[#F0EBE1]">{maxHp}</b></span>
          <span>AC: <b className="text-[#F0EBE1]">{10 + abilityModifier(finalScores.dex)}</b></span>
          <span>PB: <b className="text-[#F0EBE1]">+{pb}</b></span>
          <span>Speed: <b className="text-[#F0EBE1]">{store.race?.speed ?? 30}ft</b></span>
        </div>
      </div>
    </div>
  )
}
