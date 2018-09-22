// import '../../visualizer/lib/es6-modules/yfiles/view-layout-bridge'
// import { TimeSpan } from '../../visualizer/lib/es6-modules/yfiles/core'
import { GraphComponent, ICommand, Rect } from '../../visualizer/lib/es6-modules/yfiles/view-component'
// import { GraphEditorInputMode } from '../../visualizer/lib/es6-modules/yfiles/view-editor'
// import { MinimumNodeSizeStage } from '../../visualizer/lib/es6-modules/yfiles/layout-core'
// import { HierarchicLayout } from '../../visualizer/lib/es6-modules/yfiles/layout-hierarchic'
import React from 'react';

const Visualizer = () => {
    console.loadGraph(GraphComponent);
    return (
        <div>
            Visualizer
        </div>
    )
}

export default Visualizer;
