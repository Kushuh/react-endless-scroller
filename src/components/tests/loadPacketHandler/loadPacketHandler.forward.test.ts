import {PartialState} from '../../vars/handler.interfaces';
import {describe, it} from '@jest/globals';
import {directions} from '../../vars/defaults';
import loadPacketHandler from '../../handlers/loadPacketHandler';
import {dataset, simulator} from './simulators';
import {state, testResult} from './handlers.utils';

describe(
    'test apiHandler in forward mode',
    () => {
        let newState: PartialState;

        it('should load the first 60 results', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    state,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 60, 0, 60, true, false);
        });

        it('should load the next 30 results', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 90, 0, 90, true, false);
        });

        it('should load the next 30 results', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 0, 120, true, false);
        });

        it('should load the next 30 results, and remove the 30 first ones', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 30, 150, false, false);
        });

        it('should load the next 30 results, and keep the 30 first ones', async () => {
            let status = 0;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset), bypassLoadSize: true}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 150, 30, 180, false, false);
        });

        it('should load 30 results from anywhere, and remove the 60 first ones', async () => {
            let status = 0;
            newState.boundaries.end = 500;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 120, 90, 530, false, false);
        });

        it('should load the 45 last results', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries.start = 0;
            newState.boundaries.end = 955;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 45, 955, 1000, false, true);
        });

        it('shouldn\'t load any result', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries.start = 0;
            newState.boundaries.end = 1100;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 0, 1100, 1100, false, true);
        });

        it('should load 60 results from anywhere', async () => {
            let status = 0;
            Object.assign(newState, {...state});
            newState.boundaries.start = 500;
            newState.boundaries.end = 500;
            try {
                newState = await loadPacketHandler(
                    directions.forward,
                    newState,
                    {api: simulator(0, dataset)}
                );
            } catch (e) {
                status = 1;
            }

            testResult(newState, status, 60, 500, 560, false, false);
        });
    }
);