export interface UIElementProps {
  pos?: ex.Vector
  x?: number
  y?: number
  z?: number
  width?: number
  height?: number
  anchor?: ex.Vector
  opacity?: number
  scale?: ex.Vector
  rotation?: number
}

/**
 * Base class for all UI elements.
 */
export class UIElement extends ex.Entity {
  transform: ex.TransformComponent
  graphics: ex.GraphicsComponent

  constructor() {
    super()
    this.transform = new ex.TransformComponent()
    this.graphics = new ex.GraphicsComponent()
    this.graphics.anchor = ex.Vector.Zero
    this.addComponent(this.transform)
    this.addComponent(this.graphics)
  }

  get width() {
    return this.graphics.current?.width ?? 0
  }

  set width(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.width = value
  }

  get height() {
    return this.graphics.current?.height ?? 0
  }

  set height(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.height = value
  }

  get anchor() {
    return this.graphics.anchor
  }

  set anchor(value: ex.Vector) {
    this.graphics.anchor = value
  }

  get pos() {
    return this.transform.pos
  }

  set pos(value: ex.Vector) {
    this.transform.pos = value
  }

  get x() {
    return this.transform.pos.x
  }

  set x(value: number) {
    this.transform.pos.x = value
  }

  get y() {
    return this.transform.pos.y
  }

  set y(value: number) {
    this.transform.pos.y = value
  }

  get z() {
    return this.transform.z
  }

  set z(value: number) {
    this.transform.z = value
  }

  get opacity() {
    return this.graphics.current?.opacity ?? 1
  }

  set opacity(value: number) {
    if (!this.graphics.current) return
    this.graphics.current.opacity = value
  }

  get scale() {
    return this.transform.scale
  }

  set scale(value: ex.Vector) {
    this.transform.scale = value
  }

  get rotation() {
    return this.transform.rotation
  }

  set rotation(value: number) {
    this.transform.rotation = value
  }
}
