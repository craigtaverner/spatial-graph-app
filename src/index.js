import React from 'react';
import ReactDOM from 'react-dom';


import 'purecss/build/pure.css';
import './index.css';
import Visualizer from './components/Visualizer';


ReactDOM.render(
    <div>
        <h1>Spatial Graph App</h1>
        <Visualizer />
    </div>,
    document.getElementById('root')
);

