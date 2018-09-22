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
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function') {
      r = Reflect.decorate(decorators, target, key, desc)
    } else {
      for (var i = decorators.length - 1; i >= 0; i--) {
        if ((d = decorators[i])) {
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r
        }
      }
    }
    return c > 3 && r && Object.defineProperty(target, key, r), r
  }
Object.defineProperty(exports, '__esModule', { value: true })
var core_1 = require('@angular/core')
var view_component_1 = require('yfiles/view-component')
var GraphComponentComponent = /** @class */ (function() {
  function GraphComponentComponent() {}

  GraphComponentComponent.prototype.ngAfterViewInit = function() {
    this.graphComponent = new view_component_1.GraphComponent(this.graphComponentRef.nativeElement)
    this.graphComponent.inputMode = new view_component_1.GraphViewerInputMode()
  }
  __decorate(
    [core_1.ViewChild('graphComponentRef')],
    GraphComponentComponent.prototype,
    'graphComponentRef',
    void 0
  )
  GraphComponentComponent = __decorate(
    [
      core_1.Component({
        selector: 'graph-component',
        templateUrl: './graph-component.component.html',
        styleUrls: ['./graph-component.component.css']
      })
    ],
    GraphComponentComponent
  )
  return GraphComponentComponent
})()
exports.GraphComponentComponent = GraphComponentComponent
//# sourceMappingURL=graph-component.component.js.map
