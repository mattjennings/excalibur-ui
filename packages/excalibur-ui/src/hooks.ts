import { createSignal, onCleanup } from 'solid-js'
import {
  Engine,
  EngineEvents,
  EventKey,
  Handler,
  Scene,
  SceneEvents,
} from 'excalibur'

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
  const engine = Engine.useEngine()

  const [signal, setSignal] = createSignal<T>(getter())
  const setter = () => setSignal(() => getter())

  engine.on(timing, setter)

  onCleanup(() => {
    engine.off(timing, setter)
  })

  return signal
}

export function useEngine() {
  return Engine.useEngine()
}

export function useEngineEvent<TEventName extends EventKey<EngineEvents>>(
  event: TEventName,
  listener: Handler<EngineEvents[TEventName]>,
) {
  const engine = Engine.useEngine()

  engine.on(event, listener)

  onCleanup(() => {
    engine.off(event, listener)
  })
}

export function useSceneEvent<TEventName extends EventKey<SceneEvents>>(
  scene: Scene,
  event: TEventName,
  listener: Handler<SceneEvents[TEventName]>,
) {
  scene.on(event, listener)

  onCleanup(() => {
    scene.off(event, listener)
  })
}
