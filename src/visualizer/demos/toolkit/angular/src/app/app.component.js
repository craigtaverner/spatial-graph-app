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
var view_component_1 = require('yfiles/view-component')
var graph_component_component_1 = require('./graph-component/graph-component.component')
var data_1 = require('./data')
var layout_tree_1 = require('yfiles/layout-tree')
var router_other_1 = require('yfiles/router-other')
require('yfiles/view-layout-bridge')
var styles_template_1 = require('yfiles/styles-template')
var person_1 = require('./person')
var AppComponent = /** @class */ (function() {
  function AppComponent() {
    this.title = 'app'
  }
  AppComponent.prototype.ngAfterViewInit = function() {
    var _this = this
    var graphComponent = this.gcComponent.graphComponent
    var graph = graphComponent.graph
    graph.nodeDefaults.size = new view_component_1.Size(250, 100)
    graph.nodeDefaults.style = new styles_template_1.TemplateNodeStyle('nodeTemplate')
    graphComponent.addCurrentItemChangedListener(function() {
      _this.currentPerson = graphComponent.currentItem.tag
    })
    createSampleGraph(graph)
    runLayout(graph)
    graphComponent.fitGraphBounds()
  }
  AppComponent.prototype.zoomIn = function() {
    view_component_1.ICommand.INCREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  AppComponent.prototype.zoomOriginal = function() {
    view_component_1.ICommand.ZOOM.execute(1, this.gcComponent.graphComponent)
  }
  AppComponent.prototype.zoomOut = function() {
    view_component_1.ICommand.DECREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  AppComponent.prototype.fitContent = function() {
    view_component_1.ICommand.FIT_GRAPH_BOUNDS.execute(null, this.gcComponent.graphComponent)
  }
  __decorate(
    [core_1.ViewChild(graph_component_component_1.GraphComponentComponent)],
    AppComponent.prototype,
    'gcComponent',
    void 0
  )
  AppComponent = __decorate(
    [
      core_1.Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        styleUrls: ['./app.component.css']
      })
    ],
    AppComponent
  )
  return AppComponent
})()
exports.AppComponent = AppComponent
function createSampleGraph(graph) {
  var nodeMap = {}
  data_1.NODE_DATA.forEach(function(nodeData) {
    nodeMap[nodeData.name] = graph.createNode({
      tag: new person_1.Person(nodeData)
    })
  })
  data_1.EDGE_DATA.forEach(function(_a) {
    var from = _a.from,
      to = _a.to
    var fromNode = nodeMap[from]
    var toNode = nodeMap[to]
    if (fromNode && toNode) {
      graph.createEdge(fromNode, toNode)
    }
  })
}
function runLayout(graph) {
  var treeLayout = new layout_tree_1.TreeLayout()
  var treeReductionStage = new layout_tree_1.TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = new router_other_1.OrganicEdgeRouter()
  treeReductionStage.nonTreeEdgeSelectionKey =
    router_other_1.OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY
  treeLayout.appendStage(treeReductionStage)
  graph.applyLayout(treeLayout)
}
//# sourceMappingURL=app.component.js.map
