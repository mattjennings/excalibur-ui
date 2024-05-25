import { createSignal, onCleanup } from 'solid-js'

/**
 * Returns a signal that updates every engine update
 */
export function useValue<T>(
  getter: () => T,
  opts: {
    timing?:
      | 'update'
      | 'preupdate'
      | 'postupdate'
      | 'predraw'
      | 'postdraw'
      | 'preframe'
      | 'postframe'
  } = {},
) {
  const { timing = 'postupdate' } = opts
  const engine = ex.Engine.useEngine()

  const [signal, setSignal] = createSignal<T>(getter())
  const setter = () => setSignal(() => getter())

  engine.on(timing, setter)

  onCleanup(() => {
    engine.off(timing, setter)
  })

  return signal
}
