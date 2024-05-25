import './style.css'

const INITIAL_SCENE = 'level1'

// load all scenes from ./scenes directory
const scenes = import.meta.glob('./scenes/**/*.tsx', { eager: true }) as Record<
  string,
  { default: typeof ex.Scene }
>

const game = new ex.Engine<string>({
  width: 800,
  height: 600,
  displayMode: ex.DisplayMode.FitScreen,
  pixelArt: true,
  scenes: Object.entries(scenes).reduce((acc, [key, scene]) => {
    const name = key.split('/scenes/')[1].split('.ts')[0]

    return {
      ...acc,
      [name]: {
        scene: scene.default,
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
