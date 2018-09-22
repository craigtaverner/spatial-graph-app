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
var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]
      }
    return function(d, b) {
      extendStatics(d, b)
      function __() {
        this.constructor = d
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __())
    }
  })()
Object.defineProperty(exports, '__esModule', { value: true })
var node_component_1 = require('./node.component')
var NodeComponentStyle = /** @class */ (function(_super) {
  __extends(NodeComponentStyle, _super)
  function NodeComponentStyle(injector, resolver) {
    var _this = _super.call(this) || this
    _this.injector = injector
    _this.factoryResolver = resolver
    return _this
  }
  NodeComponentStyle.prototype.createVisual = function(renderContext, node) {
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')
    // Retrieve the factory for NodeComponents
    var componentFactory = this.factoryResolver.resolveComponentFactory(
      node_component_1.NodeComponent
    )
    // Have the factory create a new NodeComponent as a child of the new SVG g element.
    var compRef = componentFactory.create(this.injector, null, g)
    // Assign the NodeComponent's nodeData input property
    compRef.instance.nodeData = node.tag
    return new yfiles.view.SvgVisual(g)
  }
  NodeComponentStyle.prototype.updateVisual = function(renderContext, oldVisual, node) {
    if (oldVisual && oldVisual.svgElement) {
      var g = oldVisual.svgElement
      g.setAttribute('transform', 'translate(' + node.layout.x + ' ' + node.layout.y + ')')
      return oldVisual
    }
    return this.createVisual(renderContext, node)
  }
  return NodeComponentStyle
})(yfiles.styles.NodeStyleBase)
exports.NodeComponentStyle = NodeComponentStyle
//# sourceMappingURL=NodeComponentStyle.js.map
