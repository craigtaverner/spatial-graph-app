import React from 'react';
const yfiles = window.yfiles;

class Visualizer extends React.Component {

    myRef = React.createRef();
    graphComponent;
    constructor(props) {
        super(props);
        // const nodes = props.nodeResult.records.map(record => record.get("node"));
        this.state = {
            nodes: [],
        }
    }

    componentDidMount() {
        const myRef = this.myRef.current;
        this.graphComponent = new yfiles.view.GraphComponent(myRef);
        this.init();

    }

    init() {
        // Enable workarounds for some browser bugs
        const graphComponent = this.graphComponent;
        // initialize graph component
        graphComponent.inputMode = new yfiles.input.GraphEditorInputMode()

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
            targetArrow: yfiles.styles.IArrow.DEFAULT
        })

        // create small sample graph
        const node1 = graph.createNode(new yfiles.geometry.Rect(50, 50, 30, 30))
        const node2 = graph.createNode(new yfiles.geometry.Rect(0, 150, 30, 30))
        const node3 = graph.createNode(new yfiles.geometry.Rect(100, 150, 30, 30))
        graph.createEdge(node1, node2)
        graph.createEdge(node1, node3)

        // center graph
        graphComponent.fitGraphBounds()
    }
    updateGraph(nodes, edges) {
        const graphBuilder = new yfiles.binding.GraphBuilder(this.graphComponent.graph)

        // we set the default style for the nodes to use
        graphBuilder.graph.nodeDefaults.style = new yfiles.styles.ShapeNodeStyle({
            shape: "ellipse",
            fill: "lightblue"
        })
        // and the default size
        graphBuilder.graph.nodeDefaults.size = new yfiles.geometry.Size(100, 30)
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
        graphBuilder.edgeLabelBinding = edge => edge.type

        // with the following customization we specify a different style for
        // nodes labelled "Movie"
        const movieStyle = new yfiles.styles.ShapeNodeStyle({
            shape: "round-rectangle",
            fill: "yellow"
        })
        // whenever a node is created...
        graphBuilder.addNodeCreatedListener((sender, args) => {
            // ...and it is labelled as Movie
            if (args.sourceObject.labels && args.sourceObject.labels.includes("Movie")) {
                // we set a custom style
                args.graph.setStyle(args.item, movieStyle)
                // and change the size of the node
                args.graph.setNodeLayout(args.item, new yfiles.geometry.Rect(0, 0, 120, 50))
            }
        })

        // similar to the above code, we also change the appearance of the "ACTED_IN" relationship
        // to a customized visualization
        const actedInStyle = new yfiles.styles.PolylineEdgeStyle({
            stroke: "medium blue",
            smoothingLength: 30,
            targetArrow: "blue default"
        })
        // for each added edge...
        graphBuilder.addEdgeCreatedListener((sender, args) => {
            // .. of type "ACTED_IN"
            if (args.sourceObject.type === "ACTED_IN") {
                // set the predefined style
                args.graph.setStyle(args.item, actedInStyle)
            }
        })

        // this triggers the initial construction of the graph
        graphBuilder.buildGraph()

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
            div ref = {
                this.myRef
            }
            style = {
                {
                    height: "600px",
                    width: "600px",
                }
            } >
            Visualizer <
            /div>
        )
    }

    componentDidUpdate() {}

}

export default Visualizer;