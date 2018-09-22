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

/* eslint-disable global-require */
/* eslint-disable no-console */

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
  'EventLog.js',
  'resources/license'
], (/** @type {yfiles_namespace} */ /** typeof yfiles */ yfiles, app, DemoStyles, EventLog) => {
  /**
   * This demo shows how to register to the various events provided by the {@link yfiles.graph.IGraph graph},
   * the graph component} and the input modes.
   */
  function run() {
    eventLog = new EventLog()

    // load the folding and style modules and initialize the GraphComponent
    require(['yfiles/view-folding'], () => {
      // initialize the GraphComponent
      initializeGraphComponent()

      registerCommands()
      // load the input module after folding and styles are loaded
      require(['yfiles/view-editor'], () => {
        initializeInputModes()
        setupToolTips()
        setupContextMenu()

        registerInputModeEvents()
        registerNavigationInputModeEvents()

        enableFolding()

        initializeGraph()
        initializeDragAndDropPanel()

        createSampleGraph()
        graphComponent.fitGraphBounds()
        enableUndo()
      })
    })

    // initialize collapsible headings
    initOptionHeadings()

    app.show()
  }

  /**
   * @type {EventLog}
   */
  let eventLog = null

  /**
   * @type {yfiles.input.GraphEditorInputMode}
   */
  let editorMode = null

  /**
   * @type {yfiles.input.GraphViewerInputMode}
   */
  let viewerMode = null

  /**
   * @type {yfiles.graph.FoldingManager}
   */
  let manager = null

  /**
   * @type {yfiles.graph.IFoldingView}
   */
  let foldingView = null

  /**
   * Registers some keyboard events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.KeyEventArgs} args An object that contains the event data
   */
  function registerGraphComponentKeyEvents(sender, args) {
    graphComponent.addKeyDownListener(controlOnKeyDown)
    graphComponent.addKeyUpListener(controlOnKeyUp)
    graphComponent.addKeyPressListener(controlOnKeyPressed)
  }

  /**
   * Deregisters some keyboard events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.KeyEventArgs} args An object that contains the event data
   */
  function deregisterGraphComponentKeyEvents(sender, args) {
    graphComponent.removeKeyDownListener(controlOnKeyDown)
    graphComponent.removeKeyUpListener(controlOnKeyUp)
    graphComponent.removeKeyPressListener(controlOnKeyPressed)
  }

  /**
   * Registers the copy clipboard events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs} args An object that contains the event data
   */
  function registerClipboardCopierEvents(sender, args) {
    graphComponent.clipboard.toClipboardCopier.addGraphCopiedListener(
      clipboardOnGraphCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.addNodeCopiedListener(
      clipboardOnNodeCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.addEdgeCopiedListener(
      clipboardOnEdgeCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.addPortCopiedListener(
      clipboardOnPortCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.addLabelCopiedListener(
      clipboardOnLabelCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.addObjectCopiedListener(
      clipboardOnObjectCopiedToClipboard
    )

    graphComponent.clipboard.fromClipboardCopier.addGraphCopiedListener(
      clipboardOnGraphCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.addNodeCopiedListener(
      clipboardOnNodeCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.addEdgeCopiedListener(
      clipboardOnEdgeCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.addPortCopiedListener(
      clipboardOnPortCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.addLabelCopiedListener(
      clipboardOnLabelCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.addObjectCopiedListener(
      clipboardOnObjectCopiedFromClipboard
    )

    graphComponent.clipboard.duplicateCopier.addGraphCopiedListener(clipboardOnGraphDuplicated)
    graphComponent.clipboard.duplicateCopier.addNodeCopiedListener(clipboardOnNodeDuplicated)
    graphComponent.clipboard.duplicateCopier.addEdgeCopiedListener(clipboardOnEdgeDuplicated)
    graphComponent.clipboard.duplicateCopier.addPortCopiedListener(clipboardOnPortDuplicated)
    graphComponent.clipboard.duplicateCopier.addLabelCopiedListener(clipboardOnLabelDuplicated)
    graphComponent.clipboard.duplicateCopier.addObjectCopiedListener(clipboardOnObjectDuplicated)
  }

  /**
   * Deregisters the copy clipboard events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs} args An object that contains the event data
   */
  function deregisterClipboardCopierEvents(sender, args) {
    graphComponent.clipboard.toClipboardCopier.removeGraphCopiedListener(
      clipboardOnGraphCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.removeNodeCopiedListener(
      clipboardOnNodeCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.removeEdgeCopiedListener(
      clipboardOnEdgeCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.removePortCopiedListener(
      clipboardOnPortCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.removeLabelCopiedListener(
      clipboardOnLabelCopiedToClipboard
    )
    graphComponent.clipboard.toClipboardCopier.removeObjectCopiedListener(
      clipboardOnObjectCopiedToClipboard
    )

    graphComponent.clipboard.fromClipboardCopier.removeGraphCopiedListener(
      clipboardOnGraphCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.removeNodeCopiedListener(
      clipboardOnNodeCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.removeEdgeCopiedListener(
      clipboardOnEdgeCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.removePortCopiedListener(
      clipboardOnPortCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.removeLabelCopiedListener(
      clipboardOnLabelCopiedFromClipboard
    )
    graphComponent.clipboard.fromClipboardCopier.removeObjectCopiedListener(
      clipboardOnObjectCopiedFromClipboard
    )

    graphComponent.clipboard.duplicateCopier.removeGraphCopiedListener(clipboardOnGraphDuplicated)
    graphComponent.clipboard.duplicateCopier.removeNodeCopiedListener(clipboardOnNodeDuplicated)
    graphComponent.clipboard.duplicateCopier.removeEdgeCopiedListener(clipboardOnEdgeDuplicated)
    graphComponent.clipboard.duplicateCopier.removePortCopiedListener(clipboardOnPortDuplicated)
    graphComponent.clipboard.duplicateCopier.removeLabelCopiedListener(clipboardOnLabelDuplicated)
    graphComponent.clipboard.duplicateCopier.removeObjectCopiedListener(clipboardOnObjectDuplicated)
  }

  /**
   * Registers the mouse events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function registerGraphComponentMouseEvents(sender, args) {
    graphComponent.addMouseClickListener(controlOnMouseClick)
    graphComponent.addMouseEnterListener(controlOnMouseEnter)
    graphComponent.addMouseLeaveListener(controlOnMouseLeave)
    graphComponent.addMouseLostCaptureListener(controlOnMouseLostCapture)
    graphComponent.addMouseDownListener(controlOnMouseDown)
    graphComponent.addMouseUpListener(controlOnMouseUp)
    graphComponent.addMouseWheelListener(controlOnMouseWheelTurned)
    graphComponent.addMouseDragListener(controlOnMouseDrag)
    graphComponent.addMouseMoveListener(controlOnMouseMove)
  }

  /**
   * Deregisters the mouse events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function deregisterGraphComponentMouseEvents(sender, args) {
    graphComponent.removeMouseClickListener(controlOnMouseClick)
    graphComponent.removeMouseEnterListener(controlOnMouseEnter)
    graphComponent.removeMouseLeaveListener(controlOnMouseLeave)
    graphComponent.removeMouseLostCaptureListener(controlOnMouseLostCapture)
    graphComponent.removeMouseDownListener(controlOnMouseDown)
    graphComponent.removeMouseUpListener(controlOnMouseUp)
    graphComponent.removeMouseWheelListener(controlOnMouseWheelTurned)
    graphComponent.removeMouseDragListener(controlOnMouseDrag)
    graphComponent.removeMouseMoveListener(controlOnMouseMove)
  }

  /**
   * Registers the touch events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function registerGraphComponentTouchEvents(sender, args) {
    graphComponent.addTouchDownListener(controlOnTouchDown)
    graphComponent.addTouchEnterListener(controlOnTouchEnter)
    graphComponent.addTouchLeaveListener(controlOnTouchLeave)
    graphComponent.addTouchLongPressListener(controlOnTouchLongPressed)
    graphComponent.addTouchLostCaptureListener(controlOnTouchLostCapture)
    graphComponent.addTouchClickListener(controlOnTouchClick)
    graphComponent.addTouchUpListener(controlOnTouchUp)
    graphComponent.addTouchMoveListener(controlOnTouchMove)
  }

  /**
   * Deregisters the touch events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function deregisterGraphComponentTouchEvents(sender, args) {
    graphComponent.removeTouchDownListener(controlOnTouchDown)
    graphComponent.removeTouchEnterListener(controlOnTouchEnter)
    graphComponent.removeTouchLeaveListener(controlOnTouchLeave)
    graphComponent.removeTouchLongPressListener(controlOnTouchLongPressed)
    graphComponent.removeTouchLostCaptureListener(controlOnTouchLostCapture)
    graphComponent.removeTouchClickListener(controlOnTouchClick)
    graphComponent.removeTouchUpListener(controlOnTouchUp)
    graphComponent.removeTouchMoveListener(controlOnTouchMove)
  }

  /**
   * Registers the rendering events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function registerGraphComponentRenderEvents(sender, args) {
    graphComponent.addPrepareRenderContextListener(controlOnPrepareRenderContext)
    graphComponent.addUpdatedVisualListener(controlOnUpdatedVisual)
    graphComponent.addUpdatingVisualListener(controlOnUpdatingVisual)
  }

  /**
   * Deregisters the rendering events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function deregisterGraphComponentRenderEvents(sender, args) {
    graphComponent.removePrepareRenderContextListener(controlOnPrepareRenderContext)
    graphComponent.removeUpdatedVisualListener(controlOnUpdatedVisual)
    graphComponent.removeUpdatingVisualListener(controlOnUpdatingVisual)
  }

  /**
   * Registers the viewport events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function registerGraphComponentViewportEvents(sender, args) {
    graphComponent.addViewportChangedListener(controlOnViewportChanged)
    graphComponent.addZoomChangedListener(controlOnZoomChanged)
  }

  /**
   * Deregisters the viewport events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function deregisterGraphComponentViewportEvents(sender, args) {
    graphComponent.removeViewportChangedListener(controlOnViewportChanged)
    graphComponent.removeZoomChangedListener(controlOnZoomChanged)
  }

  /**
   * Registers events regarding node changes to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerNodeEvents(sender, args) {
    graphComponent.graph.addNodeLayoutChangedListener(onNodeLayoutChanged)
    graphComponent.graph.addNodeStyleChangedListener(onNodeStyleChanged)
    graphComponent.graph.addNodeTagChangedListener(onNodeTagChanged)
    graphComponent.graph.addNodeCreatedListener(onNodeCreated)
    graphComponent.graph.addNodeRemovedListener(onNodeRemoved)
  }

  /**
   * Deregisters events regarding node changes from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterNodeEvents(sender, args) {
    graphComponent.graph.removeNodeLayoutChangedListener(onNodeLayoutChanged)
    graphComponent.graph.removeNodeStyleChangedListener(onNodeStyleChanged)
    graphComponent.graph.removeNodeTagChangedListener(onNodeTagChanged)
    graphComponent.graph.removeNodeCreatedListener(onNodeCreated)
    graphComponent.graph.removeNodeRemovedListener(onNodeRemoved)
  }

  /**
   * Registers events regarding edge changes to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerEdgeEvents(sender, args) {
    graphComponent.graph.addEdgePortsChangedListener(onEdgePortsChanged)
    graphComponent.graph.addEdgeStyleChangedListener(onEdgeStyleChanged)
    graphComponent.graph.addEdgeTagChangedListener(onEdgeTagChanged)
    graphComponent.graph.addEdgeCreatedListener(onEdgeCreated)
    graphComponent.graph.addEdgeRemovedListener(onEdgeRemoved)
  }

  /**
   * Deregisters events regarding edge changes from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterEdgeEvents(sender, args) {
    graphComponent.graph.removeEdgePortsChangedListener(onEdgePortsChanged)
    graphComponent.graph.removeEdgeStyleChangedListener(onEdgeStyleChanged)
    graphComponent.graph.removeEdgeTagChangedListener(onEdgeTagChanged)
    graphComponent.graph.removeEdgeCreatedListener(onEdgeCreated)
    graphComponent.graph.removeEdgeRemovedListener(onEdgeRemoved)
  }

  /**
   * Registers events regarding bend changes to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerBendEvents(sender, args) {
    graphComponent.graph.addBendAddedListener(onBendAdded)
    graphComponent.graph.addBendLocationChangedListener(onBendLocationChanged)
    graphComponent.graph.addBendTagChangedListener(onBendTagChanged)
    graphComponent.graph.addBendRemovedListener(onBendRemoved)
  }

  /**
   * Deregisters events regarding bend changes from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterBendEvents(sender, args) {
    graphComponent.graph.removeBendAddedListener(onBendAdded)
    graphComponent.graph.removeBendLocationChangedListener(onBendLocationChanged)
    graphComponent.graph.removeBendTagChangedListener(onBendTagChanged)
    graphComponent.graph.removeBendRemovedListener(onBendRemoved)
  }

  /**
   * Registers events regarding port changes to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerPortEvents(sender, args) {
    graphComponent.graph.addPortAddedListener(onPortAdded)
    graphComponent.graph.addPortLocationParameterChangedListener(onPortLocationParameterChanged)
    graphComponent.graph.addPortStyleChangedListener(onPortStyleChanged)
    graphComponent.graph.addPortTagChangedListener(onPortTagChanged)
    graphComponent.graph.addPortRemovedListener(onPortRemoved)
  }

  /**
   * Deregisters events regarding port changes from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterPortEvents(sender, args) {
    graphComponent.graph.removePortAddedListener(onPortAdded)
    graphComponent.graph.removePortLocationParameterChangedListener(onPortLocationParameterChanged)
    graphComponent.graph.removePortStyleChangedListener(onPortStyleChanged)
    graphComponent.graph.removePortTagChangedListener(onPortTagChanged)
    graphComponent.graph.removePortRemovedListener(onPortRemoved)
  }

  /**
   * Registers events regarding label changes to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerLabelEvents(sender, args) {
    graphComponent.graph.addLabelAddedListener(onLabelAdded)
    graphComponent.graph.addLabelPreferredSizeChangedListener(onLabelPreferredSizeChanged)
    graphComponent.graph.addLabelLayoutParameterChangedListener(onLabelLayoutParameterChanged)
    graphComponent.graph.addLabelStyleChangedListener(onLabelStyleChanged)
    graphComponent.graph.addLabelTagChangedListener(onLabelTagChanged)
    graphComponent.graph.addLabelTextChangedListener(onLabelTextChanged)
    graphComponent.graph.addLabelRemovedListener(onLabelRemoved)
  }

  /**
   * Deregisters events regarding label changes from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterLabelEvents(sender, args) {
    graphComponent.graph.removeLabelAddedListener(onLabelAdded)
    graphComponent.graph.removeLabelPreferredSizeChangedListener(onLabelPreferredSizeChanged)
    graphComponent.graph.removeLabelLayoutParameterChangedListener(onLabelLayoutParameterChanged)
    graphComponent.graph.removeLabelStyleChangedListener(onLabelStyleChanged)
    graphComponent.graph.removeLabelTagChangedListener(onLabelTagChanged)
    graphComponent.graph.removeLabelTextChangedListener(onLabelTextChanged)
    graphComponent.graph.removeLabelRemovedListener(onLabelRemoved)
  }

  /**
   * Registers events regarding hierarchy changes to the graphComponent's graph.
   */
  function registerHierarchyEvents() {
    graphComponent.graph.addParentChangedListener(onParentChanged)
    graphComponent.graph.addIsGroupNodeChangedListener(onIsGroupNodeChanged)
  }

  /**
   * Deregisters events regarding hierarchy changes from the graphComponent's graph.
   */
  function deregisterHierarchyEvents() {
    graphComponent.graph.removeParentChangedListener(onParentChanged)
    graphComponent.graph.removeIsGroupNodeChangedListener(onIsGroupNodeChanged)
  }

  /**
   * Registers events regarding folding changes to the folding view of the graphComponent.
   */
  function registerFoldingEvents() {
    foldingView.addGroupCollapsedListener(onGroupCollapsed)
    foldingView.addGroupExpandedListener(onGroupExpanded)
    foldingView.addPropertyChangedListener(onPropertyChanged)
  }

  /**
   * Deregisters events regarding folding changes from the folding view of the graphComponent.
   */
  function deregisterFoldingEvents() {
    foldingView.removeGroupCollapsedListener(onGroupCollapsed)
    foldingView.removeGroupExpandedListener(onGroupExpanded)
    foldingView.removePropertyChangedListener(onPropertyChanged)
  }

  /**
   * Registers events regarding updating the current display to the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerGraphRenderEvents(sender, args) {
    graphComponent.graph.addDisplaysInvalidatedListener(onDisplaysInvalidated)
  }

  /**
   * Deregisters events regarding updating the current display from the graphComponent's graph.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterGraphRenderEvents(sender, args) {
    graphComponent.graph.removeDisplaysInvalidatedListener(onDisplaysInvalidated)
  }

  /**
   * Registers events to the graphComponent.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function registerGraphComponentEvents(sender, args) {
    graphComponent.addCurrentItemChangedListener(controlOnCurrentItemChanged)
    graphComponent.addGraphChangedListener(controlOnGraphChanged)
    graphComponent.addInputModeChangedListener(controlOnInputModeChanged)
  }

  /**
   * Deregisters events from the graphComponent.
   * @param {object} sender The source of the event
   * @param {function(Object, yfiles.lang.EventArgs)} args An object that contains the event data
   */
  function deregisterGraphComponentEvents(sender, args) {
    graphComponent.removeCurrentItemChangedListener(controlOnCurrentItemChanged)
    graphComponent.removeGraphChangedListener(controlOnGraphChanged)
    graphComponent.removeInputModeChangedListener(controlOnInputModeChanged)
  }

  /**
   * Registers events to the input mode.
   */
  function registerInputModeEvents() {
    editorMode.addCanvasClickedListener(geimOnCanvasClicked)
    editorMode.addDeletedItemListener(geimOnDeletedItem)
    editorMode.addDeletedSelectionListener(geimOnDeletedSelection)
    editorMode.addDeletingSelectionListener(geimOnDeletingSelection)
    editorMode.addItemClickedListener(geimOnItemClicked)
    editorMode.addItemDoubleClickedListener(geimOnItemDoubleClicked)
    editorMode.addItemLeftClickedListener(geimOnItemLeftClicked)
    editorMode.addItemLeftDoubleClickedListener(geimOnItemLeftDoubleClicked)
    editorMode.addItemRightClickedListener(geimOnItemRightClicked)
    editorMode.addItemRightDoubleClickedListener(geimOnItemRightDoubleClicked)
    editorMode.addLabelAddedListener(geimOnLabelAdded)
    editorMode.addLabelTextChangedListener(geimOnLabelTextChanged)
    editorMode.addLabelTextEditingCanceledListener(geimOnLabelTextEditingCanceled)
    editorMode.addLabelTextEditingStartedListener(geimOnLabelTextEditingStarted)
    editorMode.addMultiSelectionFinishedListener(geimOnMultiSelectionFinished)
    editorMode.addMultiSelectionStartedListener(geimOnMultiSelectionStarted)
    editorMode.addNodeCreatedListener(geimOnNodeCreated)
    editorMode.addNodeReparentedListener(geimOnNodeReparented)
    editorMode.addEdgePortsChangedListener(geimOnEdgePortsChanged)
    editorMode.addPopulateItemContextMenuListener(geimOnPopulateItemContextMenu)
    editorMode.addQueryItemToolTipListener(geimOnQueryItemToolTip)
    editorMode.addValidateLabelTextListener(geimOnValidateLabelText)
    viewerMode.addCanvasClickedListener(gvimOnCanvasClicked)
    viewerMode.addItemClickedListener(gvimOnItemClicked)
    viewerMode.addItemDoubleClickedListener(gvimOnItemDoubleClicked)
    viewerMode.addItemLeftClickedListener(gvimOnItemLeftClicked)
    viewerMode.addItemLeftDoubleClickedListener(gvimOnItemLeftDoubleClicked)
    viewerMode.addItemRightClickedListener(gvimOnItemRightClicked)
    viewerMode.addItemRightDoubleClickedListener(gvimOnItemRightDoubleClicked)
    viewerMode.addMultiSelectionFinishedListener(gvimOnMultiSelectionFinished)
    viewerMode.addMultiSelectionStartedListener(gvimOnMultiSelectionStarted)
    viewerMode.addPopulateItemContextMenuListener(gvimOnPopulateItemContextMenu)
    viewerMode.addQueryItemToolTipListener(gvimOnQueryItemToolTip)
  }

  /**
   * Deregisters events from the input mode.
   */
  function deregisterInputModeEvents() {
    editorMode.removeCanvasClickedListener(geimOnCanvasClicked)
    editorMode.removeDeletedItemListener(geimOnDeletedItem)
    editorMode.removeDeletedSelectionListener(geimOnDeletedSelection)
    editorMode.removeDeletingSelectionListener(geimOnDeletingSelection)
    editorMode.removeItemClickedListener(geimOnItemClicked)
    editorMode.removeItemDoubleClickedListener(geimOnItemDoubleClicked)
    editorMode.removeItemLeftClickedListener(geimOnItemLeftClicked)
    editorMode.removeItemLeftDoubleClickedListener(geimOnItemLeftDoubleClicked)
    editorMode.removeItemRightClickedListener(geimOnItemRightClicked)
    editorMode.removeItemRightDoubleClickedListener(geimOnItemRightDoubleClicked)
    editorMode.removeLabelAddedListener(geimOnLabelAdded)
    editorMode.removeLabelTextChangedListener(geimOnLabelTextChanged)
    editorMode.removeLabelTextEditingCanceledListener(geimOnLabelTextEditingCanceled)
    editorMode.removeLabelTextEditingStartedListener(geimOnLabelTextEditingStarted)
    editorMode.removeMultiSelectionFinishedListener(geimOnMultiSelectionFinished)
    editorMode.removeMultiSelectionStartedListener(geimOnMultiSelectionStarted)
    editorMode.removeNodeCreatedListener(geimOnNodeCreated)
    editorMode.removeNodeReparentedListener(geimOnNodeReparented)
    editorMode.removeEdgePortsChangedListener(geimOnEdgePortsChanged)
    editorMode.removePopulateItemContextMenuListener(geimOnPopulateItemContextMenu)
    editorMode.removeQueryItemToolTipListener(geimOnQueryItemToolTip)
    editorMode.removeValidateLabelTextListener(geimOnValidateLabelText)
    viewerMode.removeCanvasClickedListener(gvimOnCanvasClicked)
    viewerMode.removeItemClickedListener(gvimOnItemClicked)
    viewerMode.removeItemDoubleClickedListener(gvimOnItemDoubleClicked)
    viewerMode.removeItemLeftClickedListener(gvimOnItemLeftClicked)
    viewerMode.removeItemLeftDoubleClickedListener(gvimOnItemLeftDoubleClicked)
    viewerMode.removeItemRightClickedListener(gvimOnItemRightClicked)
    viewerMode.removeItemRightDoubleClickedListener(gvimOnItemRightDoubleClicked)
    viewerMode.removeMultiSelectionFinishedListener(gvimOnMultiSelectionFinished)
    viewerMode.removeMultiSelectionStartedListener(gvimOnMultiSelectionStarted)
    viewerMode.removePopulateItemContextMenuListener(gvimOnPopulateItemContextMenu)
    viewerMode.removeQueryItemToolTipListener(gvimOnQueryItemToolTip)
  }

  /**
   * Registers events to the move input mode.
   */
  function registerMoveInputModeEvents() {
    editorMode.moveInputMode.addDragCanceledListener(moveInputModeOnDragCanceled)
    editorMode.moveInputMode.addDragCancelingListener(moveInputModeOnDragCanceling)
    editorMode.moveInputMode.addDragFinishedListener(moveInputModeOnDragFinished)
    editorMode.moveInputMode.addDragFinishingListener(moveInputModeOnDragFinishing)
    editorMode.moveInputMode.addDragStartedListener(moveInputModeOnDragStarted)
    editorMode.moveInputMode.addDragStartingListener(moveInputModeOnDragStarting)
    editorMode.moveInputMode.addDraggedListener(moveInputModeOnDragged)
    editorMode.moveInputMode.addDraggingListener(moveInputModeOnDragging)
    editorMode.moveInputMode.addQueryPositionHandlerListener(moveInputModeOnQueryPositionHandler)
  }

  /**
   * Deregisters events from the move input mode.
   */
  function deregisterMoveInputModeEvents() {
    editorMode.moveInputMode.removeDragCanceledListener(moveInputModeOnDragCanceled)
    editorMode.moveInputMode.removeDragCancelingListener(moveInputModeOnDragCanceling)
    editorMode.moveInputMode.removeDragFinishedListener(moveInputModeOnDragFinished)
    editorMode.moveInputMode.removeDragFinishingListener(moveInputModeOnDragFinishing)
    editorMode.moveInputMode.removeDragStartedListener(moveInputModeOnDragStarted)
    editorMode.moveInputMode.removeDragStartingListener(moveInputModeOnDragStarting)
    editorMode.moveInputMode.removeDraggedListener(moveInputModeOnDragged)
    editorMode.moveInputMode.removeDraggingListener(moveInputModeOnDragging)
    editorMode.moveInputMode.removeQueryPositionHandlerListener(moveInputModeOnQueryPositionHandler)
  }

  /**
   * Registers events to the move input mode regarding labels.
   */
  function registerMoveLabelInputModeEvents() {
    editorMode.moveLabelInputMode.addDragCanceledListener(moveLabelInputModeOnDragCanceled)
    editorMode.moveLabelInputMode.addDragCancelingListener(moveLabelInputModeOnDragCanceling)
    editorMode.moveLabelInputMode.addDragFinishedListener(moveLabelInputModeOnDragFinished)
    editorMode.moveLabelInputMode.addDragFinishingListener(moveLabelInputModeOnDragFinishing)
    editorMode.moveLabelInputMode.addDragStartedListener(moveLabelInputModeOnDragStarted)
    editorMode.moveLabelInputMode.addDragStartingListener(moveLabelInputModeOnDragStarting)
    editorMode.moveLabelInputMode.addDraggedListener(moveLabelInputModeOnDragged)
    editorMode.moveLabelInputMode.addDraggingListener(moveLabelInputModeOnDragging)
  }

  /**
   * Deregisters events from the move input mode regarding labels.
   */
  function deregisterMoveLabelInputModeEvents() {
    editorMode.moveLabelInputMode.removeDragCanceledListener(moveLabelInputModeOnDragCanceled)
    editorMode.moveLabelInputMode.removeDragCancelingListener(moveLabelInputModeOnDragCanceling)
    editorMode.moveLabelInputMode.removeDragFinishedListener(moveLabelInputModeOnDragFinished)
    editorMode.moveLabelInputMode.removeDragFinishingListener(moveLabelInputModeOnDragFinishing)
    editorMode.moveLabelInputMode.removeDragStartedListener(moveLabelInputModeOnDragStarted)
    editorMode.moveLabelInputMode.removeDragStartingListener(moveLabelInputModeOnDragStarting)
    editorMode.moveLabelInputMode.removeDraggedListener(moveLabelInputModeOnDragged)
    editorMode.moveLabelInputMode.removeDraggingListener(moveLabelInputModeOnDragging)
  }

  /**
   * Registers events to the node drop input mode.
   */
  function registerItemDropInputModeEvents() {
    editorMode.nodeDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.nodeDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.nodeDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
    editorMode.nodeDropInputMode.addDragOverListener(itemInputModeOnDragOver)
    editorMode.nodeDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
    editorMode.labelDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.labelDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.labelDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
    editorMode.labelDropInputMode.addDragOverListener(itemInputModeOnDragOver)
    editorMode.labelDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
    editorMode.portDropInputMode.addDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.portDropInputMode.addDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.portDropInputMode.addDragLeftListener(itemInputModeOnDragLeft)
    editorMode.portDropInputMode.addDragOverListener(itemInputModeOnDragOver)
    editorMode.portDropInputMode.addItemCreatedListener(itemInputModeOnItemCreated)
  }

  /**
   * Deregisters events from the node drop input mode.
   */
  function deregisterItemDropInputModeEvents() {
    editorMode.nodeDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.nodeDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.nodeDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
    editorMode.nodeDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
    editorMode.nodeDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
    editorMode.labelDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.labelDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.labelDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
    editorMode.labelDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
    editorMode.labelDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
    editorMode.portDropInputMode.removeDragDroppedListener(itemInputModeOnDragDropped)
    editorMode.portDropInputMode.removeDragEnteredListener(itemInputModeOnDragEntered)
    editorMode.portDropInputMode.removeDragLeftListener(itemInputModeOnDragLeft)
    editorMode.portDropInputMode.removeDragOverListener(itemInputModeOnDragOver)
    editorMode.portDropInputMode.removeItemCreatedListener(itemInputModeOnItemCreated)
  }

  /**
   * Registers hover events to the input mode.
   */
  function registerItemHoverInputModeEvents() {
    editorMode.itemHoverInputMode.addHoveredItemChangedListener(
      itemHoverInputModeOnHoveredItemChanged
    )
    viewerMode.itemHoverInputMode.addHoveredItemChangedListener(
      itemHoverInputModeOnHoveredItemChanged
    )
  }

  /**
   * Deregisters hover events from the input mode.
   */
  function deregisterItemHoverInputModeEvents() {
    editorMode.itemHoverInputMode.removeHoveredItemChangedListener(
      itemHoverInputModeOnHoveredItemChanged
    )
    viewerMode.itemHoverInputMode.removeHoveredItemChangedListener(
      itemHoverInputModeOnHoveredItemChanged
    )
  }

  /**
   * Registers events to the bend input mode.
   */
  function registerCreateBendInputModeEvents() {
    editorMode.createBendInputMode.addBendCreatedListener(createBendInputModeOnBendCreated)
    editorMode.createBendInputMode.addDragCanceledListener(createBendInputModeOnDragCanceled)
    editorMode.createBendInputMode.addDraggedListener(createBendInputModeOnDragged)
    editorMode.createBendInputMode.addDraggingListener(createBendInputModeOnDragging)
  }

  /**
   * Deregisters events from the bend input mode.
   */
  function deregisterCreateBendInputModeEvents() {
    editorMode.createBendInputMode.removeBendCreatedListener(createBendInputModeOnBendCreated)
    editorMode.createBendInputMode.removeDragCanceledListener(createBendInputModeOnDragCanceled)
    editorMode.createBendInputMode.removeDraggedListener(createBendInputModeOnDragged)
    editorMode.createBendInputMode.removeDraggingListener(createBendInputModeOnDragging)
  }

  /**
   * "Simulate" a context menu, so the various context menu events are fired.
   * Please see the ContextMenu demo for details about wiring a context menu implementation
   * to the input modes. See the Dojo and jQuery toolkit demos about using a third-party
   * context menu widget with yFiles.
   */
  function onContextMenu() {
    editorMode.contextMenuInputMode.shouldOpenMenu(yfiles.geometry.Point.ORIGIN)
    viewerMode.contextMenuInputMode.shouldOpenMenu(yfiles.geometry.Point.ORIGIN)
  }

  /**
   * Registers events related to the context menu.
   */
  function registerContextMenuInputModeEvents() {
    editorMode.contextMenuInputMode.addPopulateMenuListener(contextMenuInputModeOnPopulateMenu)
    viewerMode.contextMenuInputMode.addPopulateMenuListener(contextMenuInputModeOnPopulateMenu)
  }

  /**
   * Deregisters events related to the context menu.
   */
  function deregisterContextMenuInputModeEvents() {
    editorMode.contextMenuInputMode.removePopulateMenuListener(contextMenuInputModeOnPopulateMenu)
    viewerMode.contextMenuInputMode.removePopulateMenuListener(contextMenuInputModeOnPopulateMenu)
  }

  /**
   * Registers events related to the tap input mode.
   */
  function registerTapInputModeEvents() {
    editorMode.tapInputMode.addDoubleTappedListener(tapInputModeOnDoubleTapped)
    editorMode.tapInputMode.addTappedListener(tapInputModeOnTapped)
    viewerMode.tapInputMode.addDoubleTappedListener(tapInputModeOnDoubleTapped)
    viewerMode.tapInputMode.addTappedListener(tapInputModeOnTapped)
  }

  /**
   * Deregisters events related from the tap input mode.
   */
  function deregisterTapInputModeEvents() {
    editorMode.tapInputMode.removeDoubleTappedListener(tapInputModeOnDoubleTapped)
    editorMode.tapInputMode.removeTappedListener(tapInputModeOnTapped)
    viewerMode.tapInputMode.removeDoubleTappedListener(tapInputModeOnDoubleTapped)
    viewerMode.tapInputMode.removeTappedListener(tapInputModeOnTapped)
  }

  /**
   * Registers events related to the text editor mode.
   */
  function registerTextEditorInputModeEvents() {
    editorMode.textEditorInputMode.addEditingCanceledListener(textEditorInputModeOnEditingCanceled)
    editorMode.textEditorInputMode.addEditingStartedListener(textEditorInputModeOnEditingStarted)
    editorMode.textEditorInputMode.addTextEditedListener(textEditorInputModeOnTextEdited)
  }

  /**
   * Deregisters events related from the text editor mode.
   */
  function deregisterTextEditorInputModeEvents() {
    editorMode.textEditorInputMode.removeEditingCanceledListener(
      textEditorInputModeOnEditingCanceled
    )
    editorMode.textEditorInputMode.removeEditingStartedListener(textEditorInputModeOnEditingStarted)
    editorMode.textEditorInputMode.removeTextEditedListener(textEditorInputModeOnTextEdited)
  }

  /**
   * Registers events related to mouse hovering to the input mode.
   */
  function registerMouseHoverInputModeEvents() {
    editorMode.mouseHoverInputMode.addQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
    viewerMode.mouseHoverInputMode.addQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
  }

  /**
   * Registers events related to mouse hovering from the input mode.
   */
  function deregisterMouseHoverInputModeEvents() {
    editorMode.mouseHoverInputMode.removeQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
    viewerMode.mouseHoverInputMode.removeQueryToolTipListener(mouseHoverInputModeOnQueryToolTip)
  }

  /**
   * Registers events related to mouse hovering to the navigation input mode.
   */
  function registerNavigationInputModeEvents() {
    editorMode.navigationInputMode.addGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
    editorMode.navigationInputMode.addGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
    editorMode.navigationInputMode.addGroupEnteredListener(navigationInputModeOnGroupEntered)
    editorMode.navigationInputMode.addGroupEnteringListener(navigationInputModeOnGroupEntering)
    editorMode.navigationInputMode.addGroupExitedListener(navigationInputModeOnGroupExited)
    editorMode.navigationInputMode.addGroupExitingListener(navigationInputModeOnGroupExiting)
    editorMode.navigationInputMode.addGroupExpandedListener(navigationInputModeOnGroupExpanded)
    editorMode.navigationInputMode.addGroupExpandingListener(navigationInputModeOnGroupExpanding)

    viewerMode.navigationInputMode.addGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
    viewerMode.navigationInputMode.addGroupCollapsingListener(navigationInputModeOnGroupCollapsing)
    viewerMode.navigationInputMode.addGroupEnteredListener(navigationInputModeOnGroupEntered)
    viewerMode.navigationInputMode.addGroupEnteringListener(navigationInputModeOnGroupEntering)
    viewerMode.navigationInputMode.addGroupExitedListener(navigationInputModeOnGroupExited)
    viewerMode.navigationInputMode.addGroupExitingListener(navigationInputModeOnGroupExiting)
    viewerMode.navigationInputMode.addGroupExpandedListener(navigationInputModeOnGroupExpanded)
    viewerMode.navigationInputMode.addGroupExpandingListener(navigationInputModeOnGroupExpanding)
  }

  /**
   * Deregisters events related to mouse hovering from the navigation input mode.
   */
  function deregisterNavigationInputModeEvents() {
    editorMode.navigationInputMode.removeGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
    editorMode.navigationInputMode.removeGroupCollapsingListener(
      navigationInputModeOnGroupCollapsing
    )
    editorMode.navigationInputMode.removeGroupEnteredListener(navigationInputModeOnGroupEntered)
    editorMode.navigationInputMode.removeGroupEnteringListener(navigationInputModeOnGroupEntering)
    editorMode.navigationInputMode.removeGroupExitedListener(navigationInputModeOnGroupExited)
    editorMode.navigationInputMode.removeGroupExitingListener(navigationInputModeOnGroupExiting)
    editorMode.navigationInputMode.removeGroupExpandedListener(navigationInputModeOnGroupExpanded)
    editorMode.navigationInputMode.removeGroupExpandingListener(navigationInputModeOnGroupExpanding)

    viewerMode.navigationInputMode.removeGroupCollapsedListener(navigationInputModeOnGroupCollapsed)
    viewerMode.navigationInputMode.removeGroupCollapsingListener(
      navigationInputModeOnGroupCollapsing
    )
    viewerMode.navigationInputMode.removeGroupEnteredListener(navigationInputModeOnGroupEntered)
    viewerMode.navigationInputMode.removeGroupEnteringListener(navigationInputModeOnGroupEntering)
    viewerMode.navigationInputMode.removeGroupExitedListener(navigationInputModeOnGroupExited)
    viewerMode.navigationInputMode.removeGroupExitingListener(navigationInputModeOnGroupExiting)
    viewerMode.navigationInputMode.removeGroupExpandedListener(navigationInputModeOnGroupExpanded)
    viewerMode.navigationInputMode.removeGroupExpandingListener(navigationInputModeOnGroupExpanding)
  }

  /**
   * Registers events to the click input mode.
   */
  function registerClickInputModeEvents() {
    editorMode.clickInputMode.addClickedListener(clickInputModeOnClicked)
    editorMode.clickInputMode.addDoubleClickedListener(clickInputModeOnDoubleClicked)
    editorMode.clickInputMode.addLeftClickedListener(clickInputModeOnLeftClicked)
    editorMode.clickInputMode.addLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
    editorMode.clickInputMode.addRightClickedListener(clickInputModeOnRightClicked)
    editorMode.clickInputMode.addRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)

    viewerMode.clickInputMode.addClickedListener(clickInputModeOnClicked)
    viewerMode.clickInputMode.addDoubleClickedListener(clickInputModeOnDoubleClicked)
    viewerMode.clickInputMode.addLeftClickedListener(clickInputModeOnLeftClicked)
    viewerMode.clickInputMode.addLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
    viewerMode.clickInputMode.addRightClickedListener(clickInputModeOnRightClicked)
    viewerMode.clickInputMode.addRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)
  }

  /**
   * Deregisters events from the click input mode.
   */
  function deregisterClickInputModeEvents() {
    editorMode.clickInputMode.removeClickedListener(clickInputModeOnClicked)
    editorMode.clickInputMode.removeDoubleClickedListener(clickInputModeOnDoubleClicked)
    editorMode.clickInputMode.removeLeftClickedListener(clickInputModeOnLeftClicked)
    editorMode.clickInputMode.removeLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
    editorMode.clickInputMode.removeRightClickedListener(clickInputModeOnRightClicked)
    editorMode.clickInputMode.removeRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)

    viewerMode.clickInputMode.removeClickedListener(clickInputModeOnClicked)
    viewerMode.clickInputMode.removeDoubleClickedListener(clickInputModeOnDoubleClicked)
    viewerMode.clickInputMode.removeLeftClickedListener(clickInputModeOnLeftClicked)
    viewerMode.clickInputMode.removeLeftDoubleClickedListener(clickInputModeOnLeftDoubleClicked)
    viewerMode.clickInputMode.removeRightClickedListener(clickInputModeOnRightClicked)
    viewerMode.clickInputMode.removeRightDoubleClickedListener(clickInputModeOnRightDoubleClicked)
  }

  /**
   * Registers events to the click input mode.
   */
  function registerHandleInputModeEvents() {
    editorMode.handleInputMode.addDragCanceledListener(handleInputModeOnDragCanceled)
    editorMode.handleInputMode.addDragCancelingListener(handleInputModeOnDragCanceling)
    editorMode.handleInputMode.addDragFinishedListener(handleInputModeOnDragFinished)
    editorMode.handleInputMode.addDragFinishingListener(handleInputModeOnDragFinishing)
    editorMode.handleInputMode.addDragStartedListener(handleInputModeOnDragStarted)
    editorMode.handleInputMode.addDragStartingListener(handleInputModeOnDragStarting)
    editorMode.handleInputMode.addDraggedListener(handleInputModeOnDragged)
    editorMode.handleInputMode.addDraggingListener(handleInputModeOnDragging)
  }

  /**
   * Deregisters events from the handle input mode.
   */
  function deregisterHandleInputModeEvents() {
    editorMode.handleInputMode.removeDragCanceledListener(handleInputModeOnDragCanceled)
    editorMode.handleInputMode.removeDragCancelingListener(handleInputModeOnDragCanceling)
    editorMode.handleInputMode.removeDragFinishedListener(handleInputModeOnDragFinished)
    editorMode.handleInputMode.removeDragFinishingListener(handleInputModeOnDragFinishing)
    editorMode.handleInputMode.removeDragStartedListener(handleInputModeOnDragStarted)
    editorMode.handleInputMode.removeDragStartingListener(handleInputModeOnDragStarting)
    editorMode.handleInputMode.removeDraggedListener(handleInputModeOnDragged)
    editorMode.handleInputMode.removeDraggingListener(handleInputModeOnDragging)
  }

  /**
   * Registers events to the move viewport input mode.
   */
  function registerMoveViewportInputModeEvents() {
    editorMode.moveViewportInputMode.addDragCanceledListener(moveViewportInputModeOnDragCanceled)
    editorMode.moveViewportInputMode.addDragCancelingListener(moveViewportInputModeOnDragCanceling)
    editorMode.moveViewportInputMode.addDragFinishedListener(moveViewportInputModeOnDragFinished)
    editorMode.moveViewportInputMode.addDragFinishingListener(moveViewportInputModeOnDragFinishing)
    editorMode.moveViewportInputMode.addDragStartedListener(moveViewportInputModeOnDragStarted)
    editorMode.moveViewportInputMode.addDragStartingListener(moveViewportInputModeOnDragStarting)
    editorMode.moveViewportInputMode.addDraggedListener(moveViewportInputModeOnDragged)
    editorMode.moveViewportInputMode.addDraggingListener(moveViewportInputModeOnDragging)

    viewerMode.moveViewportInputMode.addDragCanceledListener(moveViewportInputModeOnDragCanceled)
    viewerMode.moveViewportInputMode.addDragCancelingListener(moveViewportInputModeOnDragCanceling)
    viewerMode.moveViewportInputMode.addDragFinishedListener(moveViewportInputModeOnDragFinished)
    viewerMode.moveViewportInputMode.addDragFinishingListener(moveViewportInputModeOnDragFinishing)
    viewerMode.moveViewportInputMode.addDragStartedListener(moveViewportInputModeOnDragStarted)
    viewerMode.moveViewportInputMode.addDragStartingListener(moveViewportInputModeOnDragStarting)
    viewerMode.moveViewportInputMode.addDraggedListener(moveViewportInputModeOnDragged)
    viewerMode.moveViewportInputMode.addDraggingListener(moveViewportInputModeOnDragging)
  }

  /**
   * Deregisters events from the move viewport input mode.
   */
  function deregisterMoveViewportInputModeEvents() {
    editorMode.moveViewportInputMode.removeDragCanceledListener(moveViewportInputModeOnDragCanceled)
    editorMode.moveViewportInputMode.removeDragCancelingListener(
      moveViewportInputModeOnDragCanceling
    )
    editorMode.moveViewportInputMode.removeDragFinishedListener(moveViewportInputModeOnDragFinished)
    editorMode.moveViewportInputMode.removeDragFinishingListener(
      moveViewportInputModeOnDragFinishing
    )
    editorMode.moveViewportInputMode.removeDragStartedListener(moveViewportInputModeOnDragStarted)
    editorMode.moveViewportInputMode.removeDragStartingListener(moveViewportInputModeOnDragStarting)
    editorMode.moveViewportInputMode.removeDraggedListener(moveViewportInputModeOnDragged)
    editorMode.moveViewportInputMode.removeDraggingListener(moveViewportInputModeOnDragging)

    viewerMode.moveViewportInputMode.removeDragCanceledListener(moveViewportInputModeOnDragCanceled)
    viewerMode.moveViewportInputMode.removeDragCancelingListener(
      moveViewportInputModeOnDragCanceling
    )
    viewerMode.moveViewportInputMode.removeDragFinishedListener(moveViewportInputModeOnDragFinished)
    viewerMode.moveViewportInputMode.removeDragFinishingListener(
      moveViewportInputModeOnDragFinishing
    )
    viewerMode.moveViewportInputMode.removeDragStartedListener(moveViewportInputModeOnDragStarted)
    viewerMode.moveViewportInputMode.removeDragStartingListener(moveViewportInputModeOnDragStarting)
    viewerMode.moveViewportInputMode.removeDraggedListener(moveViewportInputModeOnDragged)
    viewerMode.moveViewportInputMode.removeDraggingListener(moveViewportInputModeOnDragging)
  }

  /**
   * Registers events to the create edge input mode.
   */
  function registerCreateEdgeInputModeEvents() {
    editorMode.createEdgeInputMode.addEdgeCreatedListener(createEdgeInputModeOnEdgeCreated)
    editorMode.createEdgeInputMode.addEdgeCreationStartedListener(
      createEdgeInputModeOnEdgeCreationStarted
    )
    editorMode.createEdgeInputMode.addGestureCanceledListener(createEdgeInputModeOnGestureCanceled)
    editorMode.createEdgeInputMode.addGestureCancelingListener(
      createEdgeInputModeOnGestureCanceling
    )
    editorMode.createEdgeInputMode.addGestureFinishedListener(createEdgeInputModeOnGestureFinished)
    editorMode.createEdgeInputMode.addGestureFinishingListener(
      createEdgeInputModeOnGestureFinishing
    )
    editorMode.createEdgeInputMode.addGestureStartedListener(createEdgeInputModeOnGestureStarted)
    editorMode.createEdgeInputMode.addGestureStartingListener(createEdgeInputModeOnGestureStarting)
    editorMode.createEdgeInputMode.addMovedListener(createEdgeInputModeOnMoved)
    editorMode.createEdgeInputMode.addMovingListener(createEdgeInputModeOnMoving)
    editorMode.createEdgeInputMode.addPortAddedListener(createEdgeInputModeOnPortAdded)
  }

  /**
   * Deregisters events from the create edge input mode.
   */
  function deregisterCreateEdgeInputModeEvents() {
    editorMode.createEdgeInputMode.removeEdgeCreatedListener(createEdgeInputModeOnEdgeCreated)
    editorMode.createEdgeInputMode.removeEdgeCreationStartedListener(
      createEdgeInputModeOnEdgeCreationStarted
    )
    editorMode.createEdgeInputMode.removeGestureCanceledListener(
      createEdgeInputModeOnGestureCanceled
    )
    editorMode.createEdgeInputMode.removeGestureCancelingListener(
      createEdgeInputModeOnGestureCanceling
    )
    editorMode.createEdgeInputMode.removeGestureFinishedListener(
      createEdgeInputModeOnGestureFinished
    )
    editorMode.createEdgeInputMode.removeGestureFinishingListener(
      createEdgeInputModeOnGestureFinishing
    )
    editorMode.createEdgeInputMode.removeGestureStartedListener(createEdgeInputModeOnGestureStarted)
    editorMode.createEdgeInputMode.removeGestureStartingListener(
      createEdgeInputModeOnGestureStarting
    )
    editorMode.createEdgeInputMode.removeMovedListener(createEdgeInputModeOnMoved)
    editorMode.createEdgeInputMode.removeMovingListener(createEdgeInputModeOnMoving)
    editorMode.createEdgeInputMode.removePortAddedListener(createEdgeInputModeOnPortAdded)
  }

  /**
   * Registers selection events to the graphComponent.
   */
  function registerSelectionEvents() {
    graphComponent.selection.addItemSelectionChangedListener(onItemSelectionChanged)
  }

  /**
   * Deregisters selection events from the graphComponent.
   */
  function deregisterSelectionEvents() {
    graphComponent.selection.removeItemSelectionChangedListener(onItemSelectionChanged)
  }

  const eventRegistration = {
    registerGraphComponentKeyEvents,
    deregisterGraphComponentKeyEvents,
    registerClipboardCopierEvents,
    deregisterClipboardCopierEvents,
    registerGraphComponentMouseEvents,
    deregisterGraphComponentMouseEvents,
    registerGraphComponentTouchEvents,
    deregisterGraphComponentTouchEvents,
    registerGraphComponentRenderEvents,
    deregisterGraphComponentRenderEvents,
    registerGraphComponentViewportEvents,
    deregisterGraphComponentViewportEvents,
    registerNodeEvents,
    deregisterNodeEvents,
    registerEdgeEvents,
    deregisterEdgeEvents,
    registerBendEvents,
    deregisterBendEvents,
    registerPortEvents,
    deregisterPortEvents,
    registerLabelEvents,
    deregisterLabelEvents,
    registerHierarchyEvents,
    deregisterHierarchyEvents,
    registerFoldingEvents,
    deregisterFoldingEvents,
    registerGraphRenderEvents,
    deregisterGraphRenderEvents,
    registerGraphComponentEvents,
    deregisterGraphComponentEvents,
    registerInputModeEvents,
    deregisterInputModeEvents,
    registerMoveInputModeEvents,
    deregisterMoveInputModeEvents,
    registerMoveLabelInputModeEvents,
    deregisterMoveLabelInputModeEvents,
    registerItemDropInputModeEvents,
    deregisterItemDropInputModeEvents,
    registerItemHoverInputModeEvents,
    deregisterItemHoverInputModeEvents,
    registerCreateBendInputModeEvents,
    deregisterCreateBendInputModeEvents,
    registerContextMenuInputModeEvents,
    deregisterContextMenuInputModeEvents,
    registerTapInputModeEvents,
    deregisterTapInputModeEvents,
    registerTextEditorInputModeEvents,
    deregisterTextEditorInputModeEvents,
    registerMouseHoverInputModeEvents,
    deregisterMouseHoverInputModeEvents,
    registerNavigationInputModeEvents,
    deregisterNavigationInputModeEvents,
    registerClickInputModeEvents,
    deregisterClickInputModeEvents,
    registerHandleInputModeEvents,
    deregisterHandleInputModeEvents,
    registerMoveViewportInputModeEvents,
    deregisterMoveViewportInputModeEvents,
    registerCreateEdgeInputModeEvents,
    deregisterCreateEdgeInputModeEvents,
    registerSelectionEvents,
    deregisterSelectionEvents
  }

  /**
   * Invoked when the display has to be invalidated.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function onDisplaysInvalidated(sender, args) {
    log(sender, 'Displays Invalidated')
  }

  /**
   * Invoked when the port of an edge changes.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.EdgeEventArgs} args An object that contains the event data
   */
  function onEdgePortsChanged(sender, args) {
    logWithType(sender, `Edge Ports Changed: ${args.item}`, 'EdgePortsChanged')
  }

  /**
   * Invoked when the style of an edge changes.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IEdge,yfiles.styles.IEdgeStyle>} args An object that
   *   contains the event data
   */
  function onEdgeStyleChanged(sender, args) {
    logWithType(sender, `Edge Style Changed: ${args.item}`, 'EdgeStyleChanged')
  }

  /**
   * Invoked when the tag of an edge changes.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IEdge,Object>} args An object that contains the event data
   */
  function onEdgeTagChanged(sender, args) {
    logWithType(sender, `Edge Tag Changed: ${args.item}`, 'EdgeTagChanged')
  }

  /**
   * Invoked when an edge has been created.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IEdge>} args An object that contains the event data
   */
  function onEdgeCreated(sender, args) {
    logWithType(sender, `Edge Created: ${args.item}`, 'EdgeCreated')
  }

  /**
   * Invoked when an edge has been removed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.EdgeEventArgs} args An object that contains the event data
   */
  function onEdgeRemoved(sender, args) {
    logWithType(sender, `Edge Removed: ${args.item}`, 'EdgeRemoved')
  }

  /**
   * Invoked when a label has been added.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function onLabelAdded(sender, args) {
    logWithType(sender, `Label Added: ${args.item}`, 'LabelAdded')
  }

  /**
   * Invoked when a label has been added.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.ILabel,yfiles.geometry.Size>} args An object that contains
   *   the event data
   */
  function onLabelPreferredSizeChanged(sender, args) {
    logWithType(sender, `Label Preferred Size Changed: ${args.item}`, 'LabelPreferredSizeChanged')
  }

  /**
   * Invoked when the parameter of a label has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.ILabel,yfiles.graph.ILabelModelParameter>} args An object
   *   that contains the event data
   */
  function onLabelLayoutParameterChanged(sender, args) {
    logWithType(
      sender,
      `Label Layout Parameter Changed: ${args.item}`,
      'LabelLayoutParameterChanged'
    )
  }

  /**
   * Invoked when the style of a label has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.ILabel,yfiles.styles.ILabelStyle>} args An object that
   *   contains the event data
   */
  function onLabelStyleChanged(sender, args) {
    logWithType(sender, `Label Style Changed: ${args.item}`, 'LabelStyleChanged')
  }

  /**
   * Invoked when the tag of a label has changed.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemChangedEventArgs<yfiles.graph.ILabel,Object>} args An object that contains the event data
   */
  function onLabelTagChanged(sender, args) {
    logWithType(sender, `Label Tag Changed: ${args.item}`, 'LabelTagChanged')
  }

  /**
   * Invoked when the text of a label has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.ILabel,string>} args An object that contains the event data
   */
  function onLabelTextChanged(sender, args) {
    logWithType(sender, `Label Text Changed: ${args.item}`, 'LabelTextChanged')
  }

  /**
   * Invoked when the text of a label has been removed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.LabelEventArgs} args An object that contains the event data
   */
  function onLabelRemoved(sender, args) {
    logWithType(sender, `Label Removed: ${args.item}`, 'LabelRemoved')
  }

  /**
   * Invoked when the layout of a node has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.INode} node The given node
   */
  function onNodeLayoutChanged(sender, node) {
    logWithType(sender, `Node Layout Changed: ${node}`, 'NodeLayoutChanged')
  }

  /**
   * Invoked when the style of a node has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.INode,yfiles.styles.INodeStyle>} args An object that
   *   contains the event data
   */
  function onNodeStyleChanged(sender, args) {
    logWithType(sender, `Node Style Changed: ${args.item}`, 'NodeStyleChanged')
  }

  /**
   * Invoked when the tag of a node has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.INode,Object>} args An object that contains the event data
   */
  function onNodeTagChanged(sender, args) {
    logWithType(sender, `Node Tag Changed: ${args.item}`, 'NodeTagChanged')
  }

  /**
   * Invoked when a node has been created.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function onNodeCreated(sender, args) {
    logWithType(sender, `Node Created: ${args.item}`, 'NodeCreated')
  }

  /**
   * Invoked when a node has been removed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.NodeEventArgs} args An object that contains the event data
   */
  function onNodeRemoved(sender, args) {
    logWithType(sender, `Node Removed: ${args.item}`, 'NodeRemoved')
  }

  /**
   * Invoked when a port has been added.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.IPort>} args An object that contains the event data
   */
  function onPortAdded(sender, args) {
    logWithType(sender, `Port Added: ${args.item}`, 'PortAdded')
  }

  /**
   * Invoked when the location parameter of a port has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IPort,yfiles.graph.IPortLocationModelParameter>} args An
   *   object that contains the event data
   */
  function onPortLocationParameterChanged(sender, args) {
    logWithType(
      sender,
      `Port Location Parameter Changed: ${args.item}`,
      'PortLocationParameterChanged'
    )
  }

  /**
   * Invoked when the style of a port has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IPort,yfiles.styles.IPortStyle>} args An object that
   *   contains the event data
   */
  function onPortStyleChanged(sender, args) {
    logWithType(sender, `Port Style Changed: ${args.item}`, 'PortStyleChanged')
  }

  /**
   * Invoked when the tag of a port has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IPort,Object>} args An object that contains the event data
   */
  function onPortTagChanged(sender, args) {
    logWithType(sender, `Port Tag Changed: ${args.item}`, 'PortTagChanged')
  }

  /**
   * Invoked when a port has been removed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.PortEventArgs} args An object that contains the event data
   */
  function onPortRemoved(sender, args) {
    logWithType(sender, `Port Removed: ${args.item}`, 'PortRemoved')
  }

  /**
   * Invoked when a bend has been added.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.IBend>} args An object that contains the event data
   */
  function onBendAdded(sender, args) {
    logWithType(sender, `Bend Added: ${args.item}`, 'BendAdded')
  }

  /**
   * Invoked when the location of a bend has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.IBend} bend The bend whose location has changed
   */
  function onBendLocationChanged(sender, bend) {
    logWithType(sender, `Bend Location Changed: ${bend}`, 'BendLocationChanged')
  }

  /**
   * Invoked when the tag of a bend has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemChangedEventArgs<yfiles.graph.IBend,Object>} args An object that contains the event data
   */
  function onBendTagChanged(sender, args) {
    logWithType(sender, `Bend Tag Changed: ${args.item}`, 'BendTagChanged')
  }

  /**
   * Invoked when a bend has been removed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.BendEventArgs} args An object that contains the event data
   */
  function onBendRemoved(sender, args) {
    logWithType(sender, `Bend Removed: ${args.item}`, 'BendRemoved')
  }

  /**
   * Invoked when the parent of a node has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.NodeEventArgs} args An object that contains the event data
   */
  function onParentChanged(sender, args) {
    logWithType(
      sender,
      `Parent Changed: ${args.parent} -> ${graphComponent.graph.getParent(args.item)}`,
      'ParentChanged'
    )
  }

  /**
   * Invoked when the group node status of a node has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.NodeEventArgs} args An object that contains the event data
   */
  function onIsGroupNodeChanged(sender, args) {
    logWithType(sender, `Group State Changed: ${args.isGroupNode}`, 'IsGroupNodeChanged')
  }

  /**
   * Invoked when a group has been collapsed.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function onGroupCollapsed(sender, args) {
    logWithType(sender, `Group Collapsed: ${args.item}`, 'GroupCollapsed')
  }

  /**
   * Invoked when a group has been expanded.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function onGroupExpanded(sender, args) {
    logWithType(sender, `Group Expanded: ${args.item}`, 'GroupExpanded')
  }

  /**
   * Invoked when a property has changed.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.PropertyChangedEventArgs} args An object that contains the event data
   */
  function onPropertyChanged(sender, args) {
    logWithType(sender, `Property Changed: ${args.propertyName}`, 'PropertyChanged')
  }

  /**
   * Invoked when the entire graph has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IGraph>} args An object that contains the event data
   */
  function clipboardOnGraphCopiedToClipboard(sender, args) {
    log(sender, 'Graph copied to Clipboard')
  }

  /**
   * Invoked when a node has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function clipboardOnNodeCopiedToClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when an edge has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IEdge>} args An object that contains the event data
   */
  function clipboardOnEdgeCopiedToClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a port has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IPort>} args An object that contains the event data
   */
  function clipboardOnPortCopiedToClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a label has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function clipboardOnLabelCopiedToClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a style has been copied to clipboard.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs<Object>} args An object that contains the event data
   */
  function clipboardOnObjectCopiedToClipboard(sender, args) {
    log(sender, 'Object copied to Clipboard')
  }

  /**
   * Invoked when the entire graph has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IGraph>} args An object that contains the event data
   */
  function clipboardOnGraphCopiedFromClipboard(sender, args) {
    log(sender, 'Graph copied from Clipboard')
  }

  /**
   * Invoked when a node has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function clipboardOnNodeCopiedFromClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when an edge has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IEdge>} args An object that contains the event data
   */
  function clipboardOnEdgeCopiedFromClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a port has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IPort>} args An object that contains the event data
   */
  function clipboardOnPortCopiedFromClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a label has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function clipboardOnLabelCopiedFromClipboard(sender, args) {
    log(sender, 'Graph Item copied to Clipboard')
  }

  /**
   * Invoked when a style has been copied from clipboard.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs<Object>} args An object that contains the event data
   */
  function clipboardOnObjectCopiedFromClipboard(sender, args) {
    log(sender, 'Object copied from Clipboard')
  }

  /**
   * Invoked when the entire graph has been duplicated.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IGraph>} args An object that contains the event data
   */
  function clipboardOnGraphDuplicated(sender, args) {
    log(sender, 'Graph duplicated.')
  }

  /**
   * Invoked when a node has been duplicated.
   * @param {object} sender The source of the event
   * @param { yfiles.graph.ItemCopiedEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function clipboardOnNodeDuplicated(sender, args) {
    log(sender, 'Graph Item duplicated')
  }

  /**
   * Invoked when an edge has been duplicated.
   * @param {object} sender The source of the event
   * @param  {yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IEdge>} args An object that contains the event data
   */
  function clipboardOnEdgeDuplicated(sender, args) {
    log(sender, 'Graph Item duplicated')
  }

  /**
   * Invoked when a port has been duplicated.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs<yfiles.graph.IPort>} args An object that contains the event data
   */
  function clipboardOnPortDuplicated(sender, args) {
    log(sender, 'Graph Item duplicated')
  }

  /**
   * Invoked when a label has been duplicated.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function clipboardOnLabelDuplicated(sender, args) {
    log(sender, 'Graph Item duplicated')
  }

  /**
   * Invoked when a style has been duplicated.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.ItemCopiedEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function clipboardOnObjectDuplicated(sender, args) {
    log(sender, 'Object duplicated')
  }

  /**
   * Invoked when the currentItem property has changed its value
   * @param {object} sender The source of the event
   * @param {yfiles.lang.PropertyChangedEventArgs} args An object that contains the event data
   */
  function controlOnCurrentItemChanged(sender, args) {
    log(sender, 'GraphComponent CurrentItemChanged')
  }

  /**
   * Invoked when the graph property has been changed.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.IGraph>} args An object that contains the event data
   */
  function controlOnGraphChanged(sender, args) {
    log(sender, 'GraphComponent GraphChanged')
  }

  /**
   * Invoked when the inputMode property has been changed.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function controlOnInputModeChanged(sender, args) {
    log(sender, 'GraphComponent InputModeChanged')
  }

  /**
   * Invoked when keys are being pressed, i.e. keydown.
   * @param {object} sender The source of the event
   * @param {yfiles.view.KeyEventArgs} args An object that contains the event data
   */
  function controlOnKeyDown(sender, args) {
    logWithType(sender, `GraphComponent KeyDown: ${args.key}`, 'GraphComponentKeyDown')
  }

  /**
   * Invoked when keys are being released, i.e. keyup.
   * @param {object} sender The source of the event
   * @param {yfiles.view.KeyEventArgs} args An object that contains the event data
   */
  function controlOnKeyUp(sender, args) {
    logWithType(sender, `GraphComponent KeyUp: ${args.key}`, 'GraphComponentKeyUp')
  }

  /**
   * Invoked when keys are being typed, i.e. keypress.
   * @param {object} sender The source of the event
   * @param {yfiles.view.KeyEventArgs} args An object that contains the event data
   */
  function controlOnKeyPressed(sender, args) {
    logWithType(sender, `GraphComponent KeyPress: ${args.key}`, 'GraphComponentKeyPress')
  }

  /**
   * Invoked when the user clicked the mouse.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseClick(sender, args) {
    log(sender, 'GraphComponent MouseClick')
  }

  /**
   * Invoked when the mouse is being moved while at least one of the mouse buttons is pressed.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseDrag(sender, args) {
    log(sender, 'GraphComponent MouseDrag')
  }

  /**
   * Invoked when the mouse has entered the canvas.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseEnter(sender, args) {
    log(sender, 'GraphComponent MouseEnter')
  }

  /**
   * Invoked when the mouse has exited the canvas.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseLeave(sender, args) {
    log(sender, 'GraphComponent MouseLeave')
  }

  /**
   * Invoked when the mouse capture has been lost.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseLostCapture(sender, args) {
    log(sender, 'GraphComponent MouseLostCapture')
  }

  /**
   * Invoked when the mouse has been moved in world coordinates.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseMove(sender, args) {
    log(sender, 'GraphComponent MouseMove')
  }

  /**
   * Invoked when a mouse button has been pressed.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseDown(sender, args) {
    log(sender, 'GraphComponent MouseDown')
  }

  /**
   * Invoked when the mouse button has been released.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseUp(sender, args) {
    log(sender, 'GraphComponent MouseUp')
  }

  /**
   * Invoked when the mouse wheel has turned.
   * @param {object} sender The source of the event
   * @param {yfiles.view.MouseEventArgs} args An object that contains the event data
   */
  function controlOnMouseWheelTurned(sender, args) {
    log(sender, 'GraphComponent MouseWheelTurned')
  }

  /**
   * Invoked when a finger has been put on the touch screen.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchDown(sender, args) {
    log(sender, 'GraphComponent TouchDown')
  }

  /**
   * Invoked when a finger on the touch screen has entered the canvas.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchEnter(sender, args) {
    log(sender, 'GraphComponent TouchEnter')
  }

  /**
   * Invoked when a finger on the touch screen has exited the canvas.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchLeave(sender, args) {
    log(sender, 'GraphComponent TouchLeave')
  }

  /**
   * Invoked when the user performed a long press gesture with a finger on the touch screen.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchLongPressed(sender, args) {
    log(sender, 'GraphComponent TouchLongPressed')
  }

  /**
   * Invoked when the touch capture has been lost
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchLostCapture(sender, args) {
    log(sender, 'GraphComponent TouchLostCapture')
  }

  /**
   * Invoked when a finger has been moved on the touch screen.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchMove(sender, args) {
    log(sender, 'GraphComponent TouchMove')
  }

  /**
   * Invoked when the user performed a tap gesture with a finger on the touch screen.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchClick(sender, args) {
    log(sender, 'GraphComponent TouchClick')
  }

  /**
   * Invoked when a finger has been removed from the touch screen.
   * @param {object} sender The source of the event
   * @param {yfiles.view.TouchEventArgs} args An object that contains the event data
   */
  function controlOnTouchUp(sender, args) {
    log(sender, 'GraphComponent TouchUp')
  }

  /**
   * Invoked before the visual tree is painted.
   * @param {object} sender The source of the event
   * @param {yfiles.view.PrepareRenderContextEventArgs} args An object that contains the event data
   */
  function controlOnPrepareRenderContext(sender, args) {
    log(sender, 'GraphComponent PrepareRenderContext')
  }

  /**
   * Invoked after the visual tree has been updated.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function controlOnUpdatedVisual(sender, args) {
    log(sender, 'GraphComponent UpdatedVisual')
  }

  /**
   * Invoked before the visual tree is updated.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function controlOnUpdatingVisual(sender, args) {
    log(sender, 'GraphComponent UpdatingVisual')
  }

  /**
   * Invoked when the viewport property has been changed.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.PropertyChangedEventArgs} args An object that contains the event data
   */
  function controlOnViewportChanged(sender, args) {
    log(sender, 'GraphComponent ViewportChanged')
  }

  /**
   * Invoked when the value of the zoom property has been changed.
   * @param {object} sender The source of the event
   * @param {yfiles.lang.EventArgs} args An object that contains the event data
   */
  function controlOnZoomChanged(sender, args) {
    log(sender, 'GraphComponent ZoomChanged')
  }

  /**
   * Invoked when the empty canvas area has been clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function geimOnCanvasClicked(sender, args) {
    log(sender, 'GraphEditorInputMode CanvasClicked')
  }

  /**
   * Invoked when an item has been deleted interactively by this mode.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnDeletedItem(sender, args) {
    log(sender, 'GraphEditorInputMode DeletedItem')
  }

  /**
   * Invoked just before the deleteSelection method has deleted the selection after all selected items have been
   * removed.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnDeletedSelection(sender, args) {
    log(sender, 'GraphEditorInputMode DeletedSelection')
  }

  /**
   * Invoked just before the deleteSelection method starts its work and will be followed by any number of DeletedItem
   * events and finalized by a DeletedSelection event.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnDeletingSelection(sender, args) {
    log(sender, 'GraphEditorInputMode DeletingSelection')
  }

  /**
   * Invoked when an item has been clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemClicked(sender, args) {
    log(sender, `GraphEditorInputMode ItemClicked ${args.handled ? '(Handled)' : '(Unhandled)'}`)
  }

  /**
   * Invoked when an item has been double clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemDoubleClicked(sender, args) {
    log(
      sender,
      `GraphEditorInputMode ItemDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when an item has been left-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemLeftClicked(sender, args) {
    log(sender, `GraphEditorInputMode ItemLeftClicked${args.handled ? '(Handled)' : '(Unhandled)'}`)
  }

  /**
   * Invoked when an item has been left double-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemLeftDoubleClicked(sender, args) {
    log(
      sender,
      `GraphEditorInputMode ItemLeftDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when an item has been right clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemRightClicked(sender, args) {
    log(
      sender,
      `GraphEditorInputMode ItemRightClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when an item has been right double-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnItemRightDoubleClicked(sender, args) {
    log(
      sender,
      `GraphEditorInputMode ItemRightDoubleClicked${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when a label has been added.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.ILabel>} args An object that contains the event data
   */
  function geimOnLabelAdded(sender, args) {
    log(sender, 'GraphEditorInputMode LabelAdded')
  }

  /**
   * Invoked when the label text has been changed.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.ILabel, string>} args An object that contains the event data
   */
  function geimOnLabelTextChanged(sender, args) {
    log(sender, 'GraphEditorInputMode LabelTextChanged')
  }

  /**
   * Invoked when the actual label editing process is about to start.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.LabelEventArgs} args An object that contains the event data
   */
  function geimOnLabelTextEditingStarted(sender, args) {
    log(sender, 'GraphEditorInputMode LabelTextEditingStarted')
  }

  /**
   * Invoked when the actual label editing process is canceled
   * @param {object} sender The source of the event
   * @param {yfiles.graph.LabelEventArgs} args An object that contains the event data
   */
  function geimOnLabelTextEditingCanceled(sender, args) {
    log(sender, 'GraphEditorInputMode LabelTextEditingCanceled')
  }

  /**
   * Invoked when a single or multi select operation has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnMultiSelectionFinished(sender, args) {
    log(sender, 'GraphEditorInputMode MultiSelectionFinished')
  }

  /**
   * Invoked when a single or multi select operation has been started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function geimOnMultiSelectionStarted(sender, args) {
    log(sender, 'GraphEditorInputMode MultiSelectionStarted')
  }

  /**
   * Invoked when this mode has created a node in response to user interaction.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function geimOnNodeCreated(sender, args) {
    log(sender, 'GraphEditorInputMode NodeCreated')
  }

  /**
   * Invoked when a node has been reparented interactively.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.NodeEventArgs} args An object that contains the event data
   */
  function geimOnNodeReparented(sender, args) {
    log(sender, 'GraphEditorInputMode NodeReparented')
  }

  /**
   * Invoked after an edge's source and/or target ports have been changed as the result of an input gesture.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.EdgeEventArgs} args An object that contains the event data
   */
  function geimOnEdgePortsChanged(sender, args) {
    log(
      sender,
      `GraphEditorInputMode Edge ${args.item} Ports Changed from ${args.sourcePort}->${
        args.targetPort
      } to ${args.item.sourcePort}->${args.item.targetPort}`
    )
  }

  /**
   * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
   * @param {object} sender The source of the event
   * @param {yfiles.input.PopulateItemContextMenuEventArgs<yfiles.graph.IModelItem>} args An object that contains the
   *   event data
   */
  function geimOnPopulateItemContextMenu(sender, args) {
    log(
      sender,
      `GraphEditorInputMode PopulateItemContextMenu${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when the mouse is hovering over an item to determine the tool tip to display.
   * @param {object} sender The source of the event
   * @param {yfiles.input.QueryItemToolTipEventArgs<yfiles.graph.IModelItem>} args An object that contains the event
   *   data
   */
  function geimOnQueryItemToolTip(sender, args) {
    log(
      sender,
      `GraphEditorInputMode QueryItemToolTip${args.handled ? '(Handled)' : '(Unhandled)'}`
    )
  }

  /**
   * Invoked when a label that is about to be added or edited.
   * @param {object} sender The source of the event
   * @param {yfiles.input.LabelTextValidatingEventArgs} args An object that contains the event data
   */
  function geimOnValidateLabelText(sender, args) {
    log(sender, 'GraphEditorInputMode ValidateLabelText')
  }

  /**
   * Invoked when the empty canvas area has been clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.LabelTextValidatingEventArgs} args An object that contains the event data
   */
  function gvimOnCanvasClicked(sender, args) {
    log(sender, 'GraphViewerInputMode CanvasClicked')
  }

  /**
   * Invoked when an item has been clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemClicked')
  }

  /**
   * Invoked when an item has been double-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemDoubleClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemDoubleClicked')
  }

  /**
   * Invoked when an item has been left-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemLeftClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemLeftClicked')
  }

  /**
   * Invoked when an item has been left double-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemLeftDoubleClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemLeftDoubleClicked')
  }

  /**
   * Invoked when an item has been right-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemRightClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemRightClicked')
  }

  /**
   * Invoked when an item has been right double-clicked.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ItemClickedEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnItemRightDoubleClicked(sender, args) {
    log(sender, 'GraphViewerInputMode ItemRightDoubleClicked')
  }

  /**
   * Invoked when a single or multi select operation has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnMultiSelectionFinished(sender, args) {
    log(sender, 'GraphViewerInputMode MultiSelectionFinished')
  }

  /**
   * Invoked when a single or multi select operation has been started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.SelectionEventArgs<yfiles.graph.IModelItem>} args An object that contains the event data
   */
  function gvimOnMultiSelectionStarted(sender, args) {
    log(sender, 'GraphViewerInputMode MultiSelectionStarted')
  }

  /**
   * Invoked when the context menu over an item is about to be opened to determine the contents of the Menu.
   * @param {object} sender The source of the event
   * @param {yfiles.input.PopulateItemContextMenuEventArgs<yfiles.graph.IModelItem>} args An object that contains the
   *   event data
   */
  function gvimOnPopulateItemContextMenu(sender, args) {
    log(sender, 'GraphViewerInputMode PopulateItemContextMenu')
  }

  /**
   * Invoked when the mouse is hovering over an item to determine the tool tip to display.
   * @param {object} sender The source of the event
   * @param {yfiles.input.QueryItemToolTipEventArgs<yfiles.graph.IModelItem>} args An object that contains the event
   *   data
   */
  function gvimOnQueryItemToolTip(sender, args) {
    log(sender, 'GraphViewerInputMode QueryItemToolTip')
  }

  /**
   * Invoked when the drag has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragCanceled(sender, args) {
    logWithType(sender, 'MoveInputMode DragCanceled', 'DragCanceled')
  }

  /**
   * Invoked before the drag will be canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragCanceling(sender, args) {
    logWithType(sender, 'MoveInputMode DragCanceling', 'DragCanceling')
  }

  /**
   * Invoked once the drag has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragFinished(sender, args) {
    logWithType(sender, 'MoveInputMode DragFinished', 'DragFinished')
  }

  /**
   * Invoked before the drag will be finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragFinishing(sender, args) {
    logWithType(sender, `MoveInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
  }

  /**
   * Invoked at the end of every drag.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragged(sender, args) {
    logWithType(sender, 'MoveInputMode Dragged', 'Dragged')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragging(sender, args) {
    logWithType(sender, 'MoveInputMode Dragging', 'Dragging')
  }

  /**
   * Invoked once the drag is initialized and has started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragStarted(sender, args) {
    logWithType(sender, `MoveInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveInputModeOnDragStarting(sender, args) {
    logWithType(sender, 'MoveInputMode DragStarting', 'DragStarting')
  }

  /**
   * Invoked when a drag is recognized for MoveInputMode.
   * @param {object} sender The source of the event
   * @param {yfiles.input.QueryPositionHandlerEventArgs} args An object that contains the event data
   */
  function moveInputModeOnQueryPositionHandler(sender, args) {
    log(sender, 'MoveInputMode QueryPositionHandler')
  }

  /**
   * Invoked when the drag has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragCanceled(sender, args) {
    logWithType(sender, 'MoveLabelInputMode DragCanceled', 'DragCanceled')
  }

  /**
   * Invoked before the drag will be canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragCanceling(sender, args) {
    logWithType(sender, 'MoveLabelInputMode DragCanceling', 'DragCanceling')
  }

  /**
   * Invoked once the drag has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragFinished(sender, args) {
    logWithType(sender, 'MoveLabelInputMode DragFinished', 'DragFinished')
  }

  /**
   * Invoked before the drag will be finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragFinishing(sender, args) {
    logWithType(
      sender,
      `MoveLabelInputMode DragFinishing${getAffectedItems(sender)}`,
      'DragFinishing'
    )
  }

  /**
   * Invoked at the end of every drag.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragged(sender, args) {
    logWithType(sender, 'MoveLabelInputMode Dragged', 'Dragged')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragging(sender, args) {
    logWithType(sender, 'MoveLabelInputMode Dragging', 'Dragging')
  }

  /**
   * Invoked once the drag is initialized and has started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragStarted(sender, args) {
    logWithType(sender, `MoveLabelInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveLabelInputModeOnDragStarting(sender, args) {
    logWithType(sender, 'MoveLabelInputMode DragStarting', 'DragStarting')
  }

  /**
   * Invoked when the drag operation is dropped.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function itemInputModeOnDragDropped(sender, args) {
    let inputMode = 'NodeDropInputMode'
    if (yfiles.input.LabelDropInputMode.isInstance(sender)) {
      inputMode = 'LabelDropInputMode'
    } else if (yfiles.input.PortDropInputMode.isInstance(sender)) {
      inputMode = 'PortDropInputMode'
    }
    logWithType(sender, `${inputMode} DragDropped`, 'DragDropped')
  }

  /**
   * Invoked when the drag operation enters the CanvasComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function itemInputModeOnDragEntered(sender, args) {
    let inputMode = 'NodeDropInputMode'
    if (yfiles.input.LabelDropInputMode.isInstance(sender)) {
      inputMode = 'LabelDropInputMode'
    } else if (yfiles.input.PortDropInputMode.isInstance(sender)) {
      inputMode = 'PortDropInputMode'
    }
    logWithType(sender, `${inputMode} DragEntered`, 'DragEntered')
  }

  /**
   * Invoked when the drag operation leaves the CanvasComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function itemInputModeOnDragLeft(sender, args) {
    let inputMode = 'NodeDropInputMode'
    if (yfiles.input.LabelDropInputMode.isInstance(sender)) {
      inputMode = 'LabelDropInputMode'
    } else if (yfiles.input.PortDropInputMode.isInstance(sender)) {
      inputMode = 'PortDropInputMode'
    }
    logWithType(sender, `${inputMode} DragLeft`, 'DragLeft')
  }

  /**
   * Invoked when the drag operation drags over the CanvasComponent.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function itemInputModeOnDragOver(sender, args) {
    let inputMode = 'NodeDropInputMode'
    if (yfiles.input.LabelDropInputMode.isInstance(sender)) {
      inputMode = 'LabelDropInputMode'
    } else if (yfiles.input.PortDropInputMode.isInstance(sender)) {
      inputMode = 'PortDropInputMode'
    }
    logWithType(sender, `${inputMode} DragOver`, 'DragOver')
  }

  /**
   * Invoked when a new item gets created by the drag operation.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function itemInputModeOnItemCreated(sender, args) {
    let inputMode = 'NodeDropInputMode'
    if (yfiles.input.LabelDropInputMode.isInstance(sender)) {
      inputMode = 'LabelDropInputMode'
    } else if (yfiles.input.PortDropInputMode.isInstance(sender)) {
      inputMode = 'PortDropInputMode'
    }
    logWithType(sender, `${inputMode} ItemCreated`, 'ItemCreated')
  }

  /**
   * Invoked when the item that is being hovered over with the mouse changes.
   * @param {object} sender The source of the event
   * @param {yfiles.input.HoveredItemChangedEventArgs} args An object that contains the event data
   */
  function itemHoverInputModeOnHoveredItemChanged(sender, args) {
    logWithType(
      sender,
      `HoverInputMode Item changed from ${args.oldItem} to ${
        args.item !== null ? args.item.toString() : 'null'
      }`,
      'HoveredItemChanged'
    )
  }

  /**
   * Invoked once a bend creation gesture has been recognized.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.BendEventArgs} args An object that contains the event data
   */
  function createBendInputModeOnBendCreated(sender, args) {
    log(sender, 'CreateBendInputMode Bend Created')
  }

  /**
   * Invoked when the drag on a bend has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createBendInputModeOnDragCanceled(sender, args) {
    logWithType(sender, 'CreateBendInputMode DragCanceled', 'DragCanceled')
  }

  /**
   * Invoked at the end of every drag on a bend.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createBendInputModeOnDragged(sender, args) {
    logWithType(sender, 'CreateBendInputMode Dragged', 'Dragged')
  }

  /**
   * Invoked once the drag on a bend is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createBendInputModeOnDragging(sender, args) {
    logWithType(sender, 'CreateBendInputMode Dragging', 'Dragging')
  }

  /**
   * Invoked when the context menu is about to be shown.
   * @param {object} sender The source of the event
   * @param {yfiles.input.PopulateMenuEventArgs} args An object that contains the event data
   */
  function contextMenuInputModeOnPopulateMenu(sender, args) {
    log(sender, 'ContextMenuInputMode Populate Context Menu')
  }

  /**
   * Invoked once a double-tap has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.TapEventArgs} args An object that contains the event data
   */
  function tapInputModeOnDoubleTapped(sender, args) {
    log(sender, 'TapInputMode Double Tapped')
  }

  /**
   * Invoked once a tap has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.TapEventArgs} args An object that contains the event data
   */
  function tapInputModeOnTapped(sender, args) {
    log(sender, 'TapInputMode Tapped')
  }

  /**
   * Invoked if the editing has not been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.TextEventArgs} args An object that contains the event data
   */
  function textEditorInputModeOnEditingCanceled(sender, args) {
    log(sender, 'TextEditorInputMode Editing Canceled')
  }

  /**
   * Invoked if the editing when text editing is started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.TextEventArgs} args An object that contains the event data
   */
  function textEditorInputModeOnEditingStarted(sender, args) {
    log(sender, 'TextEditorInputMode Editing Started')
  }

  /**
   * Invoked once the text has been edited.
   * @param {object} sender The source of the event
   * @param {yfiles.input.TextEventArgs} args An object that contains the event data
   */
  function textEditorInputModeOnTextEdited(sender, args) {
    log(sender, 'TextEditorInputMode Text Edited')
  }

  /**
   * Invoked when this mode queries the tool tip for a certain query location.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ToolTipQueryEventArgs} args An object that contains the event data
   */
  function mouseHoverInputModeOnQueryToolTip(sender, args) {
    log(sender, 'MouseHoverInputMode QueryToolTip')
  }

  /**
   * Invoked once a click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnClicked(sender, args) {
    log(sender, 'ClickInputMode Clicked')
  }

  /**
   * Invoked once a double-click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnDoubleClicked(sender, args) {
    log(sender, 'ClickInputMode Double Clicked')
  }

  /**
   * Invoked once a left-click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnLeftClicked(sender, args) {
    log(sender, 'ClickInputMode Left Clicked')
  }

  /**
   * Invoked once a left double-click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnLeftDoubleClicked(sender, args) {
    log(sender, 'ClickInputMode Left Double Clicked')
  }

  /**
   * Invoked once a right-click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnRightClicked(sender, args) {
    log(sender, 'ClickInputMode Right Clicked')
  }

  /**
   * Invoked once a right double-click has been detected.
   * @param {object} sender The source of the event
   * @param {yfiles.input.ClickEventArgs} args An object that contains the event data
   */
  function clickInputModeOnRightDoubleClicked(sender, args) {
    log(sender, 'ClickInputMode Right Double Clicked')
  }

  /**
   * Invoked when the drag has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragCanceled(sender, args) {
    logWithType(sender, 'HandleInputMode DragCanceled', 'DragCanceled')
  }

  /**
   * Invoked before the drag will be canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragCanceling(sender, args) {
    logWithType(sender, 'HandleInputMode DragCanceling', 'DragCanceling')
  }

  /**
   * Invoked once the drag has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragFinished(sender, args) {
    logWithType(sender, 'HandleInputMode DragFinished', 'DragFinished')
  }

  /**
   * Invoked before the drag will be finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragFinishing(sender, args) {
    logWithType(sender, `HandleInputMode DragFinishing${getAffectedItems(sender)}`, 'DragFinishing')
  }

  /**
   * Invoked at the end of every drag.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragged(sender, args) {
    logWithType(sender, 'HandleInputMode Dragged', 'Dragged')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragging(sender, args) {
    logWithType(sender, 'HandleInputMode Dragging', 'Dragging')
  }

  /**
   * Invoked once the drag is initialized and has started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragStarted(sender, args) {
    logWithType(sender, `HandleInputMode DragStarted${getAffectedItems(sender)}`, 'DragStarted')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function handleInputModeOnDragStarting(sender, args) {
    logWithType(sender, 'HandleInputMode DragStarting', 'DragStarting')
  }

  /**
   * Invoked when the drag has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragCanceled(sender, args) {
    logWithType(sender, 'MoveViewportInputMode DragCanceled', 'DragCanceled')
  }

  /**
   * Invoked before the drag will be canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragCanceling(sender, args) {
    logWithType(sender, 'MoveViewportInputMode DragCanceling', 'DragCanceling')
  }

  /**
   * Invoked once the drag has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragFinished(sender, args) {
    logWithType(sender, 'MoveViewportInputMode DragFinished', 'DragFinished')
  }

  /**
   * Invoked before the drag will be finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragFinishing(sender, args) {
    logWithType(
      sender,
      `MoveViewportInputMode DragFinishing${getAffectedItems(sender)}`,
      'DragFinishing'
    )
  }

  /**
   * Invoked at the end of every drag.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragged(sender, args) {
    logWithType(sender, 'MoveViewportInputMode Dragged', 'Dragged')
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragging(sender, args) {
    logWithType(sender, 'MoveViewportInputMode Dragging', 'Dragging')
  }

  /**
   * Invoked once the drag is initialized and has started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragStarted(sender, args) {
    logWithType(
      sender,
      `MoveViewportInputMode DragStarted${getAffectedItems(sender)}`,
      'DragStarted'
    )
  }

  /**
   * Invoked once the drag is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function moveViewportInputModeOnDragStarting(sender, args) {
    logWithType(sender, 'MoveViewportInputMode DragStarting', 'DragStarting')
  }

  /**
   * Invoked whenever a group has been collapsed.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupCollapsed(sender, args) {
    logWithType(sender, `NavigationInputMode Group Collapsed: ${args.item}`, 'GroupCollapsed')
  }

  /**
   * Invoked before a group will be collapsed.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupCollapsing(sender, args) {
    logWithType(sender, `NavigationInputMode Group Collapsing: ${args.item}`, 'Group Collapsing')
  }

  /**
   * Invoked whenever a group has been entered.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupEntered(sender, args) {
    logWithType(sender, `NavigationInputMode Group Entered: ${args.item}`, 'Group Entered')
  }

  /**
   * Invoked before a group will be entered.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupEntering(sender, args) {
    logWithType(sender, `NavigationInputMode Group Entering: ${args.item}`, 'Group Entering')
  }

  /**
   * Invoked whenever a group has been exited.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupExited(sender, args) {
    logWithType(sender, `NavigationInputMode Group Exited: ${args.item}`, 'Group Exited')
  }

  /**
   * Invoked before a group will be exited.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupExiting(sender, args) {
    logWithType(sender, `NavigationInputMode Group Exiting: ${args.item}`, 'Group Exiting')
  }

  /**
   * Invoked when a group has been expanded.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupExpanded(sender, args) {
    logWithType(sender, `NavigationInputMode Group Expanded: ${args.item}`, 'Group Expanded')
  }

  /**
   * Invoked before a group has been expanded.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.INode>} args An object that contains the event data
   */
  function navigationInputModeOnGroupExpanding(sender, args) {
    logWithType(sender, `NavigationInputMode Group Expanding: ${args.item}`, 'Group Expanding')
  }

  /**
   * Invoked after an edge has been created by this mode.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.EdgeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnEdgeCreated(sender, args) {
    log(sender, 'CreateEdgeInputMode Edge Created')
  }

  /**
   * Invoked when the edge creation has started.
   * @param {object} sender The source of the event
   * @param {yfiles.graph.EdgeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnEdgeCreationStarted(sender, args) {
    log(sender, 'CreateEdgeInputMode Edge Creation Started')
  }

  /**
   * Invoked when the edge creation gesture has been canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureCanceled(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Canceled')
  }

  /**
   * Invoked before the gesture will be canceled.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureCanceling(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Canceling')
  }

  /**
   * Invoked once the gesture has been finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureFinished(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Finished')
  }

  /**
   * Invoked before the gesture will be finished.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureFinishing(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Finishing')
  }

  /**
   * Invoked once the gesture is initialized and has started.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureStarted(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Started')
  }

  /**
   * Invoked once the gesture is starting.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnGestureStarting(sender, args) {
    log(sender, 'CreateEdgeInputMode Gesture Starting')
  }

  /**
   * Invoked at the end of every drag or move.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnMoved(sender, args) {
    log(sender, 'CreateEdgeInputMode Moved')
  }

  /**
   * Invoked at the start of every drag or move.
   * @param {object} sender The source of the event
   * @param {yfiles.input.InputModeEventArgs} args An object that contains the event data
   */
  function createEdgeInputModeOnMoving(sender, args) {
    log(sender, 'CreateEdgeInputMode Moving')
  }

  /**
   * Invoked when this instance adds a port to the source or target node during completion of the edge creation gesture.
   * @param {object} sender The source of the event
   * @param {yfiles.collections.ItemEventArgs<yfiles.graph.IPort>} args An object that contains the event data
   */
  function createEdgeInputModeOnPortAdded(sender, args) {
    log(sender, 'CreateEdgeInputMode Port Added')
  }

  /**
   * Invoked when an item changed its selection state from selected to unselected or vice versa.
   * @param {object} sender The source of the event
   * @param {yfiles.view.ItemSelectionChangedEventArgs<T>} args An object that contains the event data
   */
  function onItemSelectionChanged(sender, args) {
    log(sender, 'GraphComponent Item Selection Changed')
  }

  function clearButtonClick() {
    eventLog.clear()
  }

  /**
   * Creates the log message without type.
   * @param {object} sender The source of the event
   * @param {object} message The given message
   */
  function log(sender, message) {
    logWithType(sender, message, null)
  }

  /**
   * Creates the log message with the given type.
   * @param {object} sender The source of the event
   * @param {object} message The given message
   * @param {yfiles.lang.EventArgs} type The type of the event
   */
  function logWithType(sender, message, type) {
    if (!type) {
      type = message
    }

    let category = 'Unknown'
    if (yfiles.input.IInputMode.isInstance(sender)) {
      category = 'InputMode'
    } else if (sender instanceof yfiles.view.CanvasComponent) {
      category = 'GraphComponent'
    } else if (
      yfiles.graph.IModelItem.isInstance(sender) ||
      yfiles.graph.IGraph.isInstance(sender) ||
      yfiles.graph.IFoldingView.isInstance(sender)
    ) {
      category = 'Graph'
    }

    eventLog.addMessage(message, type, category)
  }

  function initializeGraphComponent() {
    graphComponent = new yfiles.view.GraphComponent('graphComponent')
  }

  function initializeInputModes() {
    const orthogonalEdgeEditingContext = new yfiles.input.OrthogonalEdgeEditingContext()
    orthogonalEdgeEditingContext.orthogonalEdgeEditing = false
    orthogonalEdgeEditingContext.movePorts = true
    orthogonalEdgeEditingContext.enabled = false
    editorMode = new yfiles.input.GraphEditorInputMode({
      orthogonalEdgeEditingContext,
      allowGroupingOperations: true
    })
    editorMode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.ALL
    editorMode.nodeDropInputMode.enabled = true
    editorMode.labelDropInputMode.enabled = true
    editorMode.portDropInputMode.enabled = true

    viewerMode = new yfiles.input.GraphViewerInputMode()
    viewerMode.itemHoverInputMode.hoverItems = yfiles.graph.GraphItemTypes.ALL

    // "Simulate" a context menu, so the various context menu events are fired.
    graphComponent.div.addEventListener('contextmenu', onContextMenu, true)

    graphComponent.inputMode = editorMode
  }

  function initializeGraph() {
    const graph = graphComponent.graph
    DemoStyles.initDemoStyles(graph)
    graph.edgeDefaults.labels.style = new yfiles.styles.DefaultLabelStyle({
      backgroundFill: 'white'
    })
  }

  function initializeDragAndDropPanel() {
    const panel = document.getElementById('drag-and-drop-panel')
    panel.appendChild(createDraggableNode())
    panel.appendChild(createDraggableLabel())
    panel.appendChild(createDraggablePort())
  }

  function createDraggableNode() {
    // create the node visual
    const exportComponent = new yfiles.view.GraphComponent()
    exportComponent.graph.createNode(
      new yfiles.geometry.Rect(0, 0, 30, 30),
      graphComponent.graph.nodeDefaults.style
    )
    exportComponent.updateContentRect()
    const svgExport = new yfiles.view.SvgExport(exportComponent.contentRect)
    const dataUrl = yfiles.view.SvgExport.encodeSvgDataUrl(
      yfiles.view.SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
    )
    const div = document.createElement('div')
    div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
    div.setAttribute('title', 'Draggable Node')
    const img = document.createElement('img')
    img.setAttribute('style', 'width: auto; height: auto;')
    img.setAttribute('src', dataUrl)
    div.appendChild(img)
    // register the startDrag listener
    const startDrag = () => {
      const simpleNode = new yfiles.graph.SimpleNode()
      simpleNode.layout = new yfiles.geometry.Rect(0, 0, 30, 30)
      simpleNode.style = graphComponent.graph.nodeDefaults.style.clone()
      const dragPreview = document.createElement('div')
      dragPreview.appendChild(img.cloneNode(true))
      const dragSource = yfiles.input.NodeDropInputMode.startDrag(
        div,
        simpleNode,
        yfiles.view.DragDropEffects.ALL,
        true,
        app.pointerEventsSupported ? dragPreview : null
      )
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }
    img.addEventListener(
      'mousedown',
      event => {
        startDrag()
        event.preventDefault()
      },
      false
    )
    img.addEventListener(
      'touchstart',
      event => {
        startDrag()
        event.preventDefault()
      },
      app.passiveSupported ? { passive: false } : false
    )
    return div
  }

  function createDraggableLabel() {
    // create the label visual
    const defaultLabelParameter = graphComponent.graph.nodeDefaults.labels.layoutParameter
    const defaultLabelStyle = graphComponent.graph.nodeDefaults.labels.style
    const exportComponent = new yfiles.view.GraphComponent()
    const dummyNode = exportComponent.graph.createNode(
      new yfiles.geometry.Rect(0, 0, 30, 30),
      yfiles.styles.VoidNodeStyle.INSTANCE
    )
    exportComponent.graph.addLabel(dummyNode, 'Label', defaultLabelParameter, defaultLabelStyle)
    exportComponent.contentRect = new yfiles.geometry.Rect(0, 0, 30, 30)
    const svgExport = new yfiles.view.SvgExport(exportComponent.contentRect)
    const dataUrl = yfiles.view.SvgExport.encodeSvgDataUrl(
      yfiles.view.SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
    )
    const div = document.createElement('div')
    div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
    div.setAttribute('title', 'Draggable Label')
    const img = document.createElement('img')
    img.setAttribute('style', 'width: auto; height: auto;')
    img.setAttribute('src', dataUrl)
    div.appendChild(img)
    // register the startDrag listener
    const startDrag = () => {
      const simpleNode = new yfiles.graph.SimpleNode()
      simpleNode.layout = new yfiles.geometry.Rect(0, 0, 40, 40)
      const simpleLabel = new yfiles.graph.SimpleLabel(simpleNode, 'Label', defaultLabelParameter)
      simpleLabel.preferredSize = defaultLabelStyle.renderer.getPreferredSize(
        simpleLabel,
        defaultLabelStyle
      )
      simpleLabel.style = defaultLabelStyle
      const dragPreview = document.createElement('div')
      dragPreview.appendChild(img.cloneNode(true))
      const dragSource = yfiles.input.LabelDropInputMode.startDrag(
        div,
        simpleLabel,
        yfiles.view.DragDropEffects.ALL,
        true,
        app.pointerEventsSupported ? dragPreview : null
      )
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }
    img.addEventListener(
      'mousedown',
      event => {
        startDrag()
        event.preventDefault()
      },
      false
    )
    img.addEventListener(
      'touchstart',
      event => {
        startDrag()
        event.preventDefault()
      },
      app.passiveSupported ? { passive: false } : false
    )
    return div
  }

  function createDraggablePort() {
    // create the port visual
    const locationParameter = yfiles.graph.FreeNodePortLocationModel.NODE_CENTER_ANCHORED
    const portStyle = new yfiles.styles.NodeStylePortStyleAdapter({
      nodeStyle: new yfiles.styles.ShapeNodeStyle({
        fill: 'rgb(51, 102, 153)',
        stroke: null,
        shape: 'ellipse'
      })
    })
    const exportComponent = new yfiles.view.GraphComponent()
    const dummyNode = exportComponent.graph.createNode(
      new yfiles.geometry.Rect(0, 0, 30, 30),
      yfiles.styles.VoidNodeStyle.INSTANCE
    )
    exportComponent.graph.addPort(dummyNode, locationParameter, portStyle)
    exportComponent.contentRect = new yfiles.geometry.Rect(0, 0, 30, 30)
    const svgExport = new yfiles.view.SvgExport(exportComponent.contentRect)
    const dataUrl = yfiles.view.SvgExport.encodeSvgDataUrl(
      yfiles.view.SvgExport.exportSvgString(svgExport.exportSvg(exportComponent))
    )
    const div = document.createElement('div')
    div.setAttribute('style', 'width: 30px; height: 30px; margin: 0 10px;')
    div.setAttribute('title', 'Draggable Port')
    const img = document.createElement('img')
    img.setAttribute('style', 'width: auto; height: auto;')
    img.setAttribute('src', dataUrl)
    div.appendChild(img)
    // register the startDrag listener
    const startDrag = () => {
      const simpleNode = new yfiles.graph.SimpleNode()
      simpleNode.layout = new yfiles.geometry.Rect(0, 0, 30, 30)
      const simplePort = new yfiles.graph.SimplePort(simpleNode, locationParameter)
      simplePort.style = portStyle
      const dragPreview = document.createElement('div')
      dragPreview.appendChild(img.cloneNode(true))
      const dragSource = yfiles.input.PortDropInputMode.startDrag(
        div,
        simplePort,
        yfiles.view.DragDropEffects.ALL,
        true,
        app.pointerEventsSupported ? dragPreview : null
      )
      dragSource.addQueryContinueDragListener((src, args) => {
        if (args.dropTarget === null) {
          app.removeClass(dragPreview, 'hidden')
        } else {
          app.addClass(dragPreview, 'hidden')
        }
      })
    }
    img.addEventListener(
      'mousedown',
      event => {
        startDrag()
        event.preventDefault()
      },
      false
    )
    img.addEventListener(
      'touchstart',
      event => {
        startDrag()
        event.preventDefault()
      },
      app.passiveSupported ? { passive: false } : false
    )
    return div
  }

  function setupToolTips() {
    editorMode.toolTipItems = yfiles.graph.GraphItemTypes.NODE
    editorMode.addQueryItemToolTipListener((sender, args) => {
      args.toolTip = `ToolTip for ${args.item}`
      args.handled = true
    })

    viewerMode.toolTipItems = yfiles.graph.GraphItemTypes.NODE
    viewerMode.addQueryItemToolTipListener((sender, args) => {
      args.toolTip = `ToolTip for ${args.item}`
      args.handled = true
    })
  }

  function setupContextMenu() {
    editorMode.contextMenuItems = yfiles.graph.GraphItemTypes.NODE
    editorMode.addPopulateItemContextMenuListener((sender, args) => {
      args.handled = true
    })

    viewerMode.contextMenuItems = yfiles.graph.GraphItemTypes.NODE
    viewerMode.addPopulateItemContextMenuListener((sender, args) => {
      args.handled = true
    })
  }

  function enableFolding() {
    const graph = graphComponent.graph

    // enabled changing ports
    const decorator = graph.decorator.edgeDecorator.portCandidateProviderDecorator
    decorator.setImplementation(
      yfiles.input.IEdgeReconnectionPortCandidateProvider.ALL_NODE_AND_EDGE_CANDIDATES
    )

    manager = new yfiles.graph.FoldingManager(graph)
    foldingView = manager.createFoldingView()
    graphComponent.graph = foldingView.graph
  }

  function enableUndo() {
    const defaultGraph = manager.masterGraph
    if (defaultGraph !== null) {
      defaultGraph.undoEngineEnabled = true
    }
  }

  function createSampleGraph() {
    const graph = graphComponent.graph

    const root = graph.createNodeAt(new yfiles.geometry.Point(0, 0))
    graph.addLabel(root, 'N1')
    const n11 = graph.createNodeAt(new yfiles.geometry.Point(0, 100))
    graph.addLabel(n11, 'N2')
    const n12 = graph.createNodeAt(new yfiles.geometry.Point(100, 100))
    graph.addLabel(n12, 'N3')
    const n21 = graph.createNodeAt(new yfiles.geometry.Point(100, 175))
    graph.addLabel(n21, 'N4')
    const n31 = graph.createNodeAt(new yfiles.geometry.Point(0, 250))
    graph.addLabel(n31, 'N5')

    const eRootN11 = graph.createEdge(root, n11)
    graph.addLabel(eRootN11, 'E1')
    const eRootN12 = graph.createEdge(root, n12)
    graph.addLabel(eRootN12, 'E2')
    const eN11N31 = graph.createEdge(n11, n31)
    graph.addLabel(eN11N31, 'E3')
    const eN12N21 = graph.createEdge(n12, n21)
    graph.addLabel(eN12N21, 'E4')
    const eN21N31 = graph.createEdge(n21, n31)
    graph.addLabel(eN21N31, 'E5')

    graph.addBend(eRootN12, new yfiles.geometry.Point(100, 0), 0)
    graph.addBend(eN21N31, new yfiles.geometry.Point(100, 250), 100)

    const groupNode = graph.createGroupNode()
    graph.addLabel(groupNode, 'GN1')
    graph.setParent(n12, groupNode)
    graph.setParent(n21, groupNode)
    graph.adjustGroupNodeLayout(groupNode)
  }

  function registerCommands() {
    const iCommand = yfiles.input.ICommand

    app.bindCommand(
      "button[data-command='FitContent']",
      iCommand.FIT_GRAPH_BOUNDS,
      graphComponent,
      null
    )
    app.bindCommand("button[data-command='ZoomIn']", iCommand.INCREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOut']", iCommand.DECREASE_ZOOM, graphComponent, null)
    app.bindCommand("button[data-command='ZoomOriginal']", iCommand.ZOOM, graphComponent, 1.0)

    app.bindCommand("button[data-command='Undo']", iCommand.UNDO, graphComponent, null)
    app.bindCommand("button[data-command='Redo']", iCommand.REDO, graphComponent, null)

    app.bindAction("input[data-command='ToggleEditing']", () => {
      if (graphComponent.inputMode === editorMode) {
        graphComponent.inputMode = viewerMode
      } else {
        graphComponent.inputMode = editorMode
      }
    })

    app.bindAction('#demo-orthogonal-editing-button', () => {
      editorMode.orthogonalEdgeEditingContext.enabled = document.querySelector(
        '#demo-orthogonal-editing-button'
      ).checked
    })

    app.bindAction("button[data-command='ClearLog']", () => clearButtonClick())

    app.bindActions("input[data-command='ToggleEvents']", event => {
      const element = event.target
      const eventKind = element.getAttribute('data-event-kind')
      if (eventKind !== null) {
        const enable = element.checked
        const fn = enable
          ? eventRegistration[`register${eventKind}Events`]
          : eventRegistration[`deregister${eventKind}Events`]
        if (typeof fn === 'function') {
          fn.call(this, [])
        } else if (typeof window.console !== 'undefined') {
          console.log(`NOT FOUND: ${eventKind}`)
        }
      }
    })

    app.bindAction("input[data-command='ToggleLogGrouping']", () => {
      eventLog.groupEvents = document.getElementById('toggle-log-grouping').checked
    })
  }

  /**
   * The GraphComponent
   * @type {yfiles.view.GraphComponent}
   */
  let graphComponent = null

  /**
   * Returns the number of affected items as string.
   * @param {object} sender The source of the event
   * @return {string}
   */
  function getAffectedItems(sender) {
    let /** @type {yfiles.collections.IEnumerable.<yfiles.graph.IModelItem>} */ items = null
    const mim = sender instanceof yfiles.input.MoveInputMode ? sender : null
    if (mim !== null) {
      items = mim.affectedItems
    }
    const him = sender instanceof yfiles.input.HandleInputMode ? sender : null
    if (him !== null) {
      items = him.affectedItems
    }
    if (items !== null) {
      const nodeCount = items.ofType(yfiles.graph.INode.$class).size
      const edgeCount = items.ofType(yfiles.graph.IEdge.$class).size
      const bendCount = items.ofType(yfiles.graph.IBend.$class).size
      const labelCount = items.ofType(yfiles.graph.ILabel.$class).size
      const portCount = items.ofType(yfiles.graph.IPort.$class).size
      return `(${
        items.size
      } items: ${nodeCount} nodes, ${bendCount} bends, ${edgeCount} edges, ${labelCount} labels, ${portCount} ports)`
    }
    return ''
  }

  /**
   * Initialize expand-collapse behavior for option headings.
   */
  function initOptionHeadings() {
    const optionsHeadings = document.getElementsByClassName('event-options-heading')
    for (let i = 0; i < optionsHeadings.length; i++) {
      const heading = optionsHeadings[i]
      optionsHeadings[i].addEventListener('click', e => {
        e.preventDefault()
        const optionsElements = heading.parentNode.getElementsByClassName('event-options-content')
        if (optionsElements.length > 0) {
          const style = optionsElements[0].style
          if (style.display !== 'none') {
            style.display = 'none'
            heading.className = heading.className.replace('expanded', 'collapsed')
          } else {
            style.display = 'block'
            heading.className = heading.className.replace('collapsed', 'expanded')
          }
        }
        return false
      })
    }

    const headings = document.getElementsByClassName('event-options-heading')
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i]
      heading.addEventListener('click', evt => {
        evt.target.scrollIntoView()
      })
    }
  }

  // Start the demo
  run()
})
