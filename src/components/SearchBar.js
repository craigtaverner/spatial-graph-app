import React from 'react';

export default (props) => {
  return (
    <div id="search-box">
      <textarea id="search-bar" value={props.query} onChange={props.onChange} />
      <button id="search-button" onClick={props.submitQuery}> Search </button>
    </div>
  )
}