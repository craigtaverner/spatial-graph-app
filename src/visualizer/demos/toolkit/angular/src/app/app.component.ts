import { AfterViewInit, Component, ViewChild } from '@angular/core'
import { ICommand, IGraph, Size } from 'yfiles/view-component'
import { GraphComponentComponent } from './graph-component/graph-component.component'
import { EDGE_DATA, NODE_DATA } from './data'
import { TreeLayout, TreeReductionStage } from 'yfiles/layout-tree'
import { OrganicEdgeRouter } from 'yfiles/router-other'
import 'yfiles/view-layout-bridge'
import { TemplateNodeStyle } from 'yfiles/styles-template'
import { Person } from './person'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app'

  @ViewChild(GraphComponentComponent) private gcComponent: GraphComponentComponent

  public currentPerson: Person

  ngAfterViewInit() {
    const graphComponent = this.gcComponent.graphComponent
    const graph = graphComponent.graph

    graph.nodeDefaults.size = new Size(250, 100)
    graph.nodeDefaults.style = new TemplateNodeStyle('nodeTemplate')

    graphComponent.addCurrentItemChangedListener(() => {
      this.currentPerson = graphComponent.currentItem.tag
    })

    createSampleGraph(graph)

    runLayout(graph)

    graphComponent.fitGraphBounds()
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  zoomOriginal() {
    ICommand.ZOOM.execute(1, this.gcComponent.graphComponent)
  }
  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.gcComponent.graphComponent)
  }
  fitContent() {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, this.gcComponent.graphComponent)
  }
}

function createSampleGraph(graph: IGraph) {
  const nodeMap = {}

  NODE_DATA.forEach(nodeData => {
    nodeMap[nodeData.name] = graph.createNode({
      tag: new Person(nodeData)
    })
  })

  EDGE_DATA.forEach(({ from, to }) => {
    const fromNode = nodeMap[from]
    const toNode = nodeMap[to]
    if (fromNode && toNode) {
      graph.createEdge(fromNode, toNode)
    }
  })
}

function runLayout(graph: IGraph) {
  const treeLayout = new TreeLayout()
  const treeReductionStage = new TreeReductionStage()
  treeReductionStage.nonTreeEdgeRouter = new OrganicEdgeRouter()
  treeReductionStage.nonTreeEdgeSelectionKey = OrganicEdgeRouter.AFFECTED_EDGES_DP_KEY

  treeLayout.appendStage(treeReductionStage)

  graph.applyLayout(treeLayout)
}
