import React from 'react';

const ChildSimulator = props => (
    <div>
        {props.endlessScroll.params.tuples.map(
            ({key}) => <p key={key}>{key}</p>
        )}
    </div>
);

export default ChildSimulator;