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

define(['yfiles/view-editor'], /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles => {
  /**
   * The {@link yfiles.input.OrthogonalEdgeHelper} for blue edges. Orthogonal edge
   * editing is enabled for the inner segments of this edges but not for the
   * first and last one.
   * @extends yfiles.input.OrthogonalEdgeHelper
   */
  class BlueOrthogonalEdgeHelper extends yfiles.input.OrthogonalEdgeHelper {
    /**
     * Returns the NonOrthogonal segment orientation for the first and last
     * segment, and the default for all other segments.
     * @param {yfiles.input.IInputModeContext} inputModeContext  The input mode context in which the orientation is
     *   needed
     * @param {yfiles.graph.IEdge} edge The edge to inspect.
     * @param {number} segmentIndex The index of the segment
     * @see Overrides {@link yfiles.input.OrthogonalEdgeHelper#getSegmentOrientation}
     * @see Specified by {@link yfiles.input.IOrthogonalEdgeHelper#getSegmentOrientation}.
     * @return {yfiles.input.SegmentOrientation}
     */
    getSegmentOrientation(inputModeContext, edge, segmentIndex) {
      return segmentIndex === 0 || segmentIndex === edge.bends.size
        ? yfiles.input.SegmentOrientation.NON_ORTHOGONAL
        : super.getSegmentOrientation(inputModeContext, edge, segmentIndex)
    }
  }

  return BlueOrthogonalEdgeHelper
})
