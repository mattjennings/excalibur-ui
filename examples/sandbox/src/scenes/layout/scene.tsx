import { Engine } from 'excalibur'
import {
  RectangleProps,
  renderUI,
  useTweenedValue,
  useValue,
} from 'excalibur-ui'
import { createEffect } from 'solid-js'
import { FlexDirection, Wrap } from 'yoga-layout'

export default class Pause extends ex.Scene {
  paused = false

  onInitialize() {
    renderUI(this, () => <UI scene={this} />)
  }

  onPreUpdate(engine: Engine<any>, delta: number): void {
    if (engine.input.keyboard.wasPressed(ex.Input.Keys.Enter)) {
      this.paused = !this.paused
    }
  }
}

function UI(props: { scene: Pause }) {
  const paused = useValue(() => props.scene.paused)

  // Tween from 0-1 when pausing so we can use it for animations
  const [pausingProgress, setPausingProgress] = useTweenedValue(0, {
    duration: 300,
    easing: ex.EasingFunctions.EaseInOutCubic,
  })

  createEffect(() => {
    if (paused()) {
      setPausingProgress(1)
    } else {
      setPausingProgress(0)
    }
  })

  return (
    <>
      <ex-view
        style={{
          flex: 1,
          flexDirection: FlexDirection.Row,
          gap: 10,
          width: 150,
          height: 400,
        }}
      >
        <ex-rectangle color={ex.Color.Blue} style={{ width: 50, height: 50 }} />
        <ex-rectangle
          color={ex.Color.Green}
          style={{ width: 50, height: 50 }}
        />
        <ex-rectangle color={ex.Color.Red} style={{ width: 50, height: 50 }} />
      </ex-view>
      {/* <ex-text
        x={200}
        y={200}
        font={{
          size: 32,
          color: ex.Color.White,
        }}
        text="Press Enter to pause the game"
      />

      {pausingProgress() > 0 && (
        <>
          <ex-rectangle
            color={ex.Color.Black}
            width={800}
            height={600}
            pos={ex.vec(0, 0)}
            opacity={0.7 * pausingProgress()}
          />
          <Menu
            width={200}
            height={580}
            pos={ex.vec(800 - 200 * pausingProgress(), 10)}
            opacity={1 * pausingProgress()}
          >
            <Button x={0} y={0} text="Items" onSelect={() => alert('Items')} />
            <Button x={0} y={60} text="Party" onSelect={() => alert('Party')} />
            <Button x={0} y={120} text="Save" onSelect={() => alert('Save')} />
            <Button x={0} y={180} text="Quit" onSelect={() => alert('Quit')} />
          </Menu>
        </>
      )} */}
    </>
  )
}

function Menu(props: RectangleProps) {
  return (
    <ex-rectangle
      color={ex.Color.Black}
      pos={props.pos}
      strokeColor={ex.Color.White}
      lineWidth={4}
      borderRadius={10}
      {...props}
    >
      <ex-view x={10} y={20}>
        {props.children}
      </ex-view>
    </ex-rectangle>
  )
}

function Button(props: {
  x: number
  y: number
  text: string
  onSelect: () => void
}) {
  return (
    <ex-rectangle
      html={(htmlProps) => (
        <button
          tabIndex={1}
          style={{
            ...htmlProps.style,
            color: 'transparent',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={props.onSelect}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
            }
          }}
        >
          {props.text}
        </button>
      )}
      width={180}
      height={40}
      borderRadius={10}
      x={props.x}
      y={props.y}
    >
      <ex-text
        x={10}
        y={8}
        text={props.text}
        font={{
          size: 24,
          color: ex.Color.White,
        }}
      />
    </ex-rectangle>
  )
}
