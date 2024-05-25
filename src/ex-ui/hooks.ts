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

export function useEngine() {
  return ex.Engine.useEngine()
}

export function useEngineEvent<TEventName extends ex.EventKey<ex.EngineEvents>>(
  event: TEventName,
  listener: ex.Handler<ex.EngineEvents[TEventName]>,
) {
  const engine = ex.Engine.useEngine()

  engine.on(event, listener)

  onCleanup(() => {
    engine.off(event, listener)
  })
}

export function useSceneEvent<TEventName extends ex.EventKey<ex.SceneEvents>>(
  scene: ex.Scene,
  event: TEventName,
  listener: ex.Handler<ex.SceneEvents[TEventName]>,
) {
  scene.on(event, listener)

  onCleanup(() => {
    scene.off(event, listener)
  })
}
