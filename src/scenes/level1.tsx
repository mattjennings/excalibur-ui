import { renderUI, useValue } from 'ex-ui'
import { Engine } from 'excalibur'

export default class Level1 extends ex.Scene {
  time = 0
  pos = ex.vec(0, 0)

  onInitialize() {
    this.add(new Player())
    // renderUI(this, () => {
    //   const pos = useValue(() => this.pos)
    //   return (
    //     <>
    //       <text
    //         text="Hello World!"
    //         pos={pos()}
    //         color="#ffffff"
    //         font={{
    //           size: 50,
    //           family: 'Arial',
    //         }}
    //       >
    //         <rectangle width={200} height={200} color="#ff0000" z={-1} />
    //       </text>
    //     </>
    //   )
    // })
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
    })

    renderUI(this, () => {
      const pos = useValue(() => this.pos)

      return (
        <>
          <button
            style={{
              position: 'absolute',
              top: `${pos().y}px`,
              left: `${pos().x}px`,
            }}
          >
            sadf
          </button>
          <ex-rectangle width={1} height={1} color="#ff0000" />
          <ex-text
            text="Player"
            anchor={ex.Vector.Half}
            x={pos().x}
            y={pos().y - 60}
            color="#ffffff"
            font={{
              size: 25,
              family: 'Arial',
            }}
          />
        </>
      )
    })
  }
}
