import React from 'react';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ChildSimulator from './ChildSimulator';
import EndlessScrollHandler from '../../EndlessScrollHandler';
import {simulator, dataset} from '../loadPacketHandler/simulators';

Enzyme.configure({ adapter: new Adapter() });
const {shallow} = Enzyme;

describe(
    'testing low level component',
    () => {
        let endlessScroll;
        let mountSpy;
        let props = {};

        beforeEach(async () => {
            mountSpy = jest.spyOn(EndlessScrollHandler.prototype, 'componentDidMount');
            endlessScroll = await shallow(
                <EndlessScrollHandler api={simulator(0, dataset)} {...props}>
                    <ChildSimulator foo='bar'/>
                </EndlessScrollHandler>
            );
        });

        afterEach(async () => {
            await endlessScroll.unmount();
        });

        it('should mount with correct presets', async () => {
            expect(mountSpy).toHaveBeenCalled();
            expect(endlessScroll.state().empty).toBe(false);
        });

        it('should call preLoad when not deferLaunch', async () => {
            expect(endlessScroll.instance().preLoad).toBeDefined();
            expect(endlessScroll.instance().preLoad.constructor.name).toBe('Promise');

            expect(endlessScroll.state().loading || endlessScroll.state().launched).toBeTruthy();

            props = {deferLaunch: true};
        });

        it('should not call preLoad when deferLaunch', async () => {
            const state = endlessScroll.state();

            expect(endlessScroll.instance().preLoad).toBeNull();

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
            const state = endlessScroll.state();
            expect(state.tuples).toStrictEqual([{key: 'foo'}]);
            expect(state.flags).toStrictEqual({beginningOfResults: false, endOfResults: true});
            expect(state.boundaries).toStrictEqual({start: 300, end: 500});
            expect(state.loading).toBe(true);
            expect(state.empty).toBe(true);
            expect(state.launched).toBe(true);
        });
    }
);