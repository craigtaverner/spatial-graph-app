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
var NodeComponent = /** @class */ (function() {
  function NodeComponent(changeDetector) {
    var _this = this
    this.changeDetector = changeDetector
    this.nodeData = {}
    // When a NodeComponent is displayed in the GraphComponent,
    // we need to poll for changes manually, because the node visualization is not part
    // of the regular Angular 2 component hierarchy.
    setTimeout(function() {
      return _this.changeDetector.detectChanges()
    }, 0)
    setInterval(function() {
      return _this.changeDetector.detectChanges()
    }, 500)
  }
  __decorate([core_1.Input()], NodeComponent.prototype, 'nodeData', void 0)
  NodeComponent = __decorate(
    [
      core_1.Component({
        selector: 'g[node-component]',
        template:
          '<svg:g><rect fill="url(#nodeGradient)" stroke="#249AE7" stroke-width="3" rx="8" ry="8" width="250" height="100"/><image [attr.xlink:href]="nodeData.icon" transform="translate(5 15)" width="58px" height="66px" xlink:href="resources/usericon_female1.svg"></image><text transform="translate(80 20)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.name}}</text><text transform="translate(80 38)" style="font-size:8px; font-family:Arial; fill:#505050">{{nodeData.position}}</text><text transform="translate(80 56)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.email}}</text><text transform="translate(80 74)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.phone}}</text><text transform="translate(80 92)" style="font-size:10px; font-family:Arial; fill:#505050">{{nodeData.fax}}</text></svg:g>\''
      })
    ],
    NodeComponent
  )
  return NodeComponent
})()
exports.NodeComponent = NodeComponent
//# sourceMappingURL=node.component.js.map
