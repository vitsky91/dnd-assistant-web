import { Spinner } from '../shared/Spinner'
import type { Character } from '../../types'
import { useLevelUp } from '../../hooks/useLevelUp'

import { LevelUp_ConfirmStep }    from './LevelUp_ConfirmStep'
import { LevelUp_HitPointsStep }  from './LevelUp_HitPointsStep'
import { LevelUp_FeaturesStep }   from './LevelUp_FeaturesStep'
import { LevelUp_SubclassStep }   from './LevelUp_SubclassStep'
import { LevelUp_SpellSlotsStep } from './LevelUp_SpellSlotsStep'
import { LevelUp_SpellsStep }     from './LevelUp_SpellsStep'
import { LevelUp_ASIStep }        from './LevelUp_ASIStep'
import { LevelUp_SummaryStep }    from './LevelUp_SummaryStep'

interface Props {
  character: Character
  onDone: (success: boolean) => void
}

export function LevelUpWizardModal({ character, onDone }: Props) {
  const lu = useLevelUp(character)
  const { activeSteps, stepIndex, currentStep, isFirst, isLast, isStepValid, goNext, goBack, submitting, submitError, handleSubmit } = lu

  async function onSubmit() {
    const ok = await handleSubmit()
    if (ok) onDone(true)
  }

  function renderStep() {
    const id = currentStep?.id
    if (!id) return null
    if (id === 'confirm')     return <LevelUp_ConfirmStep character={character} lu={lu} />
    if (id === 'hit_points')  return <LevelUp_HitPointsStep character={character} lu={lu} />
    if (id === 'features')    return <LevelUp_FeaturesStep lu={lu} />
    if (id === 'subclass')    return <LevelUp_SubclassStep lu={lu} />
    if (id === 'spell_slots') return <LevelUp_SpellSlotsStep character={character} lu={lu} />
    if (id === 'spells')      return <LevelUp_SpellsStep lu={lu} />
    if (id === 'cantrips')    return <LevelUp_SpellsStep lu={lu} isCantrips />
    if (id === 'asi')         return <LevelUp_ASIStep character={character} lu={lu} />
    if (id === 'summary')     return <LevelUp_SummaryStep character={character} lu={lu} />
    return null
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex gap-1 px-6 py-4 shrink-0">
        {activeSteps.map((step, i) => (
          <div key={step.id} className="flex-1">
            <div className={`h-1 w-full rounded-full transition-colors ${
              i < stepIndex ? 'bg-[#C9963A]' :
              i === stepIndex ? 'bg-[#E8B84B]' :
              'bg-[#2A3347]'
            }`} />
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="px-6 pb-2 shrink-0">
        <p className="text-xs text-[#8B9BB0]">Step {stepIndex + 1} of {activeSteps.length}</p>
        <h2 className="text-lg font-bold text-[#F0EBE1]">{currentStep?.title}</h2>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {renderStep()}
      </div>

      {/* Error */}
      {submitError && (
        <div className="mx-6 mb-2 px-4 py-2 text-xs text-[#FF6B6B] bg-[#9B2335]/20 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 px-6 py-4 border-t border-[#2A3347] shrink-0">
        <button
          onClick={goBack}
          disabled={isFirst}
          className="flex-1 py-2.5 rounded-xl border border-[#2A3347] text-sm font-semibold text-[#8B9BB0] hover:text-[#F0EBE1] hover:border-[#3A4357] transition-colors disabled:opacity-30"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Spinner size={14} /> : null}
            Level Up!
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!isStepValid()}
            className="flex-1 py-2.5 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
