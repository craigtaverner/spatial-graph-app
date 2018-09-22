import yfiles = require('yfiles/view-component')

export class MySimpleArrow
  extends yfiles.lang.BaseClass(
    yfiles.styles.IArrow,
    yfiles.view.IVisualCreator,
    yfiles.view.IBoundsProvider
  )
  implements yfiles.styles.IArrow, yfiles.view.IVisualCreator, yfiles.view.IBoundsProvider {
  anchor: yfiles.geometry.Point
  direction: yfiles.geometry.Point
  arrowThickness: number
  private $thickness: number
  private $arrowFigure: yfiles.geometry.GeneralPath

  /**
   * Initializes a new instance of the  class.
   */
  constructor() {
    super()
    this.anchor = new yfiles.geometry.Point(0, 0)
    this.direction = new yfiles.geometry.Point(0, 0)
    this.$thickness = 2.0
    this.arrowThickness = 0
    this.$arrowFigure = null
  }

  get arrowFigure() {
    return this.$arrowFigure
  }

  set arrowFigure(value) {
    this.$arrowFigure = value
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * Value: Always returns 7
   * @see Specified by {@link yfiles.styles.IArrow#length}.
   * @type {number}
   */
  get length() {
    return 7
  }

  /**
   * Gets the cropping length associated with this instance.
   * Value: Always returns 1
   * This value is used by {@link yfiles.styles.IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link yfiles.styles.IArrow#cropLength}.
   * @type {number}
   */
  get cropLength() {
    return 1
  }

  /**
   * Gets or sets the thickness of the arrow.
   */
  get thickness() {
    return this.$thickness
  }

  set thickness(value) {
    this.$thickness = value
  }

  /**
   * Gets an {@link yfiles.view.IVisualCreator} implementation that will create
   * the {@link yfiles.view.SvgVisual} for this arrow
   * at the given location using the given direction for the given edge.
   * @param edge the edge this arrow belongs to
   * @param atSource whether this will be the source arrow
   * @param anchor the anchor point for the tip of the arrow
   * @param direction the direction the arrow is pointing in
   * @see Specified by {@link yfiles.styles.IArrow#getVisualCreator}.
   */
  getVisualCreator(
    edge: yfiles.graph.IEdge,
    atSource: boolean,
    anchor: yfiles.geometry.Point,
    direction: yfiles.geometry.Point
  ) {
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * Gets an {@link yfiles.view.IBoundsProvider} implementation that can yield
   * this arrow's bounds if painted at the given location using the
   * given direction for the given edge.
   * @param edge the edge this arrow belongs to
   * @param atSource whether this will be the source arrow
   * @param anchor the anchor point for the tip of the arrow
   * @param direction the direction the arrow is pointing in
   * an implementation of the {@link yfiles.view.IBoundsProvider} interface that can
   * subsequently be used to query the bounds. Clients will always call
   * this method before using the implementation and may not cache the instance returned.
   * This allows for applying the flyweight design pattern to implementations.
   * @see Specified by {@link yfiles.styles.IArrow#getBoundsProvider}.
   */
  getBoundsProvider(
    edge: yfiles.graph.IEdge,
    atSource: boolean,
    anchor: yfiles.geometry.Point,
    direction: yfiles.geometry.Point
  ) {
    // Get the edge's thickness
    const style = edge.style
    this.arrowThickness = this.thickness

    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * Creates the visual for the arrow.
   * @param ctx The context that contains the information needed to create the visual.
   * The arrow visual.
   * @see Specified by {@link yfiles.view.IVisualCreator#createVisual}.
   */
  createVisual(ctx: yfiles.view.IRenderContext) {
    // create a new path to draw the arrow
    if (this.arrowFigure === null) {
      this.$arrowFigure = new yfiles.geometry.GeneralPath()
      this.$arrowFigure.moveTo(new yfiles.geometry.Point(23.5, -7.5))
      this.$arrowFigure.lineTo(new yfiles.geometry.Point(0, 0))
      this.$arrowFigure.lineTo(new yfiles.geometry.Point(23.5, 7.5))
      this.$arrowFigure.close()
    }

    const path = this.arrowFigure.createSvgPath()

    // Remember thickness for update
    ;(<any>path)['data-renderDataCache'] = this.arrowThickness

    // rotate the arrow and move it to correct position
    path.setAttribute(
      'transform',
      `matrix(${-this.direction.x} ${-this.direction.y} ${this.direction.y} ${-this.direction.x} ${
        this.anchor.x
      } ${this.anchor.y})`
    )

    return new yfiles.view.SvgVisual(path)
  }

  /**
   * This method updates or replaces a previously created {@link yfiles.view.Visual}.
   * The {@link yfiles.view.CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link demo.MySimpleArrow#createVisual}. Implementations may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param {yfiles.view.IRenderContext} ctx The context that contains the information needed to create the visual.
   * @param {yfiles.view.Visual} oldVisual The visual instance that had been returned the last time the {@link demo.MySimpleArrow#createVisual}
   * method was called.
   * The updated visual.
   * @see {@link demo.MySimpleArrow#createVisual}
   * @see {@link yfiles.view.ICanvasObjectDescriptor}
   * @see {@link yfiles.view.CanvasComponent}
   * @see Specified by {@link yfiles.view.IVisualCreator#updateVisual}.
   */
  updateVisual(ctx: yfiles.view.IRenderContext, oldVisual: yfiles.view.SvgVisual) {
    const path = oldVisual.svgElement
    // get thickness of old arrow
    const oldThickness = (<any>path)['data-renderDataCache']
    // if thickness has changed
    if (oldThickness !== this.arrowThickness) {
      // re-render arrow
      return this.createVisual(ctx)
    }

    path.setAttribute(
      'transform',
      `matrix(${-this.direction.x} ${-this.direction.y} ${this.direction.y} ${-this.direction.x} ${
        this.anchor.x
      } ${this.anchor.y})`
    )
    return oldVisual
  }

  /**
   * Returns the bounds of the arrow for the current flyweight configuration.
   * @see Specified by {@link yfiles.view.IBoundsProvider#getBounds}.
   */
  getBounds() {
    return new yfiles.geometry.Rect(
      this.anchor.x - 8 - this.arrowThickness,
      this.anchor.y - 8 - this.arrowThickness,
      16 + this.arrowThickness * 2,
      16 + this.arrowThickness * 2
    )
  }
}
