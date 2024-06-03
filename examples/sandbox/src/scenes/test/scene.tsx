import { UI, useValue } from 'excalibur-ui'
import { Engine } from 'excalibur'
import { For, createEffect } from 'solid-js'
import { images } from '../../resources'

export default class Level1 extends ex.Scene {
  time = 0
  pos = ex.vec(0, 0)

  onInitialize() {
    const width = useValue(() => 600 + Math.sin(this.time) * 200)

    this.add(
      new UI(() => (
        <ex-view
          layout={{
            position: 'absolute',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            // width: '800px',
            width: width() + 'px',
          }}
        >
          <ex-rectangle
            color="#ff000044"
            layout={{
              position: 'absolute',
              width: '100%',
              height: '100%',
            }}
          />
          <For each={Array.from({ length: 50 })}>
            {(_, index) => (
              <ex-graphic graphic={images.sword.toSprite()}>
                <button
                  style={{
                    height: '100%',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onClick={() => alert('clicked ' + index())}
                />
              </ex-graphic>
            )}
          </For>
        </ex-view>
      )),
    )
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

    this.addChild(
      new UI(() => {
        return (
          <>
            {/* <button>sadf</button> */}

            {/* <ex-rectangle
              color="#ff4400"
              style={{
                width: '100px',
                height: '100px',
                color: '#ff0000',
              }}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => alert('clicked')}
              ></button>
              <ex-text
                text="I'm a button"
                x={10}
                y={25}
                color="#ffffff"
                font={{
                  size: 20,
                }}
              />
            </ex-rectangle> */}

            {/* <ex-text
              text="Player"
              anchor={ex.Vector.Half}
              y={-60}
              color="#ffffff"
              font={{
                size: 20,
                family: 'Arial',
              }}
            /> */}
          </>
        )
      }),
    )
  }
}
