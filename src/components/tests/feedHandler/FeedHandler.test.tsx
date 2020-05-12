import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ChildSimulator from './ChildSimulator';
import EndlessFeedHandler from '../../EndlessFeedHandler';
import {simulator, dataset} from '../loadPacketHandler/simulators';

Enzyme.configure({ adapter: new Adapter() });
const {shallow} = Enzyme;

describe(
    'testing low level components',
    () => {
        let feed;
        let mountSpy;
        let props = {};

        beforeEach(async () => {
            mountSpy = jest.spyOn(EndlessFeedHandler.prototype, 'componentDidMount');
            feed = await shallow(
                <EndlessFeedHandler api={simulator(0, dataset)} {...props}>
                    <ChildSimulator foo='bar'/>
                </EndlessFeedHandler>
            );
        });

        afterEach(async () => {
            await feed.unmount();
        });

        it('should mount with correct presets', async () => {
            expect(mountSpy).toHaveBeenCalled();
            expect(feed.state().empty).toBe(false);
        });

        it('should call preLoad when not deferLaunch', async () => {
            expect(feed.instance().preLoad).toBeDefined();
            expect(feed.instance().preLoad.constructor.name).toBe('Promise');

            expect(feed.state().loading || feed.state().launched).toBeTruthy();

            props = {deferLaunch: true};
        });

        it('should not call preLoad when deferLaunch', async () => {
            const state = feed.state();

            expect(feed.instance().preLoad).toBeNull();

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

            props = {
                deferLaunch: true,
                initialProps: {
                    tuples: [{key: 'foo'}],
                    flags: {beginningOfResults: false, endOfResults: true},
                    boundaries: {start: 300, end: 500},
                    loading: true,
                    empty: true,
                    launched: true
                }
            };
        });

        it('should override default state', () => {
            const state = feed.state();
            expect(state.tuples).toStrictEqual([{key: 'foo'}]);
            expect(state.flags).toStrictEqual({beginningOfResults: false, endOfResults: true});
            expect(state.boundaries).toStrictEqual({start: 300, end: 500});
            expect(state.loading).toBe(true);
            expect(state.empty).toBe(true);
            expect(state.launched).toBe(true);
        });
    }
);