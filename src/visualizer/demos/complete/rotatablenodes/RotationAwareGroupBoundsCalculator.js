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

define(['yfiles/view-component', 'RotatableNodes.js'], (yfiles, RotatableNodes) => {
  /**
   * Calculates group bounds taking the rotated layout for nodes which
   * {@link RotatableNodes.RotatableNodeStyleDecorator support rotation}.
   */
  class RotationAwareGroupBoundsCalculator extends yfiles.lang.Class(
    yfiles.graph.IGroupBoundsCalculator
  ) {
    /**
     * Calculates the minimum bounds for the given group node to enclose all its children plus insets.
     * @param {yfiles.graph.IGraph} graph
     * @param {yfiles.graph.INode} groupNode
     * @return {yfiles.geometry.Rect}
     */
    calculateBounds(graph, groupNode) {
      let bounds = yfiles.geometry.Rect.EMPTY
      graph.getChildren(groupNode).forEach(node => {
        const styleWrapper = node.style
        if (styleWrapper instanceof RotatableNodes.RotatableNodeStyleDecorator) {
          // if the node supports rotation: add the outer bounds of the rotated layout
          bounds = yfiles.geometry.Rect.add(bounds, styleWrapper.getRotatedLayout(node).bounds)
        } else {
          // in all other cases: add the node's layout
          bounds = yfiles.geometry.Rect.add(bounds, node.layout.toRect())
        }
      })
      // if we have content: add insets
      return bounds.isEmpty ? bounds : bounds.getEnlarged(getInsets(groupNode))
    }
  }

  /**
   * Returns insets to add to apply to the given groupNode.
   * @param {yfiles.graph.INode} groupNode
   * @return {yfiles.geometry.Insets}
   */
  function getInsets(groupNode) {
    const provider = groupNode.lookup(yfiles.input.INodeInsetsProvider.$class)
    if (provider) {
      // get the insets from the node's insets provider if there is one
      return provider.getInsets(groupNode)
    }
    // otherwise add 5 to each border
    return new yfiles.geometry.Insets(5)
  }

  return RotationAwareGroupBoundsCalculator
})
