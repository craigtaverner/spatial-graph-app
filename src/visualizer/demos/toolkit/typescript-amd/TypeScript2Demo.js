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
define(["require", "exports", "../../resources/demo-util", "yfiles/view-editor", "./MyArrow", "./MyMarqueeTemplate", "./MyNodeStyle"], function (require, exports, app, yfiles, MyArrow_1, MyMarqueeTemplate_1, MyNodeStyle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        app.show();
        document.getElementById('graphOverviewComponent').style.display = 'block';
        const demo = new TypeScript2Demo();
        demo.initializeGraph();
        demo.registerCommands();
    }
    exports.run = run;
    class TypeScript2Demo {
        get graphComponent() {
            return this._graphComponent;
        }
        get graph() {
            return this.graphComponent.graph;
        }
        constructor() {
            this._graphComponent = new yfiles.view.GraphComponent('graphComponent');
            const overviewComponent = new yfiles.view.GraphOverviewComponent('overviewComponent');
            overviewComponent.graphComponent = this._graphComponent;
            const geim = new yfiles.input.GraphEditorInputMode();
            geim.marqueeSelectionInputMode.template = new MyMarqueeTemplate_1.MyMarqueeTemplate();
            this.graphComponent.inputMode = geim;
            this.graph.nodeDefaults.style = new MyNodeStyle_1.MyNodeStyle();
            this.graph.nodeDefaults.size = new yfiles.geometry.Size(40, 40);
            this.graph.nodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
                textFill: yfiles.view.Fill.WHITE
            });
            const pes = new yfiles.styles.PolylineEdgeStyle();
            const arrow = new MyArrow_1.MySimpleArrow();
            arrow.arrowThickness = 10;
            pes.targetArrow = arrow;
            this.graph.edgeDefaults.style = pes;
        }
        initializeGraph() {
            let n = null;
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    let p = this.graph.createNodeAt(new yfiles.geometry.Point(100 * j, 100 * i));
                    if (n) {
                        this.graph.createEdge(n, p);
                    }
                    n = p;
                }
            }
            this.graph.nodes.forEach((node, i) => this.graph.addLabel(node, i.toString()));
            this.graphComponent.fitGraphBounds();
        }
        registerCommands() {
            const iCommand = yfiles.input.ICommand;
            app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, this.graphComponent, null);
            app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, this.graphComponent, null);
            app.bindCommand("button[data-command='FitContent']", iCommand.FIT_GRAPH_BOUNDS, this.graphComponent, null);
            app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, this.graphComponent, 1.0);
        }
    }
    exports.TypeScript2Demo = TypeScript2Demo;
});
//# sourceMappingURL=TypeScript2Demo.js.map
