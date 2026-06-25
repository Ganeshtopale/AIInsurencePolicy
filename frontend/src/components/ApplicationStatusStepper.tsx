import { Check, X } from 'lucide-react'

const MAIN_STEPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
]

interface Props {
  status: string
  interactive?: boolean
  onUpdate?: (status: string) => void
  updating?: boolean
}

type StepState = 'completed' | 'current' | 'upcoming' | 'dim' | 'hired-active' | 'rejected-active'

export default function ApplicationStatusStepper({ status, interactive, onUpdate, updating }: Props) {
  const isRejected = status === 'rejected'
  const isHired = status === 'hired'
  const currentIdx = MAIN_STEPS.findIndex((s) => s.key === status)

  function getState(key: string, idx: number): StepState {
    const isMain = idx >= 0
    if (key === 'hired') {
      if (isHired) return 'hired-active'
      if (isRejected) return 'dim'
      if (currentIdx === MAIN_STEPS.length - 1) return 'completed'
      return 'upcoming'
    }
    if (key === 'rejected') {
      if (isRejected) return 'rejected-active'
      return 'dim'
    }
    if (!isMain) return 'dim'
    if (isRejected) return 'dim'
    if (idx === currentIdx) return 'current'
    if (idx < currentIdx) return 'completed'
    return 'upcoming'
  }

  function circleClasses(state: StepState) {
    switch (state) {
      case 'completed': return 'bg-green-500 text-white'
      case 'current': return 'ring-2 ring-blue-500 ring-offset-2 bg-blue-500 text-white'
      case 'hired-active': return 'ring-2 ring-green-500 ring-offset-2 bg-green-500 text-white'
      case 'rejected-active': return 'ring-2 ring-red-500 ring-offset-2 bg-red-500 text-white'
      case 'dim': return 'bg-gray-100 text-gray-300'
      default: return 'bg-gray-200 text-gray-400'
    }
  }

  function labelClasses(state: StepState) {
    switch (state) {
      case 'completed': return 'text-green-600'
      case 'current': return 'text-blue-600 font-semibold'
      case 'hired-active': return 'text-green-600 font-semibold'
      case 'rejected-active': return 'text-red-600 font-semibold'
      default: return 'text-gray-400'
    }
  }

  function connectorActive(state: StepState) {
    return state === 'completed'
  }

  function renderCircleContent(key: string, state: StepState, idx: number) {
    if (key === 'hired') {
      if (state === 'hired-active' || state === 'completed') return <Check className="h-4 w-4" />
      return <span className="text-[10px] font-bold">H</span>
    }
    if (key === 'rejected') {
      if (state === 'rejected-active') return <X className="h-4 w-4" />
      return <span className="text-[10px] font-bold">R</span>
    }
    if (state === 'completed') return <Check className="h-4 w-4" />
    return <span className="text-xs font-bold">{idx + 1}</span>
  }

  function renderNode(key: string, label: string, state: StepState, idx: number, showAsButton: boolean) {
    const node = (
      <div className="flex flex-col items-center">
        <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all ${circleClasses(state)}`}>
          {renderCircleContent(key, state, idx)}
        </div>
        <span className={`mt-1.5 text-[10px] font-medium whitespace-nowrap ${labelClasses(state)}`}>
          {label}
        </span>
      </div>
    )

    if (showAsButton) {
      return (
        <button
          onClick={() => onUpdate?.(key)}
          disabled={updating}
          title={label}
          className="flex flex-col items-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {node}
        </button>
      )
    }
    return node
  }

  function renderConnector(prevState: StepState) {
    return <div className={`flex-1 h-0.5 min-w-[8px] mx-0.5 ${connectorActive(prevState) ? 'bg-green-400' : 'bg-gray-200'}`} />
  }

  return (
    <div className="w-full overflow-x-auto py-1">
      <div className="flex items-center min-w-max px-1">
        {MAIN_STEPS.map((step, idx) => {
          const s = getState(step.key, idx)
          return (
            <div key={step.key} className="flex items-center flex-1">
              {renderNode(step.key, step.label, s, idx, !!interactive)}
              {idx < MAIN_STEPS.length - 1 && renderConnector(s)}
            </div>
          )
        })}

        {/* Vertical fork: Hired / Rejected */}
        <div className="flex flex-col gap-1.5 ml-1.5">
          {(['hired', 'rejected'] as const).map((key) => {
            const s = getState(key, -1)
            const showAsButton = !!interactive && !updating
            const label = key === 'hired' ? 'Hired' : 'Rejected'
            const node = (
              <div className="flex flex-col items-center">
                <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all ${circleClasses(s)}`}>
                  {renderCircleContent(key, s, -1)}
                </div>
                <span className={`mt-1 text-[10px] font-medium whitespace-nowrap ${labelClasses(s)}`}>
                  {label}
                </span>
              </div>
            )

            if (showAsButton) {
              return (
                <button
                  key={key}
                  onClick={() => onUpdate?.(key)}
                  disabled={updating}
                  title={label}
                  className="flex flex-col items-center hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {node}
                </button>
              )
            }
            return <div key={key}>{node}</div>
          })}
        </div>
      </div>
    </div>
  )
}
