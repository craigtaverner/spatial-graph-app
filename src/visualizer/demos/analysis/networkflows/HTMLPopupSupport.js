/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.1.0.4.
 ** Copyright (c) 2000-2018 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
'use strict'

define(['yfiles/view-component'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * This class adds an HTML panel on top of the contents of the GraphComponent that can
   * display arbitrary information about a {@link yfiles.graph.IModelItem graph item}.
   * In order to not interfere with the positioning of the pop-up, HTML content
   * should be added as ancestor of the {@link HTMLPopupSupport#div div element}, and
   * use relative positioning. This implementation uses a {@link yfiles.graph.ILabelModelParameter label model
   * parameter} to determine the position of the pop-up.
   */
  class HTMLPopupSupport {
    /**
     * Constructor that takes the graphComponent, the container div element and an ILabelModelParameter
     * to determine the relative position of the popup.
     * @param {yfiles.view.GraphComponent} graphComponent
     * @param {HTMLElement} div
     * @param {yfiles.graph.ILabelModelParameter] labelModelParameter
     */
    constructor(graphComponent, div, labelModelParameter) {
      this.graphComponent = graphComponent
      this.labelModelParameter = labelModelParameter
      this.$div = div
      this.$currentItem = null
      this.$dirty = false

      // make the popup invisible
      div.style.opacity = '0'
      div.style.display = 'none'

      this.registerListeners()
    }

    /**
     * Sets the container {@link HTMLPopupSupport#div div element}.
     * @param {HTMLElement} value The div to be set
     */
    set div(value) {
      this.$div = value
    }

    /**
     * Gets the container {@link HTMLPopupSupport#div div element}.
     * @return {HTMLElement} The container div
     */
    get div() {
      return this.$div
    }

    /**
     * Sets the {@link yfiles.graph.IModelItem item} to display information for.
     * Setting this property to a value other than null shows the pop-up.
     * Setting the property to null hides the pop-up.
     * @param {yfiles.graph.IModelItem} value The current graph item
     */
    set currentItem(value) {
      if (value === this.$currentItem) {
        return
      }
      this.$currentItem = value
      if (value !== null) {
        this.show()
      } else {
        this.hide()
      }
    }

    /**
     * Gets the {@link yfiles.graph.IModelItem item} to display information for.
     * @return {yfiles.graph.IModelItem} The current graph item
     */
    get currentItem() {
      return this.$currentItem
    }

    /**
     * Sets the flag for the current position is no longer valid.
     * @param {boolean} value True if the current position is no longer valid, false otherwise
     */
    set dirty(value) {
      this.$dirty = value
    }

    /**
     * Gets the flag for the current position is no longer valid.
     * @return {boolean} True if the current position is no longer valid, false otherwise
     */
    get dirty() {
      return this.$dirty
    }

    /**
     * Registers viewport, node bounds changes and visual tree listeners to the given graphComponent.
     */
    registerListeners() {
      // Adds listener for viewport changes
      this.graphComponent.addViewportChangedListener((sender, propertyChangedEventArgs) => {
        if (this.currentItem) {
          this.dirty = true
        }
      })

      // Adds listeners for node bounds changes
      this.graphComponent.graph.addNodeLayoutChangedListener((node, oldLayout) => {
        if (
          ((this.currentItem && this.currentItem === node) ||
            yfiles.graph.IEdge.isInstance(this.currentItem)) &&
          (node === this.currentItem.sourcePort.owner || node === this.currentItem.targetPort.owner)
        ) {
          this.dirty = true
        }
      })

      // Adds listener for updates of the visual tree
      this.graphComponent.addUpdatedVisualListener((sender, eventArgs) => {
        if (this.currentItem && this.dirty) {
          this.dirty = false
          this.updateLocation()
        }
      })
    }

    /**
     * Makes this pop-up visible.
     */
    show() {
      this.div.style.display = 'block'
      this.div.style.opacity = '1'
      this.updateLocation()
    }

    /**
     * Hides this pop-up.
     */
    hide() {
      this.div.style.opacity = '0'
      this.div.style.display = 'none'
    }

    /**
     * Changes the location of this pop-up to the location calculated by the
     * {@link HTMLPopupSupport#labelModelParameter}. Currently, this implementation does not support rotated pop-ups.
     */
    updateLocation() {
      if (!this.currentItem && !this.labelModelParameter) {
        return
      }
      const width = this.div.clientWidth
      const height = this.div.clientHeight
      const zoom = this.graphComponent.zoom

      const dummyLabel = new yfiles.graph.SimpleLabel(
        this.currentItem,
        '',
        this.labelModelParameter
      )
      if (this.labelModelParameter.supports(dummyLabel)) {
        dummyLabel.preferredSize = new yfiles.geometry.Size(width / zoom, height / zoom)
        const newLayout = this.labelModelParameter.model.getGeometry(
          dummyLabel,
          this.labelModelParameter
        )
        this.setLocation(newLayout.anchorX, newLayout.anchorY - (height + 10) / zoom)
      }
    }

    /**
     * Sets the location of this pop-up to the given world coordinates.
     * @param {number} x The target x-coordinate of the pop-up.
     * @param {number} y The target y-coordinate of the pop-up.
     */
    setLocation(x, y) {
      // Calculate the view coordinates since we have to place the div in the regular HTML coordinate space
      const viewPoint = this.graphComponent.toViewCoordinates(new yfiles.geometry.Point(x, y))
      this.div.style.left = `${viewPoint.x}px`
      this.div.style.top = `${viewPoint.y}px`
    }
  }

  return HTMLPopupSupport
})
