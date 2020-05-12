import React from 'react';

const ChildSimulator = props => (
    <div>
        {props.feed.params.tuples.map(
            ({key}) => <p key={key}>{key}</p>
        )}
    </div>
);

export default ChildSimulator;