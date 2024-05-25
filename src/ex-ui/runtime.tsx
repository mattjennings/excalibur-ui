import { createSignal } from 'solid-js'
import { createRenderer } from 'solid-js/universal'
import { elements } from './elements'

const {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
  use,
} = createRenderer<ex.Entity & { __exui?: { type: string } }>({
  createElement(string) {
    if (elements[string]) {
      const el = elements[string].init()
      el.__exui = { type: string }

      return el
    }

    throw new Error('Unknown element ' + string)
  },
  createTextNode(value) {
    return new ex.Label({ text: value })
  },
  replaceText(textNode, value) {
    if (textNode instanceof ex.Label) {
      textNode.text = value
    }
  },
  setProperty(node, name, value) {
    if (node.__exui) {
      const definition = elements[node.__exui.type]

      if (definition.applyProp) {
        definition.applyProp(node, name, value)
        return
      }
    }
  },
  insertNode(parent, node, anchor) {
    parent.addChild(node)
  },
  isTextNode(node) {
    return node instanceof ex.Label
  },
  removeNode(parent, node) {
    parent.removeChild(node)
  },
  getParentNode(node) {
    if (!node.parent) throw new Error('No parent for node ' + node)
    return node.parent
  },
  getFirstChild(node) {
    return node.children[0]
  },
  getNextSibling(node) {
    const parent = node.parent

    if (!parent) throw new Error('No parent for node ' + node)

    const index = parent.children.indexOf(node)

    return parent.children[index + 1]
  },
})

/**
 * Renders a Solid JSX UI into an Excalibur scene or entity. Only call this
 * once i.e during intialization of scene or entity.
 */
function renderUI<T extends ex.Scene | ex.Entity>(
  ui: () => ex.Entity<any>,
  sceneOrEntity: T,
) {
  let container: ex.Entity<any>

  const [didRender, setDidRender] = createSignal(false)

  const scene = isScene(sceneOrEntity) ? sceneOrEntity : sceneOrEntity.scene!

  scene.on('predraw', () => {
    if (!didRender()) {
      setDidRender(true)
      render(ui, container)
    }
  })

  if (isScene(sceneOrEntity)) {
    scene.on('activate', () => {
      container = new ex.ScreenElement()
      scene.add(container)
    })

    scene.on('deactivate', () => {
      container.kill()
      setDidRender(false)
    })
  } else if (isEntity(sceneOrEntity)) {
    const setup = () => {
      container = new ex.ScreenElement()
      scene.add(container)
    }

    if (sceneOrEntity.isInitialized) {
      setup()
    } else {
      sceneOrEntity.on('initialize', () => {
        setup()
      })
    }

    sceneOrEntity.on('kill', () => {
      container.kill()
      setDidRender(false)
    })
  }
}

function isEntity(node: ex.Entity | ex.Scene): node is ex.Entity {
  return node instanceof ex.Entity
}

function isScene(node: ex.Entity | ex.Scene): node is ex.Scene {
  return node instanceof ex.Scene
}

export {
  renderUI,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
  use,
}
// Forward Solid control flow
export {
  For,
  Show,
  Suspense,
  SuspenseList,
  Switch,
  Match,
  Index,
  ErrorBoundary,
} from 'solid-js'
