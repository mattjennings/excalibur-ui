import { renderUI, useValue } from 'excalibur-ui'
import { Engine } from 'excalibur'

export default class Level1 extends ex.Scene {
  time = 0
  pos = ex.vec(0, 0)

  onInitialize() {
    this.add(new Player())
  }

  onPreUpdate(engine: Engine<any>, delta: number): void {
    this.time += delta / 1000

    // move in circle
    this.pos = ex.vec(
      300 + Math.cos(this.time) * 100,
      300 + Math.sin(this.time) * 100,
    )
  }
}

class Player extends ex.Actor {
  constructor() {
    super({
      x: 300,
      y: 300,
      width: 20,
      height: 20,
      color: ex.Color.Blue,
    })
  }

  onInitialize() {
    let elapsed = 0
    this.on('preupdate', ({ delta }) => {
      elapsed += delta
      this.pos.x += Math.sin(elapsed / 1000)
      // this.scene!.camera.pos.x += 5 / delta
    })

    renderUI(this, () => {
      const pos = useValue(() => this.pos)

      return (
        <>
          <ex-rectangle
            html={(props) => (
              <button
                style={{
                  ...props.style,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => alert('clicked')}
              ></button>
            )}
            x={pos().x}
            y={100}
            color="#ff4400"
            width={140}
            height={80}
          >
            <ex-text
              text="I'm a button"
              x={10}
              y={25}
              color="#ffffff"
              font={{
                size: 20,
              }}
            />
          </ex-rectangle>

          <ex-text
            text="Player"
            anchor={ex.Vector.Half}
            x={pos().x}
            y={pos().y - 60}
            color="#ffffff"
            font={{
              size: 20,
              family: 'Arial',
            }}
          />
        </>
      )
    })
  }
}
