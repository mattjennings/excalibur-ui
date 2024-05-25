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
        "moduleName": "excalibur-ui",
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
        moduleName: 'excalibur-ui',
        generate: 'universal',
      },
    }),
  ],
})
```

## Usage

UI can be rendered either on a Scene or Entity, and should be called once during `onInitialize`.

```tsx
import { renderUI } from 'excalibur-ui'

class Scene extends ex.Scene {
  onInitialize() {
    renderUI(this, () => {
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
    })
  }
}

class Actor extends ex.Actor {
  onInitialize() {
    renderUI(this, () => {
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
    })
  }
}
```

## Using state

Since excalibur-ui is build on top of Solid, you can use signals and effects the same way you would in Solid components.

You may want to manage state at the entity/scene level using class properties, so excalibur-ui provides a `useValue` hook that
will provide a signal that is updated every frame. You can use this to get values from the parent entity/scene.

```tsx
import { useValue } from 'excalibur-ui'

class Actor extends ex.Actor {
  onInitialize() {
    this.pos = ex.vec(100, 100)

    renderUI(this, () => {
      const pos = useValue(() => this.pos)

      return (
        <ex-text
          text="Hello World!"
          pos={pos()}
          color="#ffffff"
          font={{
            size: 50,
            family: 'Arial',
          }}
        />
      )
    })
  }
}
```

## HTML elements

All HTML elements are supported and render on top of the game canvas.

```tsx
import { useValue } from 'excalibur-ui'

class Actor extends ex.Actor {
  onInitialize() {
    this.pos = ex.vec(100, 100)

    renderUI(this, () => {
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
    })
  }
}
```

## Excalibur elements

There's a lot missing here, but currently you can use:

- `ex-text`
- `ex-rectangle`

and these will render as native Excalibur entities onto the scene.

```tsx
class Scene extends ex.Scene {
  onInitialize() {
    renderUI(this, () => {
      return (
        <>
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
        </>
      )
    })
  }
}
```
