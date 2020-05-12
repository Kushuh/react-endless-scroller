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
        notValidQueryResults: (queryResults: any) => `Invalid queryResult attribute from api: expected an Array, got ${queryResults.constructor.name}.`,
        notValidFlags: (flags: any) => `Invalid flags attribute from api: expected an Object, got ${flags.constructor.name}.`,
        notValidEndOfResultsFlag: (endOfResults: any) => `Invalid flag endOfResults from api: expected a Boolean, got ${endOfResults.constructor.name}.`,
        notValidBoundaries: (boundaries: any) => `Invalid boundaries attribute from api: expected an Object, got ${boundaries.constructor.name}.`,
        notValidStartBoundary: (start: any) => `Invalid start boundary from api: expected a Number, got ${start.constructor.name}.`,
        notValidEndBoundary: (end: any) => `Invalid end boundary from api: expected a Number, got ${end.constructor.name}.`,

        startGreaterThanEndBoundary: (start: Number, end: Number) => `Api returned a start boundary at ${start}, which is greater than the end boundary ${end}.`,

        notValidTuple: (tuple: any, origin: string) => `Invalid tuple returned from ${origin}: expect only Objects, got ${tuple == null ? 'null' : tuple.constructor.name}.`,
        noTupleKey: 'Missing tuple key: each tuple returned from api should contain an unique key attribute.'
    },
    props: {
        missingApi: 'No api props specified. Please pass a valid Promise (or function that returns a Promise).',

        notValidApi: api => `Invalid api prop: expected a Function, got ${api.constructor.name}.`,
        notValidInitialProps: init => `Invalid initialProps prop: expected an Object, got ${init.constructor.name}.`,
        notValidTuples: tuples => `Invalid tuples attribute from initialProps: expected an Array or null, got ${tuples.constructor.name}.`,
        notValidBoundaries: (boundaries: any) => `Invalid boundaries attribute from initialProps: expected an Object, got ${boundaries.constructor.name}.`,
        notValidStartBoundary: (start: any) => `Invalid start boundary from initialProps: expected a Number, got ${start.constructor.name}.`,
        notValidEndBoundary: (end: any) => `Invalid end boundary from initialProps: expected a Number, got ${end.constructor.name}.`,
        notValidFlags: (flags: any) => `Invalid flags attribute from initialProps: expected an Object, got ${flags.constructor.name}.`,
        notValidEndOfResultsFlag: (flag: any) => `Invalid flag endOfResults from initialProps: expected a Boolean, got ${flag.constructor.name}.`,
        notValidBeginningOfResultsFlag: (flag: any) => `Invalid flag beginningOfResults from initialProps: expected a Boolean, got ${flag.constructor.name}.`,
        notValidLoadingFlag: (flag: any) => `Invalid flag loading from initialProps: expected a Boolean, got ${flag.constructor.name}.`,
        notValidEmptyFlag: (flag: any) => `Invalid flag empty from initialProps: expected a Boolean, got ${flag.constructor.name}.`,
        notValidLaunchedFlag: (flag: any) => `Invalid flag launched from initialProps: expected a Boolean, got ${flag.constructor.name}.`,
        notValidQueryParams: (params: any) => `Invalid queryParams prop: expected an Object, got ${params.constructor.name}.`,
        notValidDeferLaunch: (flag: any) => `Invalid deferLaunch prop: expected a Boolean, got ${flag.constructor.name}.`,
        notValidErrorHandler: (handler: any) => `Invalid errorHandler prop: expected a Function, got ${handler.constructor.name}.`,
        notValidBypassLoadSize: (handler: any) => `Invalid bypassLoadSize prop: expected a Boolean, got ${handler.constructor.name}.`,
        notValidPacketSize: (size: any) => `Invalid bypassLoadSize prop: expected a Number, got ${size.constructor.name}.`,
        notValidLoadSize: (size: any) => `Invalid loadSize prop: expected a Number, got ${size.constructor.name}.`,
        notValidInRushLoad: (flag: any) => `Invalid inRushLoad prop: expected a Boolean, got ${flag.constructor.name}.`,
        notValidInRushLoadSize: (size: any) => `Invalid inRushLoadSize prop: expected a Number, got ${size.constructor.name}.`,
        notValidLoadThreshold: (threshold: any) => `Invalid loadThreshold prop: expected an Object, got ${threshold.constructor.name}.`,
        notValidTopThreshold: (threshold: any) => `Invalid prop top from loadThreshold: expected a Number, got ${threshold.constructor.name}.`,
        notValidBottomThreshold: (threshold: any) => `Invalid prop bottom from loadThreshold: expected a Number, got ${threshold.constructor.name}.`,
        notValidPostLoadAction: (fn: any) => `Invalid postLoadAction prop: expected a Function, got ${fn.constructor.name}.`,

        tooSmallTopThreshold: (threshold: number) => `Top threshold of value ${threshold} is too small: expect a Number greater or equal to 1.`,
        tooSmallBottomThreshold: (threshold: number) => `Bottom threshold of value ${threshold} is too small: expect a Number greater or equal to 1.`,
        startGreaterThanEndBoundary: (start: number, end: number) => `initialProps set a start boundary at ${start}, which is greater than the end boundary ${end}.`
    }
};

export default errors;