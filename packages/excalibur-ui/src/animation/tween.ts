import { EasingFunctions } from 'excalibur'
import { createSignal } from 'solid-js'
import { useSceneEvent } from '../hooks'

export function useTweenedValue(
  initialValue: number,
  options: {
    duration?: number
    easing?: ex.EasingFunction
    onStart?: () => void
    onComplete?: () => void
  } = {},
) {
  const [duration, setDuration] = createSignal(options.duration ?? 300)
  const [easing, setEasing] = createSignal(
    options.easing ?? EasingFunctions.Linear,
  )
  const onStart = options.onStart
  const onComplete = options.onComplete

  const [value, setValue] = createSignal(initialValue)
  const [start, setStart] = createSignal(initialValue)
  const [target, setTarget] = createSignal(initialValue)
  const [elapsed, setElapsed] = createSignal(0)

  function startTween(
    v: number,
    options: {
      duration?: number
      easing?: ex.EasingFunction
    } = {},
  ) {
    if (options.duration) setDuration(options.duration)
    if (options.easing) setEasing(() => options.easing!)

    setStart(value())
    setTarget(v)
    setElapsed(0)
    onStart?.()
  }

  useSceneEvent('postupdate', ({ delta }) => {
    if (value() !== target()) {
      setElapsed((prev) => prev + delta)
      const easingFn = easing()

      const eased = easingFn(
        Math.min(elapsed(), duration()),
        start(),
        target(),
        duration(),
      )

      if (elapsed() >= duration()) {
        setValue(target())
        onComplete?.()
      } else {
        setValue(eased)
      }
    }
  })

  return [value, startTween] as const
}
