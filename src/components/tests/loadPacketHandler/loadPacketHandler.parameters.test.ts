import {describe, it, expect} from '@jest/globals';
import {directions} from '../../vars/defaults';
import loadPacketHandler from '../../handlers/loadPacketHandler';
import {dataset, simulator} from './simulators';
import {PartialState} from '../../vars/interfaces';
import {state, wrongApiResponses} from './handlers.utils';
import errors from '../../vars/errors';


describe(
    'test parameter handling',
    () => {
        describe(
            'should pass',
            () => {
                it('should return 60 results by default, then 90, then 120, then 120', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset)}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(60);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset)}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(90);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset)}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(120);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset)}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(120);
                });

                it('should return inRushLoadSize results with inRushLoadSize > packetSize, then packetSize more', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 45}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(45);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), inRushLoadSize: 45}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(75);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoadSize: 60}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(60);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoadSize: 60}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(105);
                });

                it('should return inRushLoadSize results with inRushLoadSize < packetSize, then packetSize more', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 15}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(15);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), inRushLoadSize: 15}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(45);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoadSize: 15}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(15);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoadSize: 15}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(60);
                });

                it('should return packetSize results with inRushLoad set to false, then packetSize more', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(30);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(60);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(45);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), packetSize: 45, inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(90);
                });

                it('should return packetSize results with loadSize < 2*packetSize and inRushLoad set to false, then loadSize results', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 45, inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(30);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), loadSize: 45, inRushLoad: false}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(45);
                });

                it('should return loadSize results with inRushLoadSize > loadSize', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 90, inRushLoadSize: 120}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(90);
                });

                it('should return packetSize results, then 2*packetSize results with loadSize < 2*packetSize, no inRushLoad and bypassLoadSize', async () => {
                    let status = 0;
                    let newState: PartialState;
                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 45, inRushLoad: false, bypassLoadSize: true}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(30);

                    try {
                        newState = await loadPacketHandler(
                            directions.forward,
                            newState,
                            {api: simulator(0, dataset), loadSize: 45, inRushLoad: false, bypassLoadSize: true}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                    expect(newState.results.length).toBe(60);
                });
            }
        );

        describe(
            'should fail',
            () => {
                it('should not allow non valid packetSize values', async () => {
                    let status = 0;
                    let error: unknown;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 0}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.packetSize.tooSmall(0)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 3000}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.packetSize.tooLarge(3000)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 1000}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);

                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 1}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                });

                it('should not allow non valid loadSize values', async () => {
                    let status = 0;
                    let error: unknown;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 1, loadSize: 2}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.loadSize.tooSmall(2)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 30000}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.loadSize.tooLarge(30000)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 15}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.loadSize.noLessThanPacketSize(15, 30)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), loadSize: 10000}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);

                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), packetSize: 2, loadSize: 3}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                });

                it('should not allow non valid inRushLoadSize values', async () => {
                    let status = 0;
                    let error: unknown;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 0}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.inRushLoadSize.tooSmall(0)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 6000}
                        );
                    } catch (e) {
                        error = e;
                        status = 1;
                    }

                    expect(status).toBe(1);
                    expect(error).toEqual(new Error(errors.inRushLoadSize.tooLarge(6000)));

                    status = 0;
                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 1}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);

                    try {
                        await loadPacketHandler(
                            directions.forward,
                            state,
                            {api: simulator(0, dataset), inRushLoadSize: 5000}
                        );
                    } catch (e) {
                        status = 1;
                    }

                    expect(status).toBe(0);
                });

                for (const [message, response, errorMessage] of wrongApiResponses) {
                    it(message, async () => {
                        let error;
                        try {
                            await loadPacketHandler(
                                directions.forward,
                                state,
                                {api: () => Promise.resolve(response)}
                            );
                        } catch (e) {
                            error = e;
                        }

                        expect(error).toEqual(new Error(errorMessage));
                    });
                }
            }
        );
    }
);