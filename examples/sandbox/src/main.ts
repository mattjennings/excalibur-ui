import './style.css'

const INITIAL_SCENE = 'dialogue'

// load all scenes from ./scenes directory where folder name is the scene name
// and the scene file is named `scene.tsx`
const scenes = import.meta.glob('./scenes/**/*/scene.tsx', {
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

const game = new ex.Engine<string>({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
  pixelArt: true,
  scenes: Object.entries(scenes).reduce((acc, [key, scene]) => {
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
  }, {}),
})

game.start(INITIAL_SCENE, {
  inTransition: new ex.FadeInOut({
    duration: 200,
    direction: 'in',
    color: ex.Color.ExcaliburBlue,
  }),
})
