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

/**
 * This demo show how to create and use a relatively simple, non-interactive custom style
 * for nodes, labels, edges, and ports, as well as a custom arrow.
 */
require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

require([
  'yfiles/view-editor',
  'resources/demo-app',
  'MySimpleNodeStyle.js',
  'MySimpleEdgeStyle.js',
  'MySimpleLabelStyle.js',
  'yfiles/view-folding',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  MySimpleNodeStyle,
  MySimpleEdgeStyle,
  MySimpleLabelStyle
) => {
  let labelStyle = null

  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graph.IGraph} */
  let graph = null

  /** @type {HTMLSelectElement} */
  let wrappingSelect = null

  function run() {
    // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')
    // conveniently store a reference to the graph that is displayed
    graph = graphComponent.graph

    // initialize the graph
    initializeGraph()

    // initialize the input mode
    graphComponent.inputMode = createEditorMode()

    // initialize the select box
    wrappingSelect = document.querySelector("select[data-command='SetWrapping']")
    wrappingSelect.selectedIndex = 4
    setLabelWrapping(yfiles.view.TextWrapping.WORD_ELLIPSIS)

    graphComponent.fitGraphBounds()

    // bind the demo buttons to their commands
    registerCommands()

    // Initialize the demo application's CSS and Javascript for the description
    app.show(graphComponent)
  }

  // ////////////// New in this sample ////////////////
  /**
   * Changes the label wrapping for the default label style.
   */
  function setLabelWrapping(wrapping) {
    if (labelStyle !== null && labelStyle.wrapping !== wrapping) {
      labelStyle.wrapping = wrapping
      graphComponent.invalidate()
    }
  }

  // //////////////////////////////////////////////////
  /**
   * Helper method that binds the various commands available in yFiles for HTML to the buttons
   * in the demo's toolbar.
   */
  function registerCommands() {
    const ICommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
    wrappingSelect.addEventListener('change', onWrappingSelectChanged)
  }

  function onWrappingSelectChanged() {
    // Change the wrapping of the label style
    const value = wrappingSelect.options[wrappingSelect.selectedIndex].value
    if (value) {
      switch (value) {
        case 'none':
          setLabelWrapping(yfiles.view.TextWrapping.NONE)
          break
        case 'character':
          setLabelWrapping(yfiles.view.TextWrapping.CHARACTER)
          break
        case 'word':
          setLabelWrapping(yfiles.view.TextWrapping.WORD)
          break
        case 'characterEllipsis':
          setLabelWrapping(yfiles.view.TextWrapping.CHARACTER_ELLIPSIS)
          break
        case 'wordEllipsis':
          setLabelWrapping(yfiles.view.TextWrapping.WORD_ELLIPSIS)
          break
        default:
          setLabelWrapping(yfiles.view.TextWrapping.WORD)
      }
    }
  }

  /**
   * Sets a custom NodeStyle instance as a template for newly created
   * nodes in the graph.
   */
  function initializeGraph() {
    // Create a new style and use it as default node style
    graph.nodeDefaults.style = new MySimpleNodeStyle()
    // Create a new style and use it as default edge style
    graph.edgeDefaults.style = new MySimpleEdgeStyle()
    // Create a new style and use it as default label style
    labelStyle = new MySimpleLabelStyle()
    graph.nodeDefaults.labels.style = labelStyle
    // Place labels above nodes, with a small gap
    const labelModel = new yfiles.graph.ExteriorLabelModel({ insets: 5 })
    graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )

    graph.edgeDefaults.labels.style = new MySimpleLabelStyle()

    graph.nodeDefaults.size = new yfiles.geometry.Size(50, 50)

    // Create some graph elements with the above defined styles.
    createSampleGraph()
  }

  /**
   * Creates the default input mode for the graphComponent,
   * a {@link yfiles.input.GraphEditorInputMode}.
   * @return {yfiles.input.IInputMode} a new GraphEditorInputMode instance
   */
  function createEditorMode() {
    return new yfiles.input.GraphEditorInputMode({
      allowEditLabel: true
    })
  }

  /**
   * Creates the initial sample graph.
   */
  function createSampleGraph() {
    const node0 = graph.createNode(new yfiles.geometry.Rect(180, 40, 30, 30))
    const node1 = graph.createNode(new yfiles.geometry.Rect(260, 50, 30, 30))
    const node2 = graph.createNode(new yfiles.geometry.Rect(284, 200, 30, 30))
    const node3 = graph.createNode(new yfiles.geometry.Rect(350, 40, 30, 30))
    const edge0 = graph.createEdge(node1, node2)
    // Add some bends
    graph.addBend(edge0, new yfiles.geometry.Point(350, 130))
    graph.addBend(edge0, new yfiles.geometry.Point(230, 170))
    graph.createEdge(node1, node0)
    graph.createEdge(node1, node3)

    // Create a node label with a long text that does not fit the label bounds
    graph.addLabel(node1, 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr')
  }

  // Start demo
  run()
})
