import '$test-utils/vitest-setup'
import { test as base } from 'vitest'
import { WebAudio } from 'excalibur'
import * as ex from 'excalibur'

// @ts-ignore - suppress audio warning
WebAudio._UNLOCKED = true

let clock: ex.TestClock
let game: ex.Engine<string>

const resources: any[] = []

export const test = base.extend<{
  game: ex.Engine<string>
  scene: ex.Scene
  loader: ex.Loader
  clock: ex.TestClock

  useScene: (scene: typeof ex.Scene) => Promise<ex.Scene>
  dispatchKeyEvent: (type: string, key: string) => void
}>({
  game: async ({ loader }, use) => {
    // only make the game once
    if (!game) {
      game = new ex.Engine<string>({
        uvPadding: 0.5,
        fixedUpdateFps: 60,
        resolution: {
          height: ex.Resolution.SNES.height,
          // make 16:9
          width: (ex.Resolution.SNES.width / 9) * 16,
        },
        displayMode: ex.DisplayMode.FitScreen,
        physics: {
          gravity: ex.vec(0, 800),
          solver: ex.SolverStrategy.Arcade,
          arcade: {
            contactSolveBias: ex.ContactSolveBias.VerticalFirst,
          },
          colliders: {
            compositeStrategy: 'separate',
          },
        },
        pixelArt: true,
        suppressConsoleBootMessage: true,
        suppressPlayButton: true,
      })

      // @ts-ignore - for debugging in headful browser
      window.game = game

      await game.start(loader)
      clock = game.debug.useTestClock()
    }

    await use(game)
  },
  scene: async ({ game }, use) => {
    await use(game.currentScene)
  },
  loader: async ({}, use) => {
    const loader = new ex.Loader(resources)
    await use(loader)
  },
  useScene: async ({ game }, use) => {
    await use(async (scene: typeof ex.Scene) => {
      game.add('test', new scene())

      await game.goToScene('test')

      return game.currentScene
    })
    // cleanup actors
    game.currentScene?.actors.forEach((actor) => actor.kill())
    await game.goToScene('root')
    game.removeScene('test')
  },
  dispatchKeyEvent: async ({ game }, use) => {
    await use((type, code) => {
      window.top?.dispatchEvent(new KeyboardEvent(type, { code }))
    })
    // @ts-ignore - clear keyboard state
    game.input.keyboard._keys = []
    game.input.keyboard.update()
  },
  clock: async ({}, use) => {
    await use(clock)
  },
})

export {
  expect,
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
} from 'vitest'

declare module 'vitest' {
  export interface TestContext {
    game: ex.Engine<string>
    scene: ex.Scene
    loader: ex.Loader
    clock: ex.TestClock
    useScene: (scene: typeof ex.Scene) => Promise<ex.Scene>
    dispatchKeyEvent: (type: string, key: string) => void
  }
}
