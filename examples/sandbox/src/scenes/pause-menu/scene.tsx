import { Engine } from 'excalibur'
import { RectangleProps, UI, useTweenedValue, useValue } from 'excalibur-ui'
import { Show, createEffect } from 'solid-js'

export default class Pause extends ex.Scene {
  paused = false

  onInitialize() {
    this.add(
      new UI(() => {
        const paused = useValue(() => this.paused)

        return (
          <>
            <ex-text
              layout={{
                position: 'absolute',
                top: '50%',
                left: '20%',
              }}
              font={{
                size: 32,
                color: ex.Color.White,
              }}
              text="Press Enter to pause the game"
            />
            <Menu open={paused()} onSelect={(item) => alert(item)} />
          </>
        )
      }),
    )
  }

  onPreUpdate(engine: Engine<any>, delta: number): void {
    if (engine.input.keyboard.wasPressed(ex.Input.Keys.Enter)) {
      this.paused = !this.paused
    }
  }
}

function Menu(props: { open: boolean; onSelect: (item: string) => void }) {
  // Tween from 0-1 when pausing so we can use it for animations
  const [pausingProgress, setPausingProgress] = useTweenedValue(0, {
    duration: 300,
    easing: ex.EasingFunctions.EaseInOutCubic,
  })

  createEffect(() => {
    if (props.open) {
      setPausingProgress(1)
    } else {
      setPausingProgress(0)
    }
  })

  return (
    <Show when={pausingProgress() > 0}>
      <ex-rectangle
        color={ex.Color.Black}
        layout={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        opacity={0.5 * pausingProgress()}
      />

      <ex-rectangle
        layout={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'absolute',
          top: '5%',
          left: `${100 - pausingProgress() * 30}%`,
          width: '200px',
          height: '80%',
          padding: '20px',
        }}
        opacity={1 * pausingProgress()}
        color={ex.Color.Black}
        strokeColor={ex.Color.White}
        lineWidth={4}
        borderRadius={10}
        {...props}
      >
        <Button text="Items" onSelect={() => props.onSelect('Items')} />
        <Button text="Party" onSelect={() => props.onSelect('Party')} />
        <Button text="Options" onSelect={() => props.onSelect('Options')} />
        <Button text="Save" onSelect={() => props.onSelect('Save')} />
        <Button text="Quit" onSelect={() => props.onSelect('Quit')} />
      </ex-rectangle>
    </Show>
  )
}

function Button(props: { text: string; onSelect: () => void }) {
  return (
    <ex-text
      text={props.text}
      font={{
        size: 24,
        color: ex.Color.White,
      }}
    >
      <button
        tabIndex={1}
        style={{
          color: 'transparent',
          width: '100%',
          height: '100%',
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
        abc
      </button>
    </ex-text>
  )
}
