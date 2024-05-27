import {
  Engine,
  EngineEvents,
  EventKey,
  Handler,
  Scene,
  SceneEvents,
} from 'excalibur'
import { SignalOptions, createSignal, onCleanup } from 'solid-js'

/**
 * Returns a signal that updates every engine update
 */
export function useValue<T>(
  getter: () => T,
  opts: SignalOptions<T> & {
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
  const { timing = 'postupdate', ...signalOptions } = opts
  const engine = useEngine()

  const [signal, setSignal] = createSignal<T>(getter(), signalOptions)
  const setter = () => setSignal(() => getter())

  engine().on(timing, setter)

  onCleanup(() => {
    engine().off(timing, setter)
  })

  return signal
}

/**
 * Returns a signal to get the current engine
 */
export function useEngine() {
  return () => Engine.useEngine()
}

/**
 * Listen to an engine event
 */
export function useEngineEvent<TEventName extends EventKey<EngineEvents>>(
  event: TEventName,
  listener: Handler<EngineEvents[TEventName]>,
) {
  const engine = useEngine()

  engine().on(event, listener)

  onCleanup(() => {
    engine().off(event, listener)
  })
}

/**
 * Returns a signal to get the current scene
 */
export function useCurrentScene() {
  const engine = useEngine()

  return () => engine().currentScene
}

/**
 * Listen to a scene event. Defaults to the current scene, but
 * can be overridden
 */
export function useSceneEvent<TEventName extends EventKey<SceneEvents>>(
  event: TEventName,
  listener: Handler<SceneEvents[TEventName]>,
  scene?: Scene,
) {
  scene ??= useCurrentScene()()

  scene.on(event, listener)

  onCleanup(() => {
    scene.off(event, listener)
  })
}
