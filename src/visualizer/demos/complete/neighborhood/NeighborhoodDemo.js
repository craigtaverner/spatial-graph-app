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

require([
  'yfiles/view-component',
  'resources/demo-app',
  'resources/demo-styles',
  './NeighborhoodView.js',
  'yfiles/view-folding',
  'yfiles/view-graphml',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  DemoStyles,
  NeighborhoodView
) => {
  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The NeighborhoodView.
   * @type {NeighborhoodView}
   */
  let neighborhoodView = null

  // get hold of some UI elements
  const nextButton = document.getElementById('nextButton')
  const previousButton = document.getElementById('previousButton')
  const graphChooserBox = document.getElementById('graphChooserBox')
  const neighborhoodModeChooserBox = document.getElementById('neighborhoodModeChooserBox')
  const neighborhoodMaxDistanceSlider = document.getElementById('neighborhoodMaxDistanceSlider')

  function run() {
    // initialize the GraphComponent
    graphComponent = new yfiles.view.GraphComponent('graphComponent')

    // wire up the UI
    registerCommands()

    // use the file system for built-in I/O
    enableGraphML()

    // // first initialize the graph component
    initializeGraphComponent()
    initializeNeighborhoodView()
    initializeHighlighting()

    // initializes the graphs' combobox
    if (graphChooserBox !== null) {
      ;['social-network', 'computer-network', 'orgchart', 'nesting'].forEach(sample => {
        const option = document.createElement('option')
        option.text = sample
        option.value = sample
        graphChooserBox.add(option)
      })
    }

    // initializes the neighborhood modes' combobox
    if (neighborhoodModeChooserBox !== null) {
      ;['Neighborhood', 'Predecessors', 'Successors', 'FolderContents'].forEach(sample => {
        const option = document.createElement('option')
        option.text = sample
        option.value = sample
        neighborhoodModeChooserBox.add(option)
      })
    }

    neighborhoodMaxDistanceSlider.min = 1
    neighborhoodMaxDistanceSlider.max = 5
    neighborhoodMaxDistanceSlider.value = 1

    neighborhoodMaxDistanceSlider.addEventListener(
      'change',
      evt => {
        neighborhoodView.maxDistance = parseInt(neighborhoodMaxDistanceSlider.value)
        document.getElementById(
          'neighborhoodMaxDistanceLabel'
        ).textContent = neighborhoodMaxDistanceSlider.value.toString()
      },
      true
    )

    // creates the input mode
    graphComponent.inputMode = createEditorMode()

    // initialize the graph and the defaults
    initConverters()
    DemoStyles.initDemoStyles(graphComponent.graph)

    // reads the sample graph
    readSampleGraph()

    // initialize the demo
    app.show(graphComponent)
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  function enableGraphML() {
    // create a new GraphMLSupport instance that handles save and load operations
    const gs = new yfiles.graphml.GraphMLSupport({
      graphComponent,
      // configure to load and save to the file system
      storageLocation: yfiles.graphml.StorageLocation.FILE_SYSTEM
    })
    const ioh = new yfiles.graphml.GraphMLIOHandler()
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    gs.graphMLIOHandler = ioh
  }

  /**
   * Initializes the graph component
   */
  function initializeGraphComponent() {
    // enables graph folding
    enableFolding()

    graphComponent.selection.addItemSelectionChangedListener(onItemSelectedDeselected)
  }

  /**
   * Called when the graph selection changes, e.g. nodes/edges are selected/deselected.
   * @param {object} sender
   * @param {yfiles.view.ItemSelectionChangedEventArgs} args
   */
  function onItemSelectedDeselected(sender, args) {
    if (yfiles.graph.INode.isInstance(graphComponent.currentItem)) {
      const nodes = new yfiles.collections.List(graphComponent.selection.selectedNodes)
      highlightNodes(nodes)
    }
  }

  /**
   * Enable folding - change the GraphComponents graph to a managed view
   * that provides the actual collapse/expand state.
   */
  function enableFolding() {
    // create the manager
    const foldingManager = new yfiles.graph.FoldingManager()
    // replace the displayed graph with a managed view
    graphComponent.graph = foldingManager.createFoldingView().graph
  }

  /**
   * Initialize network view.
   */
  function initializeNeighborhoodView() {
    neighborhoodView = new NeighborhoodView('neighborhoodGraphComponent')
    neighborhoodView.graphComponent = graphComponent
    neighborhoodView.useSelection = true
    // mirror navigation in the neighborhood view to the graph component
    neighborhoodView.clickCallback = node => {
      graphComponent.currentItem = node
      graphComponent.selection.clear()
      graphComponent.selection.setSelected(node, true)
      const nodes = new yfiles.collections.List(graphComponent.selection.selectedNodes)
      highlightNodes(nodes)
    }
  }

  /**
   * Helper method to highlight a given node.
   * @param {yfiles.collections.IEnumerable.<yfiles.graph.INode>} nodes
   */
  function highlightNodes(nodes) {
    const manager = graphComponent.highlightIndicatorManager
    manager.clearHighlights()
    nodes.forEach(node => {
      manager.addHighlight(node)
    })
  }

  /**
   * Helper method to initialize the highlighting of the graph.
   */
  function initializeHighlighting() {
    // we use the same highlight style as the Neighborhood View default highlight style
    const highlightShape = neighborhoodView.highlightStyle

    const nodeStyleHighlight = new yfiles.view.NodeStyleDecorationInstaller({
      // that should be slightly larger than the real node
      margins: 5,
      // but have a fixed size in the view coordinates
      zoomPolicy: yfiles.view.StyleDecorationZoomPolicy.VIEW_COORDINATES,
      nodeStyle: highlightShape
    })

    // now decorate the nodes with custom highlight styles
    const decorator = graphComponent.graph.decorator
    // register it as the default implementation for all nodes
    decorator.nodeDecorator.highlightDecorator.setImplementation(nodeStyleHighlight)

    // hide default selection implementation
    decorator.nodeDecorator.selectionDecorator.hideImplementation()
  }

  /**
   * Creates the input mode for the <code>GraphComponent</code>.
   * @return {yfiles.input.IInputMode} a new <code>GraphViewerInputMode</code> instance
   */
  function createEditorMode() {
    // create default interaction with snapping and orthogonal edge editing
    const graphViewerInputMode = new yfiles.input.GraphViewerInputMode({
      clickableItems: yfiles.graph.GraphItemTypes.NODE,
      focusableItems: yfiles.graph.GraphItemTypes.NODE,
      selectableItems: yfiles.graph.GraphItemTypes.NODE,
      marqueeSelectableItems: yfiles.graph.GraphItemTypes.NODE
    })

    // We enable folding with collapsing and expanding group nodes.
    graphViewerInputMode.navigationInputMode.allowCollapseGroup = true
    graphViewerInputMode.navigationInputMode.allowExpandGroup = true
    graphViewerInputMode.navigationInputMode.fitContentAfterGroupActions = false
    graphViewerInputMode.navigationInputMode.useCurrentItemForCommands = true

    return graphViewerInputMode
  }

  /**
   * Wire up the UI...
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    // called by the demo framework initially so that the button commands can be bound to actual commands and actions
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindAction("button[data-command='PreviousFile']", () => {
      graphChooserBox.selectedIndex--
      onGraphChooserBoxSelectedIndexChanged()
    })
    app.bindAction("button[data-command='NextFile']", () => {
      graphChooserBox.selectedIndex++
      onGraphChooserBoxSelectedIndexChanged()
    })

    app.bindChangeListener("select[data-command='SelectedFileChanged']", () => {
      onGraphChooserBoxSelectedIndexChanged()
    })

    app.bindChangeListener("select[data-command='NeighborhoodModeChanged']", () => {
      onNeighborhoodModeChanged()
    })
  }

  /**
   * Read a sample graph if the GraphChooser select box changes.
   */
  function onGraphChooserBoxSelectedIndexChanged() {
    readSampleGraph()
  }

  /**
   * Updates the NeighborhoodView's mode when the select box index changes.
   */
  function onNeighborhoodModeChanged() {
    switch (neighborhoodModeChooserBox.selectedIndex) {
      case 0:
        neighborhoodMaxDistanceSlider.disabled = false
        neighborhoodView.neighborhoodMode = NeighborhoodView.MODE_NEIGHBORHOOD
        break
      case 1:
        neighborhoodMaxDistanceSlider.disabled = false
        neighborhoodView.neighborhoodMode = NeighborhoodView.MODE_PREDECESSORS
        break
      case 2:
        neighborhoodMaxDistanceSlider.disabled = false
        neighborhoodView.neighborhoodMode = NeighborhoodView.MODE_SUCCESSORS
        break
      case 3:
        neighborhoodMaxDistanceSlider.disabled = true
        neighborhoodView.neighborhoodMode = NeighborhoodView.MODE_FOLDER_CONTENTS
        break
      default:
        neighborhoodMaxDistanceSlider.disabled = false
        neighborhoodView.neighborhoodMode = NeighborhoodView.MODE_NEIGHBORHOOD
    }
    neighborhoodView.selectedNodes = new yfiles.collections.List(
      graphComponent.selection.selectedNodes
    )
  }

  /**
   * Helper method that reads the currently selected graphml from the combobox.
   */
  function readSampleGraph() {
    // Disable navigation buttons while graph is loaded
    nextButton.disabled = true
    previousButton.disabled = true

    // first derive the file name
    const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
    const fileName = `resources/${selectedItem}.graphml`

    const ioh = new yfiles.graphml.GraphMLIOHandler()
    ioh.addXamlNamespaceMapping(
      'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
      DemoStyles
    )
    app.readGraph(ioh, graphComponent.graph, fileName).then(() => {
      // when done - fit the bounds
      yfiles.input.ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
      // re-enable navigation buttons
      setTimeout(updateButtons, 10)
      // update NeighborhoodView
      graphComponent.currentItem = graphComponent.graph.nodes.firstOrDefault()
      if (yfiles.graph.INode.isInstance(graphComponent.currentItem)) {
        const nodes = new yfiles.collections.List(graphComponent.selection.selectedNodes)
        highlightNodes(nodes)
      }
    })
  }

  /**
   * Updates the previous/next buttons.
   */
  function updateButtons() {
    nextButton.disabled = graphChooserBox.selectedIndex >= graphChooserBox.length - 1
    previousButton.disabled = graphChooserBox.selectedIndex <= 0
  }

  /**
   * Initializes the converters for the org chart styles.
   */
  function initConverters() {
    // add the linebreak converter for the orgchart sample graph
    const store = {}
    yfiles.styles.TemplateNodeStyle.CONVERTERS.orgchartconverters = store
    store.linebreakconverter = (value, firstline) => {
      if (typeof value === 'string') {
        let copy = value
        while (copy.length > 20 && copy.indexOf(' ') > -1) {
          copy = copy.substring(0, copy.lastIndexOf(' '))
        }
        if (firstline === 'true') {
          return copy
        }
        return value.substring(copy.length)
      }
      return ''
    }

    window.relativeTemplatePath = ''
  }

  // run the demo
  run()
})
