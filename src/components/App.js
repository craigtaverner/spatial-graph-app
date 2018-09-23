import React, {Component} from 'react';
import {connect} from 'react-redux';

import ApiVersion from './common/ApiVersion';
import Settings from './common/Settings';
import Projects from './projects/Projects';
import SearchBar from './SearchBar';
import Visualizer from './Visualizer/index';

import '../index.css'

export class App extends Component {
    state = {
        query: `MATCH (n:Routable)
        WHERE distance(n.location,
        point({latitude:40.75859,longitude:-73.98591})) < 3000
        RETURN n`,
        nodes: null,
        edges: null
    }


    submitQuery = async () => {
        if(this.state.query && window.neo4jDesktopApi) {
                        
            this.setState({nodes: null, edges: null}); // reset state to remove old query results
            const context = await window.neo4jDesktopApi.getContext() // get Neoo4j from desktop app injection
            const project = context.projects.find((p) => p.name === "Project");
            const { graphs } = project;
            const config = graphs[0].connection.configuration.protocols.bolt;

            if(config.enabled) {
                const connection = window.neo4j.v1.driver(
                    "bolt://"+config.host,
                    window.neo4j.v1.auth.basic(config.username, config.password) //  this window.Neo4j is the driver package included in public/index.html
                );

                var session = connection.session();
                const result = await session.run(this.state.query) // run query entered in GUI

                const nodes = result.records.map(record => record.get("n")); // "n" hardcoded from default query `MATCH (n) RETURN n`
                this.setState({nodes})
                const nodeIds = nodes.map(node => node.identity); // get native database ids from each node

                const edgeResults = await session.run(
                    `MATCH (n)-[edge]->(m)
                    WHERE id(n) IN $nodeIds
                    AND id(m) IN $nodeIds
                    RETURN DISTINCT edge 
                    LIMIT 5000`, {nodeIds}) // find all edges between nodes using nodeId look ups, reurnt only unique edges and limiting to 5000

                const edges = edgeResults.records.map(record => record.get("edge")); // hardcoded edge from edgeResults query -[edge]-
                
                this.setState({edges})
            }
        } else {
            // if no query is entered in text field when submitted
            alert("Enter a cypher query in the search box")
        }
    }

    hanldeQueryChange = (event) => {
        console.log('on query change', event, event.target.value);
        this.setState({
            query: event.target.value
        })
    }

    render() {
        console.log('state res', this.state);
        return (
            <div className="pure-g">
                <h1>Spatial Graph App</h1>
                
                <div className="pure-u-1-3">
                    <SearchBar submitQuery={this.submitQuery} onChange={this.hanldeQueryChange} query={this.state.query}/>
                </div>
                <div className="pure-u-2-3">
                    <Visualizer edges={this.state.edges} nodes={this.state.nodes} />
                </div>
            </div>
        )
    }
}

export default connect(
    state => state
)(App);