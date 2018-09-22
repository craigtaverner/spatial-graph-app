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
  /** the size of the port rendering */
  const WIDTH = 4
  const HEIGHT = 4

  /**
   * This class is an example of a custom port style based on the {@link yfiles.styles.PortStyleBase} class.
   * The port is rendered as a circle.
   */
  class MySimplePortStyle extends yfiles.styles.PortStyleBase {
    /** @return {yfiles.view.SvgVisual} */
    createVisual(context, port) {
      // create the ellipse
      const ellipse = window.document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
      ellipse.setAttribute('fill', 'none')
      ellipse.setAttribute('stroke', 'rgb(255,255,255)')
      ellipse.setAttribute('stroke-opacity', 0.31)
      ellipse.cx.baseVal.value = WIDTH * 0.5
      ellipse.cy.baseVal.value = HEIGHT * 0.5
      ellipse.rx.baseVal.value = WIDTH * 0.5
      ellipse.ry.baseVal.value = HEIGHT * 0.5
      // and arrange it
      const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
      const locationX = portLocation.x - WIDTH * 0.5
      const locationY = portLocation.y - HEIGHT * 0.5
      yfiles.view.SvgVisual.setTranslate(ellipse, locationX, locationY)
      return new yfiles.view.SvgVisual(ellipse)
    }

    /** @return {yfiles.view.SvgVisual} */
    updateVisual(context, oldVisual, port) {
      const ellipse = oldVisual.svgElement
      const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
      // arrange the old ellipse
      const locationX = portLocation.x - WIDTH * 0.5
      const locationY = portLocation.y - HEIGHT * 0.5
      yfiles.view.SvgVisual.setTranslate(ellipse, locationX, locationY)
      return oldVisual
    }

    /**
     * Calculates the bounds of this port.
     * These are also used for arranging the visual, hit testing, visibility testing, and marquee box tests.
     * @see Overrides {@link yfiles.styles.PortStyleBase#getBounds}
     * @return {yfiles.geometry.Rect}
     */
    getBounds(canvasContext, port) {
      const portLocation = port.locationParameter.model.getLocation(port, port.locationParameter)
      return yfiles.geometry.Rect.fromCenter(portLocation, new yfiles.geometry.Size(WIDTH, HEIGHT))
    }
  }

  return MySimplePortStyle
})
