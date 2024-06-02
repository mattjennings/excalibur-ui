import { onCleanup } from 'solid-js'
import { JSX as JSXSolid } from 'solid-js/types/jsx.d.ts'
import { createRenderer } from 'solid-js/universal'
import {
  GraphicProps,
  RectangleProps,
  TextProps,
  ViewElement,
  ViewProps,
  elements,
} from './elements'
import { UI } from './ui'

declare global {
  namespace JSX {
    interface IntrinsicElements extends JSXSolid.IntrinsicElements {
      'ex-text': TextProps
      'ex-rectangle': RectangleProps
      'ex-view': ViewProps
      'ex-graphic': GraphicProps
    }
  }
}

type ExElement = ViewElement & {
  __exui?: { type: string }
}
type NodeType = ExElement | HTMLElement | Text | UI

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
      if (isUI(parent)) {
        parent.htmlElement.insertBefore(node, anchor as Node)
      }
      // parent is html element
      else if (isHtmlElement(parent)) {
        parent.insertBefore(node, anchor as Node)
      } else {
        if (isExElement(parent)) {
          parent.htmlElement.insertBefore(node, anchor as Node)
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
      } else if (isUI(parent)) {
        parent.htmlElement.removeChild(node)
      } else {
        throw new Error('Unknown parent type')
      }
    } else if (isExElement(node)) {
      node.kill()

      if (isExElement(parent)) {
        parent.removeChild(node)
      } else {
        throw new Error('Unknown parent type')
      }
    } else {
      throw new Error('Unknown node type')
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

function isExElement(node: NodeType): node is ExElement {
  return node instanceof ViewElement || node instanceof UI
}

function isHtmlElement(node: NodeType): node is HTMLElement {
  return node instanceof HTMLElement
}

function isTextNode(node: NodeType): node is Text {
  return node instanceof Text
}

function isUI(node: unknown): node is UI {
  return node instanceof UI
}

export {
  createComponent,
  createElement,
  createTextNode,
  effect,
  insert,
  insertNode,
  memo,
  mergeProps,
  render,
  setProp,
  spread,
  use,
}
// Forward Solid control flow
export {
  ErrorBoundary,
  For,
  Index,
  Match,
  Show,
  Suspense,
  SuspenseList,
  Switch,
} from 'solid-js'
