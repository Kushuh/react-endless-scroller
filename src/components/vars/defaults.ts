import {PartialState} from '../typings/components/handler.typings';

const defaultState: PartialState = {
    tuples: [],
    boundaries: {
        start: 0,
        end: 0
    },
    loading: false,
    flags: {
        beginningOfResults: true,
        endOfResults: false
    },
    empty: false,
    launched: false
};

interface Directions {
    forward: string;
    backward: string;
}

const directions: Directions = {
    forward: 'forward',
    backward: 'backward'
};

interface DefaultProps {
    packetSize: number;
    minPacketSize: number;
    loadSize: number;
    minLoadSize: number;
    minInRushLoadSize: number;
}

const defaultProps: DefaultProps = {
    packetSize: 30,
    minPacketSize: 1,
    loadSize: 120,
    minLoadSize: 3,
    minInRushLoadSize: 1
}

export {defaultState, directions, defaultProps};