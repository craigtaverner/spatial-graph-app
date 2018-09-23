import React from 'react';
const yfiles = window.yfiles;

class Visualizer extends React.Component {
    myRef;
    graphComponent;
    constructor(props) {
        super(props);
        // const nodes = props.nodeResult.records.map(record => record.get("node"));
        this.state = {
            nodes: [],
        }
    }

    componentDidMount() {
        const myRef = this.myRef;
        this.graphComponent = new yfiles.view.GraphComponent(myRef);
        this.init();
    }

    init() {
        // Enable workarounds for some browser bugs
        const graphComponent = this.graphComponent;
        // initialize graph component
        graphComponent.inputMode = new yfiles.input.GraphViewerInputMode()

        // initialize graph
        const graph = graphComponent.graph
        graph.undoEngineEnabled = true
        this.createGraph();
        this.updateGraph([], []);
    }

    createGraph() {
        const graphComponent = this.graphComponent;

        const graph = graphComponent.graph

        // initialize default styles
        graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
            fill: 'orange',
            stroke: 'orange',
            shape: 'rectangle'
        })
        graph.edgeDefaults.style = new yfiles.styles.PolylineEdgeStyle({
            targetArrow: yfiles.styles.IArrow.DEFAULT,
            stroke: 'white',
        })

        

        // center graph
        graphComponent.fitGraphBounds()
    }
    
    componentDidUpdate() {
        this.updateGraph(this.props.nodes, this.props.edges);
        console.log('did an update');
    }

    updateGraph(nodes, edges) {
        if (!nodes || !edges) {
            return
        }
        const graphBuilder = new yfiles.binding.GraphBuilder(this.graphComponent.graph)

        // we set the default style for the nodes to use
        graphBuilder.graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
            shape: "ellipse",
            fill: "pink"
        })

        graphBuilder.locationXBinding = node => node.properties.location.x * 100000;
        graphBuilder.locationYBinding = node => node.properties.location.y * -100000;
        // and the default size
        graphBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(3, 3)
        // and also we specify the placements for the labels.
        graphBuilder.graph.edgeDefaults.labels.layoutParameter =
            new yfiles.graph.EdgePathLabelModel({
                distance: 3,
                autoRotation: true,
                sideOfEdge: "ABOVE_EDGE"
            }).
        createDefaultParameter()

        // now we pass it the collection of nodes 
        graphBuilder.nodesSource = nodes
        // and tell it how to identify the nodes
        graphBuilder.nodeIdBinding = node => node.identity.toString()
        // as well as what text to use as the first label for each node
        graphBuilder.nodeLabelBinding = node => node.properties && (node.properties["title"] || node.properties["name"])

        // pass the edges, too
        graphBuilder.edgesSource = edges
        // and tell it how to identify the source nodes - this matches the nodeIdBinding above
        graphBuilder.sourceNodeBinding = edge => edge.start.toString()
        // the same for the target side of the relations
        graphBuilder.targetNodeBinding = edge => edge.end.toString()
        // and we display the label, too, using the type of the relationship
        //graphBuilder.edgeLabelBinding = edge => edge.type

        // with the following customization we specify a different style for
        // nodes labelled "Movie"
        const movieStyle = new yfiles.styles.ShapeNodeStyle({
            shape: "round-rectangle",
            fill: "yellow"
        })
        // this triggers the initial construction of the graph
        graphBuilder.buildGraph()

        this.graphComponent.fitGraphBounds()
    }


    applyLayout() {
        const graphComponent = this.graphComponent
        const layout = new yfiles.layout.MinimumNodeSizeStage(new yfiles.hierarchic.HierarchicLayout())
        graphComponent
            .morphLayout(layout, '1s')
            .then(() => {})
            .catch(error => {
                if (typeof window.reportError === 'function') {
                    window.reportError(error)
                }
            })
    }

    render() {
        console.log("GraphComponent");
        return ( <
            div ref = {node => this.myRef = node}
            style = {
                {
                    height: "100vh",
                    width: "100vw",
                }
            } >
            </div>
        )
    }

}

export default Visualizer;