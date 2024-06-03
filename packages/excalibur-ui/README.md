# excalibur-ui

⚠️ very much a work in progress ⚠️

Render UI in Excalibur.js games using JSX with SolidJS. It is recommended to be familiar with [Solid](https://www.solidjs.com/tutorial/introduction_basics) before using this library.

## Installation

excalibur-ui requires either Babel or Vite to compile the JSX.

### Babel

```bash
npm install excalibur-ui solid-js babel-preset-solid
```

Update your `.babelrc` file:

```json
{
  "presets": [
    [
      "babel-preset-solid",
      {
        "moduleName": "excalibur-ui/jsx-runtime",
        "generate": "universal"
      }
    ]
  ]
}
```

### Vite

```bash
npm install excalibur-ui solid-js vite-plugin-solid
```

Update your vite config file:

```js
import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solidPlugin({
      solid: {
        moduleName: 'excalibur-ui/jsx-runtime',
        generate: 'universal',
      },
    }),
  ],
})
```

## Typescript

If you're using typescript, be sure to add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

## Usage

All UI is rendered inside of a `UI` entity. This can be added to a scene or as a child
of another entity.

```tsx
import { UI } from 'excalibur-ui'

class Scene extends ex.Scene {
  onInitialize() {
    this.add(
      new UI(() => {
        return (
          <ex-text
            text="Hello World!"
            pos={ex.vec(100, 100)}
            color="#ffffff"
            font={{
              size: 50,
              family: 'Arial',
            }}
          />
        )
      }),
    )
  }
}

class Actor extends ex.Actor {
  onInitialize() {
    this.addChild(
      new UI(() => {
        return (
          <ex-text
            text="Hello World!"
            // ex-* elements act as normal Excalibur entities, so their positions
            // are relative to their parent entity
            pos={ex.vec(0, 0)}
            color="#ffffff"
            font={{
              size: 50,
              family: 'Arial',
            }}
          />
        )
      }),
    )
  }
}
```

## Using state

Since excalibur-ui is build on top of Solid, you can use signals and effects the same way you would in Solid components.

You may want to manage state at the entity/scene level using class properties, so excalibur-ui provides a `useValue` hook that
will provide a signal that is updated every frame. You can use this to get values from the parent entity/scene.

```tsx
import { UI, useValue } from 'excalibur-ui'

class Actor extends ex.Actor {
  health = 0

  onInitialize() {
    this.addChild(
      new UI(() => {
        const health = useValue(() => this.health)

        return (
          <ex-text
            text={`Health: ${health}`}
            color="#ffffff"
            font={{
              size: 50,
              family: 'Arial',
            }}
          />
        )
      }),
    )
  }
}
```

## HTML elements

All HTML elements are supported and render on top of the game canvas.

Note that HTML elements are always positioned absolutely over the canvas, so they
are not affected by parent's position unless you explicitly use it in the styling.

```tsx
import { UI, useValue } from 'excalibur-ui'

class Actor extends ex.Actor {
  onInitialize() {
    this.pos = ex.vec(100, 100)

    this.addChild(
      new UI(() => {
        const screenPos = useValue(() =>
          this.scene.engine.worldToScreenCoordinates(this.pos),
        )

        return (
          <div
            style={{
              position: 'absolute',
              top: `${screenPos().x}px`,
              left: `${screenPos().y}px`,
              color: 'white',
            }}
          >
            hello world
          </div>
        )
      }),
    )
  }
}
```

## Excalibur elements

There's a lot missing here, but currently you can use:

- `ex-view`
- `ex-graphic`
- `ex-text`
- `ex-rectangle`

and these will render as native Excalibur entities onto the scene.

```tsx
import { UI } from 'excalibur-ui'

class Scene extends ex.Scene {
  onInitialize() {
    this.add(
      new UI(() => {
        return (
          <ex-view pos={ex.vec(100, 100)}>
            <ex-graphic
              graphic={new ex.Circle({ radius: 5, color: ex.Color.Red })}
            />
            <ex-text
              text="Hello World!"
              pos={ex.vec(100, 100)}
              color="#ffffff"
              font={{
                size: 50,
                family: 'Arial',
              }}
            />
            <ex-rectangle
              pos={ex.vec(100, 300)}
              color="#ff4400"
              width={140}
              height={80}
            />
          </ex-view>
        )
      }),
    )
  }
}
```
