import { renderUI, useTweenedValue } from 'excalibur-ui'

export default class Tween extends ex.Scene {
  onInitialize() {
    renderUI(this, () => <UI />)
  }
}

function UI() {
  const [y, setY] = useTweenedValue(800, {
    duration: 1000,
    easing: ex.EasingFunctions.EaseInOutCubic,
    onComplete: () => {
      setY(Math.random() * 400)
    },
  })

  setY(400)

  return <TextBox pos={ex.vec(0, y())} text="This is a text box" />
}

function TextBox(props: { pos: ex.Vector; text: string }) {
  return (
    <ex-rectangle
      color={ex.Color.Black}
      width={800}
      height={100}
      pos={props.pos}
      strokeColor={ex.Color.White}
      lineWidth={4}
      borderRadius={10}
    >
      <ex-text
        text={props.text}
        x={10}
        y={10}
        maxWidth={760}
        font={{
          size: 20,
          family: 'Arial',
          color: ex.Color.White,
        }}
      />
    </ex-rectangle>
  )
}
