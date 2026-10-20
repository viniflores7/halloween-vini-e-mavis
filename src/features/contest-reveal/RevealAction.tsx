import { contestRevealContent as copy } from '@/content/contestReveal'
import { describeError } from '@/content/errors'
import { useAsyncAction } from '@/shared/hooks/useAsyncAction'

interface RevealActionProps {
  host: boolean
  label: string
  onNext: () => Promise<unknown>
}

export function RevealAction({ host, label, onNext }: RevealActionProps) {
  const action = useAsyncAction(describeError)

  if (!host) return <p className="place-reveal__waiting">{copy.waitingHost}</p>
  return (
    <>
      {action.error && <p className="error center">{action.error}</p>}
      <button
        type="button"
        className="button button--primary button--block"
        disabled={action.pending}
        onClick={() => action.run(onNext)}
      >
        {label}
      </button>
    </>
  )
}
