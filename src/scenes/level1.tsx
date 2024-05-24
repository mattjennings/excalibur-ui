import { render } from 'ex-ui'
import { Engine } from 'excalibur'

export default class Level1 extends ex.Scene {
  time = 0
  pos = ex.vec(0, 0)

  onInitialize() {
    render((props) => {
      return (
        <>
          <text
            text="Hello World!"
            pos={props.pos}
            color="#ffffff"
            font={{
              size: 50,
              family: 'Arial',
            }}
          >
            <rectangle width={200} height={200} color="#ff0000" z={-1} />
          </text>
        </>
      )
    }, this)
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
