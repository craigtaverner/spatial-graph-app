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
        query: 'MATCH (n) RETURN n',
        nodes: null,
        edges: null
    }


    submitQuery = async () => {
        console.log('query', this.state.query);
        if(this.state.query && window.neo4jDesktopApi) {
            this.setState({nodes: null, edges: null});
            const context = await window.neo4jDesktopApi.getContext()
            const project = context.projects.find((p) => p.name === "Project");
            const { graphs } = project;
            const config = graphs[0].connection.configuration.protocols.bolt;
            if(config.enabled) {
                const connection = window.neo4j.v1.driver("bolt://"+config.host, window.neo4j.v1.auth.basic(config.username, config.password));
                var session = connection.session();
                const result = await session.run(this.state.query)
                console.log('results', result);
                const nodes = result.records.map(record => record.get("n"));
                this.setState({nodes})
                const nodeIds = nodes.map(node => node.identity);
                const edgeResults = await session.run(
                    `MATCH (n)-[edge]->(m)
                    WHERE id(n) IN $nodeIds
                    AND id(m) IN $nodeIds
                    RETURN DISTINCT edge 
                    LIMIT 200`, {nodeIds})
                const edges = edgeResults.records.map(record => record.get("edge"));
                
                console.log("edges", edges)
                this.setState({edges})

                // conditional if this.state.query contains "nodes"
                    // map to get node ids
                    // 
                // conditional if this.state.query contains "edges"
            }
            // call window.yfiles

        } else {
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
        return <div className="pure-g">
        <h1>Spatial Graph App</h1>
        
            <div className="pure-u-1-3">
                <SearchBar submitQuery={this.submitQuery} onChange={this.hanldeQueryChange} query={this.state.query}/>
                {/* <ApiVersion apiVersion={this.props.apiVersion}/> */}
                {/* <Settings settings={this.props.context.global.settings} /> */}
            </div>
            <div className="pure-u-2-3">

        <Visualizer edges={this.state.edges} nodes={this.state.nodes} />
            </div>
        </div>
    }
}

export default connect(
    state => state
)(App);
// MATCH (m:Movie)-[r]-(p:Person) RETURN p,r,m