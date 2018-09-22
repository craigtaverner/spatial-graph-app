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
define(["require", "exports", "yfiles/view-component"], function (require, exports, yfiles) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MyNodeStyle extends yfiles.styles.NodeStyleBase {
        constructor() {
            super();
        }
        createVisual(context, node) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const { x, y, width, height } = node.layout;
            rect.setAttribute('width', width.toString());
            rect.setAttribute('height', height.toString());
            rect.setAttribute('fill', '#336699');
            g.appendChild(rect);
            g.setAttribute('transform', `translate(${node.layout.x} ${node.layout.y})`);
            let svgVisual = new yfiles.view.SvgVisual(g);
            svgVisual.layout = { x, y, width, height };
            return svgVisual;
        }
        updateVisual(context, oldVisual, node) {
            const { x, y, width, height } = node.layout;
            let oldLayout = oldVisual.layout;
            if (oldLayout.x !== x || oldLayout.y !== y) {
                // make sure that the location is up to date
                ;
                oldVisual.svgElement.transform.baseVal
                    .getItem(0)
                    .setTranslate(node.layout.x, node.layout.y);
                oldLayout.x = x;
                oldLayout.y = y;
            }
            if (oldLayout.width !== width || oldLayout.height !== height) {
                const rect = oldVisual.svgElement.firstChild;
                rect.setAttribute('width', node.layout.width.toString());
                rect.setAttribute('height', node.layout.height.toString());
            }
            return oldVisual;
        }
    }
    exports.MyNodeStyle = MyNodeStyle;
});
//# sourceMappingURL=MyNodeStyle.js.map
