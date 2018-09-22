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

require.config({
  paths: {
    yfiles: '../../../lib/umd/yfiles/',
    utils: '../../utils/',
    resources: '../../resources/'
  }
})

/**
 * Getting Started - 11 Customize Available Port Candidates
 * This demo shows how to customize the port handling by returning a different set of ports that are available for
 * interactive edge creation.
 */
require(['yfiles/view-editor', 'resources/demo-app', 'resources/license'], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  /** @type {yfiles.graph.IGraph} */
  let graph = null

  /** main entry point for the demo */
  function run() {
    // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
    graphComponent = new yfiles.view.GraphComponent('#graphComponent')
    // conveniently store a reference to the graph that is displayed
    graph = graphComponent.graph

    // Enable grouping
    configureGroupNodeStyles()

    // /////////////// New in this Sample ////////////////

    // Add more available connection points for new edges to each node
    customizePortHandling()

    // ///////////////////////////////////////////////////

    // Configure user interaction
    configureInteraction()

    // Configure default label model parameters for newly created graph elements
    setDefaultLabelLayoutParameters()

    // Configures default styles for newly created graph elements
    setDefaultStyles()

    // Read the initial graph from a resource file instead of creating it programmatically
    // Populate the graph and override some styles and labe models
    populateGraph()

    // Enable the undo engine
    enableUndo()

    // Manage the viewport
    updateViewport()

    // bind the demo buttons to their commands
    registerCommands()

    // Initialize the demo application's CSS and Javascript for the description
    app.show(graphComponent)
  }

  // /////////////// New in this Sample ////////////////

  /**
   * Configures custom port handling. Provides more than the default port candidate in the node center.
   * This specific implementation provides port candidates for each existing port and also
   * at the node center and at each node side.
   */
  function customizePortHandling() {
    // Don't remove unoccupied ports.
    graph.nodeDefaults.ports.autoCleanUp = false

    // First, get the GraphDecorator from the IGraph.
    // GraphDecorator is a utility class that aids in decorating
    // functionality to model items from a graph instance.
    const decorator = graph.decorator

    // Here, we obtain the nodeDecorator.portCandidateProviderDecorator
    // to access the lookup decorator that handles ports candidates at nodes.
    // Basically this means that if any INode instance in the graph is queried for
    // the IPortCandidateProvider interface, the query will be handled by our code below.
    const portCandidateProviderDecorator = decorator.nodeDecorator.portCandidateProviderDecorator

    // One way to decorate the graph is to use the factory design pattern.
    // For each INode in the graph that will be queried for the IPortCandidateProvider interface, the below
    // factory method will be called with the node instance as argument.
    // We set the factory to a function expression which
    // returns a custom instance that implements the IPortCandidateProvider interface.

    // IPortCandidateProvider.combine() combines various port candidate providers.
    // IPortCandidateProvider.fromExistingPorts provides port candidates at the locations of already existing ports.
    // IPortCandidateProvider.fromNodeCenter provides a single port candidate at the center of the node.
    // IPortCandidateProvider.fromShapeGeometry provides several port candidates based on the shape of the node's style.
    portCandidateProviderDecorator.setFactory(node =>
      yfiles.input.IPortCandidateProvider.combine([
        yfiles.input.IPortCandidateProvider.fromExistingPorts(node),
        yfiles.input.IPortCandidateProvider.fromNodeCenter(node),
        yfiles.input.IPortCandidateProvider.fromShapeGeometry(node, 0.5)
      ])
    )
  }

  // ////////////////////////////////////////////////////

  /**
   * Enables the Undo functionality.
   */
  function enableUndo() {
    // Enables undo on the graph.
    graph.undoEngineEnabled = true
  }

  /**
   * Configures the default style for group nodes.
   */
  function configureGroupNodeStyles() {
    // PanelNodeStyle is a style especially suited to group nodes
    // Creates a panel with a light blue background
    graph.groupNodeDefaults.style = new yfiles.styles.PanelNodeStyle({
      color: 'rgb(214, 229, 248)',
      insets: [18, 5, 5, 5],
      labelInsetsColor: 'rgb(214, 229, 248)'
    })

    // Sets a label style with right-aligned text
    graph.groupNodeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      horizontalTextAlignment: 'right'
    })

    // Places the label at the top inside of the panel.
    // For PanelNodeStyle, InteriorStretchLabelModel is usually the most appropriate label model
    graph.groupNodeDefaults.labels.layoutParameter = yfiles.graph.InteriorStretchLabelModel.NORTH
  }

  /**
   * Configures basic interaction.
   * Interaction is handled by InputModes. {@link yfiles.input.GraphEditorInputMode} is the main
   * InputMode that already provides a large number of graph interaction gestures, such as moving, deleting, creating,
   * resizing graph elements. Note that labels can be edited by pressing F2. Also, labels can be moved to different
   * locations determined by their label model.
   */
  function configureInteraction() {
    // Creates a new GraphEditorInputMode instance and registers it as the main
    // input mode for the graphComponent
    graphComponent.inputMode = new yfiles.input.GraphEditorInputMode({
      allowGroupingOperations: true
    })
  }

  /**
   * Sets up default label model parameters for graph elements.
   * Label model parameters control the actual label placement as well as the available
   * placement candidates when moving the label interactively.
   */
  function setDefaultLabelLayoutParameters() {
    // For edge labels, the default is a label that is rotated to match the associated edge segment
    // We'll start by creating a model that is similar to the default:
    const edgeLabelModel = new yfiles.graph.EdgePathLabelModel({
      autoRotation: true,
      distance: 10,
      sideOfEdge: yfiles.graph.EdgeSides.LEFT_OF_EDGE | yfiles.graph.EdgeSides.RIGHT_OF_EDGE
    })
    // Finally, we can set this label model as the default for edge labels
    graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()
  }

  /**
   * Creates a sample graph and introduces all important graph elements present in
   * yFiles for HTML.
   */
  function populateGraph() {
    // Creates two nodes with the default node size
    // The location is specified for the _center_
    const node1 = graph.createNodeAt(new yfiles.geometry.Point(30, 30))
    const node2 = graph.createNodeAt(new yfiles.geometry.Point(150, 30))
    // Creates a third node with a different size of 60x30
    // In this case, the location of (400,400) describes the _upper left_
    // corner of the node bounds
    const node3 = graph.createNode(new yfiles.geometry.Rect(230, 200, 60, 30))

    // Creates some edges between the nodes
    graph.createEdge(node1, node2)
    const edge = graph.createEdge(node2, node3)

    // Creates the first bend for edge at (260, 30)
    graph.addBend(edge, new yfiles.geometry.Point(260, 30))

    // Actually, edges connect "ports", not nodes directly.
    // If necessary, you can manually create ports at nodes
    // and let the edges connect to these.
    // Creates a port in the center of the node layout
    const port1AtNode1 = graph.addPort(
      node1,
      yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    )

    // Creates a port at the middle of the left border
    // Note to use absolute locations when placing ports using PointD.
    const port1AtNode3 = graph.addPortAt(
      node3,
      new yfiles.geometry.Point(node3.layout.x, node3.layout.center.y)
    )

    // Creates an edge that connects these specific ports
    const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

    // Adds labels to several graph elements
    graph.addLabel(node1, 'n1')
    graph.addLabel(node2, 'n2')
    const n3Label = graph.addLabel(node3, 'n3')
    graph.addLabel(edgeAtPorts, 'Edge at Ports')

    // For our "special" label, we use a model that describes discrete positions
    // outside the node bounds
    const exteriorLabelModel = new yfiles.graph.ExteriorLabelModel()

    // We use some extra insets from the label to the node bounds
    exteriorLabelModel.insets = new yfiles.geometry.Insets(5)

    // We assign this label a specific symbolic position out of the eight possible
    // external locations valid for ExteriorLabelModel
    graph.setLabelLayoutParameter(
      n3Label,
      exteriorLabelModel.createParameter(yfiles.graph.ExteriorLabelModelPosition.SOUTH)
    )
  }

  /**
   * Assigns default styles for graph elements.
   * Default styles apply only to elements created after the default style has been set,
   * so typically, you'd set these as early as possible in your application.
   */
  function setDefaultStyles() {
    // Sets the default style for nodes
    graph.nodeDefaults.style = new yfiles.styles.ShinyPlateNodeStyle({
      fill: new yfiles.view.SolidColorFill(255, 140, 0)
    })

    // Create an edge style that will apply the new default pen
    // to the entire line using PolyLineEdgeStyle,
    // which draws a polyline determined by the edge's control points (bends)
    // and assign the defined edge style as the default for all edges that don't have
    // another style assigned explicitly
    graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
      stroke: '2px red',
      targetArrow: new yfiles.styles.Arrow({
        type: 'default',
        stroke: '2px red',
        fill: 'red'
      })
    })

    // Sets the default style for both node and edge labels
    // Creates a label style with the label text color set to dark red
    const defaultLabelStyle = new yfiles.styles.DefaultLabelStyle({
      font: '12px Tahoma',
      textFill: 'darkred'
    })
    graph.edgeDefaults.labels.style = defaultLabelStyle
    graph.nodeDefaults.labels.style = defaultLabelStyle

    // Set the default size explicitly to 40x40
    graph.nodeDefaults.size = new yfiles.geometry.Size(40, 40)
  }

  /**
   * Updates the content rectangle to encompass all existing graph elements.
   * If you create your graph elements programmatically, the content rectangle
   * (i.e. the rectangle in <b>world coordinates</b>
   * that encloses the graph) is <b>not</b> updated automatically to enclose these elements.
   * Typically, this manifests in wrong/missing scrollbars, incorrect {@link yfiles.view.GraphOverviewComponent}
   * behavior and the like.
   *
   * This method demonstrates several ways to update the content rectangle, with or without adjusting the zoom level
   * to show the whole graph in the view.
   *
   * Note that updating the content rectangle only does not change the current view port (i.e. the world coordinate
   * rectangle that corresponds to the currently visible area in view coordinates)
   *
   * Uncomment various combinations of lines in this method and observe the different effects.
   */
  function updateViewport() {
    // Uncomment the following line to update the content rectangle
    // to include all graph elements
    // This should result in correct scrolling behaviour:

    // graphComponent.updateContentRect();

    // Additionally, we can also set the zoom level so that the
    // content rectangle fits exactly into the viewport area:
    // Uncomment this line in addition to UpdateContentRect:
    // Note that this changes the zoom level (i.e. the graph elements will look smaller)

    // graphComponent.fitContent();

    // The sequence above is equivalent to just calling:
    graphComponent.fitGraphBounds()
  }

  /** Helper method that binds the various commands available in yFiles for HTML to the buttons
   * in the demo's toolbar.
   */
  function registerCommands() {
    const ICommand = yfiles.input.ICommand

    app.bindCommand("button[data-command='Open']", ICommand.OPEN, graphComponent)
    app.bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)

    app.bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
    app.bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
    app.bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)

    app.bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
    app.bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
    app.bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
    app.bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

    app.bindCommand(
      "button[data-command='GroupSelection']",
      ICommand.GROUP_SELECTION,
      graphComponent
    )
    app.bindCommand(
      "button[data-command='UngroupSelection']",
      ICommand.UNGROUP_SELECTION,
      graphComponent
    )
  }

  // start tutorial
  run()
})
