import {defaultProps} from './defaults';

const errors: Record<string, any> = {
    packetSize: {
        tooSmall: (packetSize: number) => `packetSize parameter is under ${defaultProps.minPacketSize} limit (currently ${packetSize}).`
    },
    loadSize: {
        tooSmall: (loadSize: number) => `loadSize parameter is under ${defaultProps.minLoadSize} limit (currently ${loadSize}).`,
        noLessThanPacketSize: (loadSize: number, packetSize: number) => `loadSize (${loadSize}) cannot be less than 150% of packetSize (${packetSize}). Please set it at least to ${Math.ceil(1.5 * packetSize)}.`
    },
    inRushLoadSize: {
        tooSmall: (inRushLoadSize: number) => `inRushLoadSize parameter is under ${defaultProps.minInRushLoadSize} limit (currently ${inRushLoadSize}).`
    },
    apiResults: {
        noResults: 'api didn\'t returned any result. To indicate empty dataset, please return an object with boundaries both set to 0, and flags both set to true.',
        noFlags: 'Missing flags attribute from api: it should contain an Object with a endOfResults boolean parameter.',
        noEndOfResultsFlag: 'Missing endOfResults in flags: this flag is required and should be a boolean.',
        noBoundaries: 'Missing boundaries attribute from api: it should contain two integers for both start and end limits.',
        noStartBoundary: 'Missing start boundary in boundaries: this parameter is required and should be an integer.',
        noEndBoundary: 'Missing end boundary in boundaries: this parameter is required and should be an integer.',

        notValidResult: (result: any) => `api returned non valid result: expected an Object, got ${result.constructor.name}.`,
        notValidQueryResults: (queryResults: any) => `Invalid queryResult attribute from api: should return an Array, got ${queryResults.constructor.name}.`,
        notValidFlags: (flags: any) => `Invalid flags attribute from api: should return an Object, got ${flags.constructor.name}.`,
        notValidEndOfResultsFlag: (endOfResults: any) => `Invalid flag endOfResults from api: should return a Boolean, got ${endOfResults.constructor.name}.`,
        notValidBoundaries: (boundaries: any) => `Invalid boundaries attribute from api: should return an Object, got ${boundaries.constructor.name}.`,
        notValidStartBoundary: (start: any) => `Invalid start boundary from api: should return a Number, got ${start.constructor.name}.`,
        notValidEndBoundary: (end: any) => `Invalid end boundary from api: should return a Number, got ${end.constructor.name}.`,

        notValidTuple: (tuple: any) => `Invalid tuple returned from api in queryResults: expect only Objects or null, got ${tuple.constructor.name}.`,
        noTupleKey: 'Missing tuple key: each tuple returned from api should contain an unique key attribute.'
    }
};

export default errors;