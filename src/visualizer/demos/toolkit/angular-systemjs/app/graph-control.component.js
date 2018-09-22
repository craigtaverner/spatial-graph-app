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
var __decorate =
  (this && this.__decorate) ||
  function(decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc)
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
Object.defineProperty(exports, '__esModule', { value: true })
var core_1 = require('@angular/core')
var NodeComponentStyle_1 = require('./NodeComponentStyle')
var node_component_1 = require('./node.component')
var GraphControlComponent = /** @class */ (function() {
  function GraphControlComponent(_dataService, _element, _injector, _resolver) {
    this._dataService = _dataService
    this._element = _element
    this._injector = _injector
    this._resolver = _resolver
    this.currentItem = new core_1.EventEmitter()
  }
  GraphControlComponent.prototype.ngAfterViewInit = function() {
    var _this = this
    var containerDiv = this._element.nativeElement.getElementsByClassName(
      'graph-component-container'
    )[0]
    this._graphComponent = new yfiles.view.GraphComponent(containerDiv)
    this._graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()
    this._graphComponent.addCurrentItemChangedListener(function(sender, args) {
      var currentNode = sender.currentItem
      var currentNodeData = currentNode.tag
      _this.currentItem.emit(currentNodeData)
    })
    Promise.all([this._dataService.getNodeData(), this._dataService.getEdgeData()]).then(function(
      values
    ) {
      var nodes = values[0]
      var edges = values[1]
      var graphBuilder = new yfiles.binding.GraphBuilder(_this._graphComponent.graph)
      graphBuilder.graph.nodeDefaults.style = new NodeComponentStyle_1.NodeComponentStyle(
        _this._injector,
        _this._resolver
      )
      graphBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(250, 100)
      graphBuilder.nodeIdBinding = 'name'
      graphBuilder.sourceNodeBinding = 'from'
      graphBuilder.targetNodeBinding = 'to'
      // assign the nodes and edges source - filter the nodes
      graphBuilder.nodesSource = nodes
      graphBuilder.edgesSource = edges
      // build the graph from the source data
      var graph = graphBuilder.buildGraph()
      _this._graphComponent.graph = graph
      _this._doLayout()
      _this._graphComponent.fitGraphBounds()
    })
  }
  GraphControlComponent.prototype._createTreeLayout = function() {
    var gtl = new yfiles.tree.TreeLayout()
    var /**yfiles.tree.TreeReductionStage*/ treeReductionStage = new yfiles.tree.TreeReductionStage()
    treeReductionStage.nonTreeEdgeRouter = new yfiles.router.OrganicEdgeRouter()
    treeReductionStage.nonTreeEdgeSelectionKey =
      yfiles.router.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
    gtl.appendStage(treeReductionStage)
    return gtl
  }
  GraphControlComponent.prototype._doLayout = function() {
    this._graphComponent.graph.applyLayout(this._createTreeLayout())
  }
  __decorate([core_1.Output()], GraphControlComponent.prototype, 'currentItem', void 0)
  GraphControlComponent = __decorate(
    [
      core_1.Component({
        entryComponents: [node_component_1.NodeComponent],
        selector: 'graph-component',
        //directives: [NodeComponent],
        template: '<div class="graph-component-container"></div>',
        styles: [
          '\n    .graph-component-container {\n      position: absolute;\n      left: 0;\n      top: 60px;\n      right: 0;\n      bottom: 0;\n      background-color: #FFFFFF;\n    }\n  '
        ]
      })
    ],
    GraphControlComponent
  )
  return GraphControlComponent
})()
exports.GraphControlComponent = GraphControlComponent
//# sourceMappingURL=graph-control.component.js.map
