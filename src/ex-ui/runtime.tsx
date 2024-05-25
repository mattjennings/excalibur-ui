import { createSignal, onCleanup } from 'solid-js'
import { createRenderer } from 'solid-js/universal'
import { elements } from './elements'
import { Resolution, UIContainer } from './ui-container'
import { JSX as JSXSolid } from 'solid-js/types/jsx.d.ts'

type ExElement = ex.Entity & {
  __exui?: { type: string }
}
type NodeType = ExElement | HTMLElement | Text

const HTML_PROPERTIES = new Set(['className', 'textContent'])

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
} = createRenderer<NodeType>({
  createElement(string) {
    // excalibur element
    if (string.startsWith('ex-')) {
      if (elements[string]) {
        const el = elements[string].init()
        el.__exui = { type: string }

        return el
      } else {
        throw new Error('Unknown element ' + string)
      }
    }

    // html element
    const el = document.createElement(string)
    // overlay has pointer events disabled so that it doesn't block excalibur pointer events
    el.style.pointerEvents = 'auto'
    return el
  },
  // only html elements can have text nodes
  createTextNode(value) {
    return document.createTextNode(value)
  },
  replaceText(textNode, value) {
    if (isTextNode(textNode)) {
      textNode.data = value
    } else if (isExElement(textNode)) {
      throw new Error('Excalibur elements may not have text content')
    } else {
      throw new Error('Cannot replace text on non-text node')
    }
  },
  setProperty(node, name, value) {
    if (isExElement(node)) {
      const definition = node.__exui && elements[node.__exui.type]

      if (name.startsWith('on')) {
        const event = name.slice(2).toLowerCase()
        const listener = value as EventListener

        if ('on' in node) {
          // @ts-ignore
          node.on(event, listener)

          onCleanup(() => {
            debugger
            // @ts-ignore
            node.off(event, listener)
          })
        }
      }
      if (definition?.applyProp) {
        definition.applyProp(node, name, value)
        return
      }
    }

    if (isHtmlElement(node)) {
      if (name === 'style') Object.assign(node.style, value)
      // @ts-ignore
      else if (name.startsWith('on')) node[name.toLowerCase()] = value
      // @ts-ignore
      else if (HTML_PROPERTIES.has(name)) node[name] = value
      // @ts-ignore
      else node.setAttribute(name, value)
    }
  },
  insertNode(parent, node, anchor) {
    // adding html element
    if (isHtmlElement(node) || isTextNode(node)) {
      // parent is ui container
      if (isUIContainer(parent)) {
        parent.htmlElement.insertBefore(node, anchor as Node)
      }
      // parent is html element
      else if (isHtmlElement(parent)) {
        parent.insertBefore(node, anchor as Node)
      } else {
        // unsupported
        if (isExElement(parent)) {
          throw new Error('Cannot insert html element into excalibur element')
        } else {
          throw new Error('Unknown parent type')
        }
      }
    }
    // adding excalibur element
    else if (isExElement(node)) {
      // parent is ui container or ex element
      if (isExElement(parent)) {
        parent.addChild(node)
      } else {
        // unsupported
        if (isHtmlElement(parent)) {
          throw new Error('Cannot insert excalibur element into html element')
        } else {
          throw new Error('Unknown parent type')
        }
      }
    }
  },
  isTextNode(node) {
    return isTextNode(node)
  },
  removeNode(parent, node) {
    if (isHtmlElement(node) || isTextNode(node)) {
      if (isHtmlElement(parent)) {
        parent.removeChild(node)
      } else if (isUIContainer(parent)) {
        parent.htmlElement.removeChild(node)
      } else {
        throw new Error('Unknown parent type')
      }
    } else if (isExElement(node)) {
      if (isExElement(parent)) {
        node.kill()
        parent.removeChild(node)
      } else {
        throw new Error('Unknown parent type')
      }
    }
  },
  getParentNode(node) {
    if (isExElement(node)) {
      if (!node.parent) {
        throw new Error('No parent for node ' + node)
      }
      return node.parent as ExElement
    }

    if (isHtmlElement(node)) {
      if (!node.parentNode) {
        throw new Error('No parent for node ' + node)
      }

      return node.parentNode as HTMLElement
    }

    throw new Error('Unknown node type')
  },
  getFirstChild(node) {
    if (isHtmlElement(node)) return node.firstChild as HTMLElement
    if (isExElement(node)) return node.children[0] as ExElement

    throw new Error('Unknown node type')
  },
  getNextSibling(node) {
    if (isHtmlElement(node)) {
      return node.nextSibling as HTMLElement
    }

    if (isExElement(node)) {
      const parent = node.parent

      if (!parent) throw new Error('No parent for node ' + node)

      const index = parent.children.indexOf(node)

      return parent.children[index + 1] as ExElement
    }

    throw new Error('Unknown node type')
  },
})

/**
 * Renders a Solid JSX UI into an Excalibur scene or entity. Only call this
 * once i.e during intialization of scene or entity.
 */
function renderUI<T extends ex.Scene | ex.Entity>(
  sceneOrEntity: T,
  ui: () => NodeType,
  options?: {
    html?: {
      resolution?: Resolution
      tag?: string
      id?: string
    }
  },
) {
  let container: UIContainer

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
      container = new UIContainer(options?.html)
      scene.add(container)
    })

    scene.on('deactivate', () => {
      container.kill()
      setDidRender(false)
    })
  } else if (isEntity(sceneOrEntity)) {
    const setup = () => {
      container = new UIContainer(options?.html)
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

function isExElement(node: NodeType): node is ExElement {
  return node instanceof ex.Entity
}

function isHtmlElement(node: NodeType): node is HTMLElement {
  return node instanceof HTMLElement
}

function isTextNode(node: NodeType): node is Text {
  return node instanceof Text
}

function isUIContainer(node: unknown): node is UIContainer {
  return node instanceof UIContainer
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

declare global {
  namespace JSX {
    interface IntrinsicElements extends JSXSolid.IntrinsicElements {}
  }
}
