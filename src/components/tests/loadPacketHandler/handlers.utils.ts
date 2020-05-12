import {PartialState, State} from '../../vars/handler.interfaces';
import {expect} from '@jest/globals';
import errors from '../../vars/errors';

const state: State = {
    tuples: [],
    flags: {beginningOfResults: true, endOfResults: false},
    boundaries: {start: 0, end: 0},
    loading: false,
    empty: false,
    launched: false
};

const testResult: (r, st, l, s, e, sf, ef) => void =
    (r: PartialState, st: number, l: number, s: number, e: number, sf: boolean, ef: boolean) => {
        expect(st).toBe(0);
        expect(r.launched).toBe(true);
        expect(r.loading).toBe(false);
        expect(r.tuples.length).toBe(l);
        expect(r.flags.beginningOfResults).toBe(sf);
        expect(r.flags.endOfResults).toBe(ef);
        expect(r.boundaries.start).toBe(s);
        expect(r.boundaries.end).toBe(e);

        for (let i = 0; i < r.tuples.length; i++) {
            expect(
                r.tuples.slice(i + 1).find(x => x.key === r.tuples[i].key)
            ).toBeUndefined();
        }
    };

const wrongApiResponses = [
    [
        'should reject empty api response',
        undefined,
        errors.apiResults.noResults
    ],
    [
        'should reject non Object api response',
        'A string.',
        errors.apiResults.notValidResult('A string.')
    ],
    [
        'should reject empty Object api response',
        {},
        errors.apiResults.noBoundaries
    ],
    [
        'should reject response with null boundaries',
        {boundaries: null},
        errors.apiResults.noBoundaries
    ],
    [
        'should reject response with non Object boundaries',
        {boundaries: 'Another string.'},
        errors.apiResults.notValidBoundaries('Another string.')
    ],
    [
        'should reject response with empty Object boundaries',
        {boundaries: {}},
        errors.apiResults.noStartBoundary
    ],
    [
        'should reject response with null start boundary',
        {boundaries: {start: null}},
        errors.apiResults.noStartBoundary
    ],
    [
        'should reject response with non Number start boundary',
        {boundaries: {start: 'There.'}},
        errors.apiResults.notValidStartBoundary('There.')
    ],
    [
        'should reject response with empty end boundary',
        {boundaries: {start: 0}},
        errors.apiResults.noEndBoundary
    ],
    [
        'should reject response with null end boundary',
        {boundaries: {start: 0, end: null}},
        errors.apiResults.noEndBoundary
    ],
    [
        'should reject response with non Number end boundary',
        {boundaries: {start: 0, end: 'There.'}},
        errors.apiResults.notValidEndBoundary('There.')
    ],
    [
        'should reject response with empty flags',
        {boundaries: {start: 0, end: 0}},
        errors.apiResults.noFlags
    ],
    [
        'should reject response with null flags',
        {boundaries: {start: 0, end: 0}, flags: null},
        errors.apiResults.noFlags
    ],
    [
        'should reject response with non Object flags',
        {boundaries: {start: 0, end: 0}, flags: 'Yet another string.'},
        errors.apiResults.notValidFlags('yet another string.')
    ],
    [
        'should reject response with empty Object flags',
        {boundaries: {start: 0, end: 0}, flags: {}},
        errors.apiResults.noEndOfResultsFlag
    ],
    [
        'should reject response with null endOfResults flag',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: null}},
        errors.apiResults.noEndOfResultsFlag
    ],
    [
        'should reject response with non Boolean endOfResults flag',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: 'false'}},
        errors.apiResults.notValidEndOfResultsFlag('false')
    ],
    [
        'should reject response with non Array queryResults',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: false}, queryResults: {}},
        errors.apiResults.notValidQueryResults({})
    ],
    [
        'should reject response with non Object queryResults tuple',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: false}, queryResults: ['A string']},
        errors.apiResults.notValidTuple('A string.', 'api in queryResults')
    ],
    [
        'should reject response when tuple with no key',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: false}, queryResults: [{}]},
        errors.apiResults.noTupleKey
    ],
    [
        'should reject response when tuple is null',
        {boundaries: {start: 0, end: 0}, flags: {endOfResults: false}, queryResults: [null, {key: 1}]},
        errors.apiResults.notValidTuple(null, 'api in queryResults')
    ]
];

export {state, testResult, wrongApiResponses};