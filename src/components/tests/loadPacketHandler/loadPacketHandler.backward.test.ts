import {PartialState} from '../../vars/interfaces';
import {describe, expect, it} from '@jest/globals';
import {directions} from '../../vars/defaults';
import loadPacketHandler from '../../handlers/loadPacketHandler';
import {dataset, simulator} from './simulators';
import {state, testResult} from './handlers.utils';

describe(
    'test apiHandler in backward mode',
    () => {
        let newState: PartialState = state;
        newState.boundaries = {
            end: 1100,
            start: 1100
        };

        it('should set endOfResults flag to true', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 0, 1040, 1040, false, true);
        });

        it('should load the 60 last results', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries = {
                end: 1000,
                start: 1000
            };
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 60, 940, 1000, false, false);
        });

        it('should load the next 30 results', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 90, 910, 1000, false, false);
        });

        it('should load the next 30 results', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 880, 1000, false, false);
        });

        it('should load the next 30 results, and remove the 30 last ones', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 850, 970, false, false);
        });

        it('should load the next 30 results, and keep the 30 last ones', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset), bypassLoadSize: true}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 150, 820, 970, false, false);
        });

        it('should load 30 results from anywhere, and remove the 60 last ones', async () => {
            let status = 0;
            newState.boundaries.start = 500;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 470, 910, false, false);
        });

        it('should load the 45 first results', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries = {
              start: 45,
              end: 450
            };
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 45, 0, 45, true, false);
        });

        it('shouldn\'t load any result', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries = {
                start: -1,
                end: 10
            };

            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 0, 0, 0, true, false);
        });

        it('should load 60 results from anywhere', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries.start = 500;
            newState.boundaries.end = 500;
            try {
                newState = await loadPacketHandler(
                    directions.backward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 60, 440, 500, false, false);
        });
    }
);