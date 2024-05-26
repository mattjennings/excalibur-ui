import text from './text'
import rectangle from './rectangle'
import { Entity } from 'excalibur'
import view from './view'
import graphic from './graphic'

export const elements: Record<string, ElementDefinition<any, any>> = {
  'ex-text': text,
  'ex-rectangle': rectangle,
  'ex-view': view,
  'ex-graphic': graphic,
}

export { type RectangleProps, RectangleElement } from './rectangle'
export { type TextProps, TextElement } from './text'
export { type ViewProps, ViewElement } from './view'
export { type GraphicProps, GraphicElement } from './graphic'

export interface ElementDefinition<
  Instance extends Entity,
  Props extends Record<string, any>,
> {
  init: () => Instance
  applyProp?: <K extends Extract<keyof Props, string>>(
    instance: Instance,
    prop: K,
    value: Props[K],
  ) => void
}

export function createExElement<
  Instance extends Entity,
  Props extends Record<string, any>,
>(args: ElementDefinition<Instance, Props>) {
  return args
}

export function registerExElement<
  Instance extends Entity,
  Props extends Record<string, any>,
>(name: string, definition: ElementDefinition<Instance, Props>) {
  elements[name] = createExElement(definition)
}
