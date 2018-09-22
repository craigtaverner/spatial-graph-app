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
  'yfiles/view-editor',
  'resources/demo-app',
  'utils/FileSaveSupport',
  'PositionHandler.js',
  'resources/license'
], (
  /** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles,
  app,
  FileSaveSupport,
  PositionHandler
) => {
  /** @type {yfiles.view.GraphComponent} */
  let graphComponent = null

  let inputScale = null

  let inputUseRect = null

  /**
   * region that will be exported
   * @type {yfiles.geometry.MutableRectangle}
   */
  let exportRect = null

  /**
   * detect IE version for x-browser compatibility
   * @type {number}
   */
  let ieVersion = -1

  function run() {
    // initialize the UI's elements
    init()

    initializeInputModes()
    initializeGraph()

    // disable the save button in IE9
    if (ieVersion !== -1 && ieVersion <= 9) {
      const saveButton = document.getElementById('svgSaveButton')
      saveButton.setAttribute('style', 'display: none')
      // add save hint
      const hint = document.createElement('p')
      hint.innerHTML = 'Right-click the image and hit "Save As&hellip;" to save the svg file.'
      const container = document.getElementById('outerExport')
      container.insertBefore(hint, document.getElementById('svgContainer'))
    }

    app.bindAction("button[data-command='Export']", () => {
      if (window.location.protocol === 'file:') {
        alert(
          new Error(
            'This demo features image export with inlined images. ' +
              'Due to the browsers security settings, images can not be inlined if the demo is started from the file system. ' +
              'Please start the demo from a web server.'
          )
        )
        return
      }
      const scale = parseFloat(inputScale.value)
      if (isNaN(scale)) {
        alert('Scale must be a valid number.')
        return
      }
      const rectangle =
        inputUseRect && inputUseRect.checked ? new yfiles.geometry.Rect(exportRect) : null
      exportSvg(scale, rectangle).then(showExportDialog)
    })

    document.getElementById('closeButton').addEventListener('click', hidePopup, false)

    app.show(graphComponent)
  }

  /**
   * Initializes the UI's elements.
   */
  function init() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
    inputScale = document.getElementById('scale')
    inputUseRect = document.getElementById('useRect')

    ieVersion = app.detectInternetExplorerVersion()
  }

  /**
   * Initializes the graph instance and set default styles.
   */
  function initializeGraph() {
    const graph = graphComponent.graph
    const newPolylineEdgeStyle = new yfiles.styles.PolylineEdgeStyle()
    newPolylineEdgeStyle.targetArrow = yfiles.styles.IArrow.DEFAULT
    graph.edgeDefaults.style = newPolylineEdgeStyle

    const switchStyle = new yfiles.styles.ImageNodeStyle('./resources/switch.svg')
    const workstationStyle = new yfiles.styles.ImageNodeStyle('./resources/workstation.svg')

    const labelModel = new yfiles.graph.ExteriorLabelModel()
    const labelModelParameter1 = labelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.SOUTH
    )
    const labelModelParameter2 = labelModel.createParameter(
      yfiles.graph.ExteriorLabelModelPosition.NORTH
    )

    // create sample graph
    const n1 = graph.createNode(new yfiles.geometry.Rect(170, 20, 40, 40), switchStyle)
    const n2 = graph.createNode(new yfiles.geometry.Rect(20, 100, 40, 40), workstationStyle)
    const n3 = graph.createNode(new yfiles.geometry.Rect(120, 100, 40, 40), workstationStyle)
    const n4 = graph.createNode(new yfiles.geometry.Rect(220, 100, 40, 40), workstationStyle)
    const n5 = graph.createNode(new yfiles.geometry.Rect(320, 100, 40, 40), workstationStyle)

    graph.createEdge(n1, n2)
    graph.createEdge(n1, n3)
    graph.createEdge(n1, n4)
    graph.createEdge(n1, n5)

    graph.addLabel(n1, 'Switch', labelModelParameter2)
    graph.addLabel(n2, 'Workstation 1', labelModelParameter1)
    graph.addLabel(n3, 'Workstation 2', labelModelParameter1)
    graph.addLabel(n4, 'Workstation 3', labelModelParameter1)
    graph.addLabel(n5, 'Workstation 4', labelModelParameter1)

    // set the workstation as default node style
    graph.nodeDefaults.style = workstationStyle

    graphComponent.fitGraphBounds()
  }

  function initializeInputModes() {
    // Create a GraphEditorInputMode instance
    const editMode = new yfiles.input.GraphEditorInputMode()

    // and install the edit mode into the canvas.
    graphComponent.inputMode = editMode

    // create the model for the export rectangle
    exportRect = new yfiles.geometry.MutableRectangle(-10, 0, 300, 160)

    // visualize it
    const installer = new yfiles.view.RectangleIndicatorInstaller(exportRect)
    installer.addCanvasObject(
      graphComponent.createRenderContext(),
      graphComponent.backgroundGroup,
      exportRect
    )

    addExportRectInputModes(editMode)
  }

  /**
   * Adds the view modes that handle the resizing and movement of the export rectangle.
   * @param {yfiles.input.MultiplexingInputMode} inputMode
   */
  function addExportRectInputModes(inputMode) {
    // create a mode that deals with the handles
    const exportHandleInputMode = new yfiles.input.HandleInputMode()
    exportHandleInputMode.priority = 1
    // add it to the graph editor mode
    inputMode.add(exportHandleInputMode)

    // now the handles
    const newDefaultCollectionModel = new yfiles.collections.ObservableCollection()
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_EAST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.NORTH_WEST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_EAST, exportRect)
    )
    newDefaultCollectionModel.add(
      new yfiles.input.RectangleHandle(yfiles.input.HandlePositions.SOUTH_WEST, exportRect)
    )
    exportHandleInputMode.handles = newDefaultCollectionModel

    // create a mode that allows for dragging the export rectangle at the sides
    const moveInputMode = new yfiles.input.MoveInputMode()
    moveInputMode.positionHandler = new PositionHandler(exportRect)
    moveInputMode.hitTestable = yfiles.input.IHitTestable.create((context, location) => {
      const path = new yfiles.geometry.GeneralPath(5)
      path.appendRectangle(exportRect, false)
      return path.pathContains(location, context.hitTestRadius + 3 / context.zoom)
    })

    // add it to the edit mode
    moveInputMode.priority = 41
    inputMode.add(moveInputMode)
  }

  /**
   * Exports the graph to an svg element.
   * This function returns a Promise to allow showing the SVG in a popup with a save button, afterwards.
   * @param {number} scale
   * @param {yfiles.geometry.Rect} rectangle
   * @return {Promise}
   */
  function exportSvg(scale, rectangle) {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new yfiles.view.GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graphComponent.graph
    exportComponent.updateContentRect()

    // Determine the bounds of the exported area
    const targetRect = rectangle || exportComponent.contentRect

    exportComponent.zoomTo(targetRect)

    // Create the exporter class
    const exporter = new yfiles.view.SvgExport(targetRect, scale)
    exporter.encodeImagesBase64 = true
    exporter.inlineSvgImages = true

    return exporter.exportSvgAsync(exportComponent)
  }

  /**
   * Shows the export dialog.
   * @param {SVGElement} svgElement
   */
  function showExportDialog(svgElement) {
    svgElement.setAttribute('style', 'width: 100%; height: auto')
    const svgContainerInner = document.getElementById('svgContainerInner')
    svgContainerInner.innerHTML = ''
    svgContainerInner.appendChild(svgElement)

    const svgButton = cloneAndReplace(document.getElementById('svgSaveButton'))
    svgButton.addEventListener(
      'click',
      () => {
        let fileContent = yfiles.view.SvgExport.exportSvgString(svgElement)
        if (ieVersion !== -1) {
          fileContent = yfiles.view.SvgExport.encodeSvgDataUrl(fileContent)
        }
        FileSaveSupport.save(fileContent, 'graph.svg').catch(() => {
          alert(
            'Saving directly to the filesystem is not supported by this browser. Please use the server based export instead.'
          )
        })
      },
      false
    )

    showPopup()
  }

  /**
   * @param {HTMLElement} element
   * @return {HTMLElement}
   */
  function cloneAndReplace(element) {
    const clone = element.cloneNode(true)
    element.parentNode.replaceChild(clone, element)
    return clone
  }

  function hidePopup() {
    app.addClass(document.getElementById('popup'), 'hidden')
  }

  function showPopup() {
    app.removeClass(document.getElementById('popup'), 'hidden')
  }

  run()
})
