import {PartialState} from './interfaces';

const defaultState: PartialState = {
    results: [],
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
    error: null,
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
    maxPacketSize: number;
    minPacketSize: number;
    loadSize: number;
    maxLoadSize: number;
    minLoadSize: number;
    minInRushLoadSize: number;
    maxInRushLoadSize: number;
}

const defaultProps: DefaultProps = {
    packetSize: 30,
    maxPacketSize: 1000,
    minPacketSize: 1,
    loadSize: 120,
    maxLoadSize: 10000,
    minLoadSize: 3,
    minInRushLoadSize: 1,
    maxInRushLoadSize: 5000
}

export {defaultState, directions, defaultProps};