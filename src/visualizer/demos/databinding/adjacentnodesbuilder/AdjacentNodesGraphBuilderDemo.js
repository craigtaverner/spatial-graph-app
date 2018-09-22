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

/* eslint-disable no-new-func */

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
  'resources/demo-styles',
  './samples.js',
  'yfiles/layout-hierarchic',
  'yfiles/view-layout-bridge',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, Samples) => {
  /**
   * This demo shows building a graph from business data with class
   * {@link yfiles.binding.AdjacentNodesGraphBuilder}.
   * This demo provides text input elements for interactive changes of the
   * sample data that is used to build a graph.
   *
   * In order to visualize the nodes, {@link yfiles.styles.TemplateNodeStyle} is
   * used. The style's node template can also be changed interactively in
   * order to display arbitrary data of the business data associated with the
   * node.
   */
  function run() {
    // initialize GUI elements
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    samplesComboBox = window.document.getElementById('samplesComboBox')

    // configure the defaults for nodes and edges on the graph to be used by the graph builder
    const graph = graphComponent.graph

    // Assign the default demo styles.
    // In this demo, these are used for groups and edges, normal nodes get an individual template style
    DemoStyles.initDemoStyles(graph)

    graph.nodeDefaults.size = new yfiles.geometry.Size(150, 60)
    graph.edgeDefaults.labels.layoutParameter = new yfiles.graph.FreeEdgeLabelModel().createDefaultParameter()

    // configure the input mode
    graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()

    // create the GraphBuilder
    graphBuilder = new yfiles.binding.AdjacentNodesGraphBuilder(graph)
    graphComponent.graph = graphBuilder.graph

    // configure label placement
    const preferredPlacementDescriptor = new yfiles.layout.PreferredPlacementDescriptor({
      sideOfEdge: yfiles.layout.LabelPlacements.RIGHT_OF_EDGE,
      sideReference: yfiles.layout.LabelSideReferences.ABSOLUTE_WITH_RIGHT_IN_NORTH,
      distanceToEdge: 5
    })
    preferredPlacementDescriptor.freeze()
    graph.mapperRegistry.createConstantMapper(
      yfiles.graph.ILabel.$class,
      yfiles.layout.PreferredPlacementDescriptor.$class,
      yfiles.layout.LayoutGraphAdapter.EDGE_LABEL_LAYOUT_PREFERRED_PLACEMENT_DESCRIPTOR_DP_KEY,
      preferredPlacementDescriptor
    )

    // create a layout
    layout = createLayout()

    // load the initial data
    loadSampleData()

    // register toolbar and other GUI element commands
    registerCommands()

    // initialize the demo
    app.show(graphComponent)
  }

  /**
   * The graph builder.
   * @type {yfiles.binding.AdjacentNodesGraphBuilder}
   */
  let graphBuilder = null

  /**
   * A flag to prevent re-entrant layouts.
   * @type {boolean}
   */
  let layouting = false

  /**
   * The hierarchic layout.
   * @type {yfiles.hierarchic.HierarchicLayout}
   */
  let layout = null

  /**
   * A list that collects all existing nodes to consider them in the layout
   * @type {yfiles.collections.List.<yfiles.graph.INode>}
   */
  let existingNodes = null

  /**
   * The graph component.
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * The combo-box to switch through the samples.
   * @type {Object}
   */
  let samplesComboBox = null

  /**
   * Registers the JavaScript commands for the GUI elements, typically the
   * tool bar buttons, during the creation of this application.
   */
  function registerCommands() {
    const iCommand = yfiles.input.ICommand
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)
    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )

    app.bindAction("button[data-command='BuildGraph']", () => {
      buildGraphFromData(false)
    })
    app.bindAction("button[data-command='UpdateGraph']", () => {
      buildGraphFromData(true)
    })
    app.bindChangeListener("select[data-command='SetSampleData']", () => {
      const i = samplesComboBox.selectedIndex
      if (Samples && Samples[i]) {
        updateFormElements(Samples[i])
        buildGraphFromData(false)
      }
    })
  }

  /**
   * Builds the graph from data.
   * @param {Boolean} update <code>true</code> when the following layout should be incremental, <code>false</code>
   *   otherwise
   */
  function buildGraphFromData(update) {
    if (layouting) {
      return
    }
    bindingErrorCaught = false
    updateNodeTemplate(update)
    try {
      const nodesSourceValue = document.getElementById('nodesSourceTextArea').value.trim()
      graphBuilder.nodesSource = nodesSourceValue
        ? new Function(`return ${nodesSourceValue}`)()
        : null
    } catch (e) {
      alert(`Evaluating the nodes source failed: ${e}`)
      return
    }

    // assign the bindings
    graphBuilder.predecessorsBinding = getBindingFromInputElement('predecessorsBindingTextField')
    graphBuilder.successorsBinding = getBindingFromInputElement('successorsBindingTextField')
    graphBuilder.nodeIdBinding = getBindingFromInputElement('nodeIdBindingTextField')
    if (update) {
      // preserve the layout of already existing nodes
      layout.layoutMode = yfiles.hierarchic.LayoutMode.INCREMENTAL
      // remember existing nodes
      existingNodes = graphComponent.graph.nodes.toList()

      // update the graph with the new nodes source data
      try {
        graphBuilder.updateGraph()
      } catch (e) {
        alert(`${e.message}`)
      }
    } else {
      layout.layoutMode = yfiles.hierarchic.LayoutMode.FROM_SCRATCH
      try {
        graphBuilder.buildGraph()
      } catch (e) {
        alert(`${e.message}`)
      }
      graphComponent.fitGraphBounds()
    }

    applyLayout()
  }

  /**
   * Reads the node template XML as specified in the input element
   * and creates a new style instance using this template.
   * The style is set as the default and existing nodes are updated if
   * <code>updateExistingNodes</code> is true.
   * @param {boolean} updateExistingNodes
   */
  function updateNodeTemplate(updateExistingNodes) {
    const nodeTemplateTextArea = window.document.getElementById('nodeTemplateTextArea')
    const templateString = nodeTemplateTextArea.value

    // create a new style instance
    let nodeStyle
    try {
      nodeStyle = new yfiles.styles.StringTemplateNodeStyle(templateString)
    } catch (ignored) {
      alert('Parsing of the node template failed. Is it valid XML?')
      return
    }

    // set the new style as default
    graphComponent.graph.nodeDefaults.style = nodeStyle

    if (updateExistingNodes) {
      // update the existing regular nodes
      const graph = graphComponent.graph
      graph.nodes.forEach(node => {
        if (!graph.isGroupNode(node)) {
          graph.setStyle(node, nodeStyle)
        }
      })
    }
  }

  /**
   * flag to prevent error messages from being repeatedly displayed for each graph item
   * @type {boolean}
   */
  let bindingErrorCaught = false

  /**
   * Returns a binding for the given string.
   * If the parameter is a function definition, a function object is
   * returned. Otherwise, a binding is created using the parameter as the
   * property path.
   * @param {string} bindingString
   * @return {Object} The source or target binding
   */
  function getBinding(bindingString) {
    if (bindingString.indexOf('function(', 0) === 0 || bindingString.indexOf('=>') >= 0) {
      bindingString = `(${bindingString})`
    }
    if (bindingString.indexOf('(function(', 0) === 0 || bindingString.indexOf('=>') >= 0) {
      try {
        // eval the string to get the function object
        const func = new Function(`return ${bindingString}`)()
        // wrap the binding function with a function that catches and reports errors
        // that occur in the binding functions
        return edge => {
          try {
            return func.apply(this, [edge])
          } catch (e) {
            if (!bindingErrorCaught) {
              alert(`Evaluating the binding function ${bindingString} failed: ${e}`)
              bindingErrorCaught = true
            }
            return null
          }
        }
      } catch (exception) {
        return bindingString.length > 0 ? bindingString : null
      }
    }
    return bindingString.length > 0 ? bindingString : null
  }

  /**
   * Returns the binding for the given element.
   * @param {string} elementId
   * @return {Object}
   */
  function getBindingFromInputElement(elementId) {
    return getBinding(document.getElementById(elementId).value)
  }

  /**
   * Applies a layout to the graph considering fixed elements.
   */
  function applyLayout() {
    if (layouting) {
      return
    }

    const hintsFactory = layout.createIncrementalHintsFactory()
    const layoutData = new yfiles.hierarchic.HierarchicLayoutData()
    layoutData.incrementalHints.delegate = item => {
      if (yfiles.graph.INode.isInstance(item) && !existingNodes.includes(item)) {
        return hintsFactory.createLayerIncrementallyHint(item)
      }
      return null
    }

    layouting = true
    graphComponent
      .morphLayout(layout, '1s', layoutData)
      .then(() => {
        layouting = false
        return null
      })
      .catch(error => {
        layouting = false
        if (typeof window.reportError === 'function') {
          window.reportError(error)
        }
      })
  }

  /**
   * Creates and configures a hierarchic layout.
   * @return {yfiles.hierarchic.HierarchicLayout}
   */
  function createLayout() {
    const hierarchicLayout = new yfiles.hierarchic.HierarchicLayout()
    hierarchicLayout.orthogonalRouting = true
    hierarchicLayout.integratedEdgeLabeling = true
    hierarchicLayout.nodePlacer.barycenterMode = true
    hierarchicLayout.fromScratchLayeringStrategy =
      yfiles.hierarchic.LayeringStrategy.HIERARCHICAL_TOPMOST
    return hierarchicLayout
  }

  /**
   * Retrieves the sample data from the window object and initializes the
   * samples combo-box.
   */
  function loadSampleData() {
    for (let i = 0; i < Samples.length; i++) {
      const option = window.document.createElement('option')
      option.textContent = Samples[i].name
      option.value = Samples[i]
      samplesComboBox.appendChild(option)
    }
    updateFormElements(Samples[0])
    buildGraphFromData(false)
  }

  /**
   * Updates the HTML elements of the configuration form with the data of the
   * given sample.
   * @param {Object} sample
   */
  function updateFormElements(sample) {
    window.document.getElementById('nodesSourceTextArea').value = sample.nodesSource
    window.document.getElementById('predecessorsBindingTextField').value =
      sample.predecessorsBinding
    window.document.getElementById('successorsBindingTextField').value = sample.successorsBinding
    window.document.getElementById('nodeIdBindingTextField').value = sample.nodeIdBinding
    window.document.getElementById('nodeTemplateTextArea').value = sample.nodeTemplate
    const updateGraphButton = window.document.getElementById('updateGraphButton')
    if (sample.updateEnabled) {
      updateGraphButton.removeAttribute('disabled')
      updateGraphButton.removeAttribute('class')
    } else {
      updateGraphButton.setAttribute('class', 'demo-disabled')
      updateGraphButton.setAttribute('disabled', 'true')
    }
  }

  // run the demo
  run()
})
