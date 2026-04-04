import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacterCreationStore, buildCharacterPayload } from '../../stores/characterCreationStore'
import { charactersApi } from '../../api/charactersApi'
import { gameDataApi } from '../../api/gameDataApi'
import { Spinner } from '../shared/Spinner'
import { POINT_BUY_BUDGET, pointBuySpent } from '../../utils/characterCreation'

import { Step0_Ruleset }       from './Step0_Ruleset'
import { Step1_Race }          from './Step1_Race'
import { Step2_Class }         from './Step2_Class'
import { StepSubclass }        from './StepSubclass'
import { Step3_Background }    from './Step3_Background'
import { Step4_AbilityScores } from './Step4_AbilityScores'
import { Step5_Skills }        from './Step5_Skills'
import { StepStartingSpells }  from './StepStartingSpells'
import { Step6_Details }       from './Step6_Details'

interface StepDef {
  id: string
  title: string
  component: React.ComponentType
  isValid: (state: ReturnType<typeof useCharacterCreationStore.getState>) => boolean
}

const STEPS: StepDef[] = [
  {
    id: 'ruleset',
    title: 'Ruleset',
    component: Step0_Ruleset,
    isValid: () => true,
  },
  {
    id: 'race',
    title: 'Race',
    component: Step1_Race,
    isValid: (s) => {
      if (!s.race) return false
      if (s.race.subraces.length > 0 && !s.subrace) return false
      return true
    },
  },
  {
    id: 'class',
    title: 'Class',
    component: Step2_Class,
    isValid: (s) => !!s.gameClass,
  },
  {
    id: 'subclass',
    title: 'Subclass',
    component: StepSubclass,
    isValid: (s) => !!s.subclass,
    // Conditional: only if subclass_level === 1
  },
  {
    id: 'background',
    title: 'Background',
    component: Step3_Background,
    isValid: (s) => !!s.background,
  },
  {
    id: 'ability_scores',
    title: 'Ability Scores',
    component: Step4_AbilityScores,
    isValid: (s) => {
      if (s.abilityMethod === 'standard_array') {
        return Object.values(s.arrayAssignment).every((v) => v !== null)
      }
      if (s.abilityMethod === 'point_buy') {
        return pointBuySpent(s.baseScores) <= POINT_BUY_BUDGET
      }
      return true
    },
  },
  {
    id: 'skills',
    title: 'Skills',
    component: Step5_Skills,
    isValid: (s) => {
      if (!s.gameClass) return false
      return s.classSkills.length === s.gameClass.skill_choices.count
    },
  },
  {
    id: 'spells',
    title: 'Starting Spells',
    component: StepStartingSpells,
    isValid: () => true, // spells are optional
    // Conditional: only if spellcasting class
  },
  {
    id: 'details',
    title: 'Details',
    component: Step6_Details,
    isValid: (s) => s.name.trim().length > 0,
  },
]

export function CreationWizard() {
  const navigate = useNavigate()
  const store = useCharacterCreationStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Build the active step list based on conditions
  const activeSteps = STEPS.filter((step) => {
    if (step.id === 'subclass') return store.gameClass?.subclass_level === 1
    if (step.id === 'spells') return !!store.gameClass?.spellcasting
    return true
  })

  const currentStep = activeSteps[stepIndex]
  const StepComponent = currentStep?.component
  const isValid = currentStep?.isValid(store) ?? false
  const isLast = stepIndex === activeSteps.length - 1
  const isFirst = stepIndex === 0

  function goNext() {
    if (stepIndex < activeSteps.length - 1) setStepIndex((i) => i + 1)
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1)
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildCharacterPayload(store)
      const res = await charactersApi.create(payload as Parameters<typeof charactersApi.create>[0])
      const characterId = (res as { data: { id: string } }).data.id

      // Add spells if any
      const spellIds = [
        ...store.chosenCantrips.map((s) => s.id),
        ...store.chosenSpells.map((s) => s.id),
      ]
      if (spellIds.length > 0) {
        await gameDataApi.addSpellsBatch(characterId, spellIds)
      }

      store.reset()
      navigate('/characters', { state: { toast: 'Character created!' } })
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create character')
    } finally {
      setSubmitting(false)
    }
  }, [store, navigate])

  if (!currentStep) return null

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="flex gap-1 px-6 py-4 shrink-0">
        {activeSteps.map((step, i) => (
          <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1 w-full rounded-full transition-colors ${
              i < stepIndex ? 'bg-[#C9963A]' :
              i === stepIndex ? 'bg-[#E8B84B]' :
              'bg-[#2A3347]'
            }`} />
          </div>
        ))}
      </div>

      {/* Step title */}
      <div className="px-6 pb-2 shrink-0">
        <p className="text-xs text-[#8B9BB0]">Step {stepIndex + 1} of {activeSteps.length}</p>
        <h2 className="text-lg font-bold text-[#F0EBE1]">{currentStep.title}</h2>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <StepComponent />
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="px-6 py-2 text-xs text-[#FF6B6B] bg-[#9B2335]/20 mx-6 rounded-lg">
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
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="flex-1 py-2.5 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {submitting ? <Spinner size={14} /> : null}
            Create Character
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!isValid}
            className="flex-1 py-2.5 rounded-xl bg-[#C9963A] text-[#0D0F14] text-sm font-semibold hover:bg-[#E8B84B] transition-colors disabled:opacity-40"
          >
            Next
          </button>
        )}
      </div>
    </div>
  )
}
