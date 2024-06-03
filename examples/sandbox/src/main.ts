import './style.css'
import { createMenu } from './menu'
import resources from './resources'

// load all scenes from ./scenes directory where folder name is the scene name
// and the scene file is named `scene.tsx`
const sceneFiles = import.meta.glob('./scenes/**/*/scene.tsx', {
  eager: true,
}) as Record<
  string,
  {
    default: typeof ex.Scene
    loader?: typeof ex.Loader
    transitions?: {
      in?: ex.Transition
      out?: ex.Transition
    }
  }
>

export const scenes = Object.entries(sceneFiles).reduce((acc, [key, scene]) => {
  const name = key
    .split('/scenes/')[1]
    .split('.ts')[0]
    .replace(/\/scene$/, '')

  return {
    ...acc,
    [name]: {
      scene: scene.default,
      loader: scene.loader,
      transitions: scene.transitions,
    },
  }
}, {})

const query = new URLSearchParams(window.location.search)
const initialScene = query.get('scene') || Object.keys(scenes)[0]

if (!query.has('scene')) {
  window.history.pushState({}, '', `?scene=${initialScene}`)
}

const game = new ex.Engine<string>({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitContainer,
  pixelArt: true,
  canvasElementId: 'game',
  scenes,
})

const loader = new ex.Loader(resources)
loader.suppressPlayButton = true
game.start(initialScene, {
  loader,
  inTransition: new ex.FadeInOut({
    duration: 200,
    direction: 'in',
    color: ex.Color.ExcaliburBlue,
  }),
})

createMenu()

// @ts-ignore
window.navigation?.addEventListener('navigate', (event) => {
  const destination = event.destination.url
  const query = new URL(destination).searchParams
  const scene = query.get('scene')

  if (scene) {
    game.goToScene(scene)
  }
})
