import text from './text'
import rectangle from './rectangle'
import { Entity } from 'excalibur'

export const elements: Record<string, ElementDefinition<any, any>> = {
  'ex-text': text,
  'ex-rectangle': rectangle,
}

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

export function createElement<
  Instance extends Entity,
  Props extends Record<string, any>,
>(args: ElementDefinition<Instance, Props>) {
  return args
}

export function registerElement<
  Instance extends Entity,
  Props extends Record<string, any>,
>(name: string, definition: ElementDefinition<Instance, Props>) {
  elements[name] = createElement(definition)
}

export { RectangleProps, RectangleElement } from './rectangle'
export { TextProps, TextElement } from './text'
