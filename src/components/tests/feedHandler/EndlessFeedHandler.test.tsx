import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ChildSimulator from './ChildSimulator';
import EndlessFeedHandler from '../../EndlessFeedHandler';
import {simulator, dataset} from '../loadPacketHandler/simulators';
import {describe, afterEach, expect, it, jest} from '@jest/globals';

Enzyme.configure({ adapter: new Adapter() });
const {mount} = Enzyme;
const postLoadAction = jest.fn();

describe(
    'testing low level component',
    () => {
        let feed;
        let mountSpy;
        let mutateSpy;

        const mountComponent = props => new Promise(
            async resolve => {
                mountSpy = jest.spyOn(EndlessFeedHandler.prototype, 'componentDidMount');
                feed = await mount(
                    <EndlessFeedHandler api={simulator(0, dataset)} {...(props || {})}>
                        <ChildSimulator foo='bar'/>
                    </EndlessFeedHandler>
                );

                mutateSpy = jest.spyOn(await feed.instance(), 'mutateState');
                resolve();
            }
        );

        afterEach(async () => {
            await feed.unmount();
        });

        it('should mount with correct presets', async () => {
            await mountComponent({});
            expect(mountSpy).toHaveBeenCalled();
            expect(feed.state().empty).toBe(false);
        });

        it('should call preLoad when not deferLaunch', async () => {
            await mountComponent({postLoadAction});

            expect(feed.props().deferLaunch).toBeUndefined();
            await expect(feed.instance().preLoad).toBeDefined();
            await expect(feed.instance().preLoad.constructor.name).toBe('Promise');

            expect(feed.state().loading || feed.state().launched).toBeTruthy();

            await feed.instance().preLoad;
            expect(postLoadAction).toHaveBeenCalled();
            expect(feed.state().launched).toBeTruthy();
            expect(feed.state().loading).toBeFalsy();
        });

        it('should not call preLoad when deferLaunch', async () => {
            await mountComponent({deferLaunch: true});

            expect(feed.props().deferLaunch).toBe(true);
            const state = feed.state();

            expect(state.tuples).toEqual([]);
            expect(state.loading).toBe(false);
            expect(state.flags).toStrictEqual({
                beginningOfResults: true,
                endOfResults: false
            });
            expect(state.boundaries).toStrictEqual({
                start: 0,
                end: 0
            });
            expect(state.launched).toBe(false);
        });

        it('should override default state with initialProps', async () => {
            await mountComponent({
                deferLaunch: true,
                initialProps: {
                    tuples: [{key: 'foo'}],
                    flags: {beginningOfResults: false, endOfResults: true},
                    boundaries: {start: 300, end: 500},
                    loading: true,
                    empty: true,
                    launched: true
                }
            });

            const state = feed.state();
            expect(state.tuples).toStrictEqual([{key: 'foo'}]);
            expect(state.flags).toStrictEqual({beginningOfResults: false, endOfResults: true});
            expect(state.boundaries).toStrictEqual({start: 300, end: 500});
            expect(state.loading).toBe(true);
            expect(state.empty).toBe(true);
            expect(state.launched).toBe(true);
        });

        it('should mutate state', async () => {
            await mountComponent({});

            await feed.instance().preLoad;
            let state = feed.state();
            expect(state.tuples.length).toBe(60);
            expect(state.boundaries).toStrictEqual({start: 0, end: 60});

            await feed.instance().mutateState(
                ({tuples}) => ({
                    tuples: [{key: 'foo'}, ...tuples],
                    flags: {beginningOfResults: false, endOfResults: true}
                })
            );

            state = feed.state();
            expect(state.tuples.length).toBe(61);
            expect(state.tuples[0]).toStrictEqual({key: 'foo'});
            expect(state.boundaries).toStrictEqual({start: 0, end: 60});
            expect(state.flags).toStrictEqual({beginningOfResults: false, endOfResults: true});

            await feed.instance().mutateState();

            state = feed.state();
            expect(state.tuples.length).toBe(0);
            expect(state.boundaries).toStrictEqual({start: 0, end: 0});
            expect(state.flags).toStrictEqual({beginningOfResults: true, endOfResults: false});
        });

        it('should search', async() => {
            await mountComponent({postLoadAction, inRushLoadSize: 120});
            await feed.instance().preLoad;

            expect(feed.state().tuples.length).toBe(120);

            feed.setProps({inRushLoad: false});
            expect(feed.props().inRushLoad).toBeFalsy();

            await feed.instance().feed();
            expect(mutateSpy).toHaveBeenCalled();
            expect(feed.state().tuples.length).toBe(30);
        });

        it('should remove tuples', async () => {
            await mountComponent({});
            await feed.instance().preLoad;
            expect(feed.state().tuples.length).toBe(60);

            const subsetKeys = feed.state().tuples.slice(10-20).map(({key}) => key);

            await feed.instance().removeTuples(null, ...subsetKeys);
            expect(feed.state().tuples.length).toBe(50);

            for (const key of subsetKeys) {
                expect(feed.state().tuples.findIndex(x => x.key === key)).toBe(-1);
            }

            await feed.instance().removeTuples(null, 'fakeKey-1', 'fakeKey-2');
            expect(feed.state().tuples.length).toBe(50);
        });

        it('should add tuples', async () => {
            await mountComponent({});
            await feed.instance().preLoad;
            expect(feed.state().tuples.length).toBe(60);

            const subsetKeys = feed.state().tuples.slice(10-20);

            await feed.instance().insertTuples(null, subsetKeys);
            expect(feed.state().tuples.length).toBe(60);

            await feed.instance().insertTuples(null, [subsetKeys[1], {key: 'fakeKey-1'}, {key: 'fakeKey-2'}]);
            expect(feed.state().tuples.length).toBe(62);

            expect(feed.state().tuples[60]).toStrictEqual({key: 'fakeKey-1'});
            expect(feed.state().tuples[61]).toStrictEqual({key: 'fakeKey-2'});

            await feed.instance().insertTuples(null, [{key: 'fakeKey-3'}], 10);
            expect(feed.state().tuples.length).toBe(63);

            expect(feed.state().tuples[10]).toStrictEqual({key: 'fakeKey-3'});
        });
    }
);