import text from './text'
import rectangle from './rectangle'

export const elements: Record<string, ElementDefinition<any, any>> = {
  'ex-text': text,
  'ex-rectangle': rectangle,
}

interface ElementDefinition<
  Instance extends ex.Entity,
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
  Instance extends ex.Entity,
  Props extends Record<string, any>,
>(args: ElementDefinition<Instance, Props>) {
  return args
}

export function registerElement<
  Instance extends ex.Entity,
  Props extends Record<string, any>,
>(name: string, definition: ElementDefinition<Instance, Props>) {
  elements[name] = createElement(definition)
}
