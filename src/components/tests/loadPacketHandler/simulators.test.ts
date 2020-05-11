import {ApiResults} from '../../vars/interfaces';
import {describe, expect, it} from '@jest/globals';
import {dataset, simulator} from './simulators';

const checkResults: (status, apiResults, start, end, startFlag, endFlag) => void =
    (status: number, apiResults: ApiResults, start: number, end: number, startFlag: boolean, endFlag: boolean) => {
        expect(status).toBe(0);
        expect(apiResults).not.toBeNull();
        if (apiResults != null) {
            expect(apiResults.flags.endOfResults).toBe(endFlag);

            expect(apiResults.boundaries.start).toBe(start);
            expect(apiResults.boundaries.end).toBe(end);

            expect(apiResults.queryResults.length).toBe(end - start);

            for (const tile of apiResults.queryResults) {
                expect(tile.key.constructor).toBe(String);
                expect(tile.index.constructor).toBe(Number);
            }
        }
    };

describe(
    'test simulation variables',
    () => {
        describe('should populate dataset', () => {
            it('should have 1000 elements', () => {
                expect(dataset.length).toBe(1000);
            });
            it('should contain only valid data', () => {
                for (const tile of dataset) {
                    expect(tile.key.constructor).toBe(String);
                    expect(tile.index.constructor).toBe(Number);
                }
            });
        });

        describe('should simulate api smoothly', () => {
            it('should return the first 30 results', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 0, end: 30});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 0, 30, true, false);
            });

            it('should return 30 results from middle', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 501, end: 530});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 501, 530, false, false);
            });

            it('should return the 30 last results', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 971, end: 1000});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 971, 1000, false, true);
            });

            it('should return the 10 last results', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 991, end: 1120});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 991, 1000, false, true);
            });

            it('should return 0 results (limit > 1000)', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 2000, end: 2200});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 2000, 2000, false, true);
            });

            it('should return 0 results (limit < 0)', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: -10, end: 0});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 0, 0, true, false);
            });

            it('should return 0 results (interval == 0)', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 10, end: 10});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 10, 10, false, false);
            });

            it('should set both flags to true (full dataset)', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, dataset)({start: 0, end: 1000});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 0, 1000, true, true);
            });

            it('should set both flags to true (empty dataset)', async () => {
                let status = 0;
                let res: ApiResults | null = null;
                try {
                    res = await simulator(0, [])({start: 0, end: 30});
                } catch (e) {
                    status = 1;
                }

                checkResults(status, res, 0, 0, true, true);
            });

            it('should reject (mode == 1)', async () => {
                let status = 0;
                try {
                    await simulator(1, dataset)({start: 0, end: 30});
                } catch (e) {
                    status = 1;
                }

                expect(status).toBe(1);
            });

            it('should return object (mode == 2)', async () => {
                let status = 0;
                let res: unknown | null = null;
                try {
                    res = await simulator(2, dataset)({start: 0, end: 30});
                } catch (e) {
                    status = 1;
                }

                expect(status).toBe(0);
                expect(res).toEqual({foo: 'bar'});
            });
        });
    }
);