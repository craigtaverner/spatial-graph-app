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
   * Static helper class to create UML styles and provide methods to check for certain styles.
   */
  class UMLEdgeStyleFactory {
    static createAssociationStyle() {
      return new yfiles.styles.PolylineEdgeStyle()
    }

    static createDirectedAssociationStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        targetArrow: new yfiles.styles.Arrow({
          stroke: yfiles.view.Stroke.BLACK,
          fill: yfiles.view.Fill.BLACK,
          type: yfiles.styles.ArrowType.DEFAULT
        })
      })
    }

    static createRealizationStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        stroke: new yfiles.view.Stroke({
          dashStyle: yfiles.view.DashStyle.DASH
        }),
        sourceArrow: new yfiles.styles.Arrow({
          stroke: yfiles.view.Stroke.BLACK,
          fill: yfiles.view.Fill.WHITE,
          type: yfiles.styles.ArrowType.TRIANGLE
        })
      })
    }

    static createGeneralizationStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        sourceArrow: new yfiles.styles.Arrow({
          stroke: yfiles.view.Stroke.BLACK,
          fill: yfiles.view.Fill.WHITE,
          type: yfiles.styles.ArrowType.TRIANGLE
        })
      })
    }

    static createAggregationStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        sourceArrow: new yfiles.styles.Arrow({
          stroke: yfiles.view.Stroke.BLACK,
          fill: yfiles.view.Fill.WHITE,
          type: yfiles.styles.ArrowType.DIAMOND
        })
      })
    }

    static createDependencyStyle() {
      return new yfiles.styles.PolylineEdgeStyle({
        stroke: new yfiles.view.Stroke({
          dashStyle: yfiles.view.DashStyle.DASH
        }),
        targetArrow: new yfiles.styles.Arrow({
          stroke: yfiles.view.Stroke.BLACK,
          fill: yfiles.view.Fill.BLACK,
          type: yfiles.styles.ArrowType.DEFAULT
        })
      })
    }

    /**
     * Inheritance styles, i.e. generalization or realization
     * @param style
     * @returns {boolean}
     */
    static isInheritance(style) {
      return UMLEdgeStyleFactory.isGeneralization(style) || UMLEdgeStyleFactory.isRealization(style)
    }

    /**
     * If the style symbolizes a generalization.
     * @param style
     * @returns {boolean}
     */
    static isGeneralization(style) {
      if (!style.stroke || !style.sourceArrow) {
        return false
      }
      return (
        style.stroke.dashStyle === yfiles.view.DashStyle.SOLID &&
        style.sourceArrow.type === yfiles.styles.ArrowType.TRIANGLE
      )
    }

    /**
     * If the style symbolizes a realization.
     * @param style
     * @returns {boolean}
     */
    static isRealization(style) {
      if (!style.stroke || !style.sourceArrow) {
        return false
      }
      return (
        style.stroke.dashStyle === yfiles.view.DashStyle.DASH &&
        style.sourceArrow.type === yfiles.styles.ArrowType.TRIANGLE
      )
    }
  }

  return UMLEdgeStyleFactory
})
