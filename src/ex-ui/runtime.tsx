import { createSignal } from 'solid-js'
import { createRenderer } from 'solid-js/universal'
import { elements } from './elements'

const {
  render: _render,
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

function render<Scene extends ex.Scene>(
  UI: (props: RecordOf<Scene>) => ex.Entity<any>,
  scene: Scene,
) {
  let container: ex.Entity<any>

  const [didRender, setDidRender] = createSignal(false)
  const [props, setProps] = createSignal<any>()

  scene.on('predraw', () => {
    // @ts-ignore
    setProps({ ...scene })

    if (!didRender()) {
      setDidRender(true)
      _render(() => <UI {...props()} />, container)
    }
  })

  scene.on('activate', () => {
    container = new ex.ScreenElement()
    scene.add(container)
  })

  scene.on('deactivate', () => {
    container.kill()
    setDidRender(false)
  })
}

type RecordOf<T> = {
  [K in keyof T]: T[K]
}

export {
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
