import * as React from 'react';
import {setStateAsync, addPropsToChildren} from 'kushuh-react-utils';
import {defaultState, directions} from './vars/defaults';
import {ApiResult, PartialState, Props, State} from './vars/interfaces';
import loadPacketHandler from './handlers/loadPacketHandler';
import scrollHandler from './handlers/scrollHandler';
import removeHandler from './handlers/removeHandler';
import insertHandler from './handlers/insertHandler';

/**
 * Infinite scroll handler. Note this is the root component, which allows full control but is also slightly more tricky.
 * For an easier and more generic declaration, please refer to the <EndlessScroll/> component.
 *
 * This component is meant to work with a specific API. You can either use the prebuilt Go/Couchbase Api from [bucket],
 * or build your own according to this spec sheet : https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md.
 */
class EndlessScrollHandler extends React.Component<Props, PartialState> {
    lockScrollAction = false;

    /**
     * Only force full state during initialization. This ensure every parameter is correctly set. We later use the
     * PartialState interface to allow partial updates of the state (both are similar, except every parameter in
     * PartialState is optional).
     *
     * @param {[]object} results - holds an array of tiles retrieved from database
     * @param {object{
     *     @param {boolean} beginningOfResults - no results left above
     *     @param {boolean} endOfResults - no results left below
     * }} flags - inform the component about the current request status(1)
     * @param {object{
     *     @param {number} start - offset from start
     *     @param {number} end - offset from end
     * }} boundaries - inform the component about the current request position(2)
     * @param {object} error
     * @param {boolean} loading
     * @param {boolean} empty
     * @param {object} queryParams - optional queryParams relative to the api in use
     *
     *
     * (1) Unless specified otherwise, the component load results from start. Thus, beginningOfResults flag is set to
     * true. Since they may be some data to load, endOfResults is set to false. If the dataset doesn't contain any, or
     * even enough results, then the first load will instantly set the second flag to true. If no results are returned
     * from first load, an additional empty flag will be set to true.
     *
     * (2) Given a dataset of n tiles. At any moment, the results are loaded from offset x to offset y,
     * with 0 <= x <= y <= n.
     */
    state: State = {
        results: (this.props.initialProps || {}).results || [],
        flags: Object.assign({beginningOfResults: true, endOfResults: false}, (this.props.initialProps || {}).flags || {}),
        boundaries: Object.assign({start: 0, end: 0}, (this.props.initialProps || {}).boundaries || {}),
        error: (this.props.initialProps || {}).error,
        loading: (this.props.initialProps || {}).loading || false,
        queryParams: this.props.queryParams || {},
        empty: (this.props.initialProps || {}).empty || false,
        launched: (this.props.initialProps || {}).launched || false
    };

    /**
     * Default error handler, which wraps user handler if set.
     *
     * @param reason
     */
    errorHandler: (reason: unknown) => PromiseLike<void> = (reason: unknown) => {
        if (this.props.errorHandler) {
            this.props.errorHandler(reason);
        } else {
            console.error(reason);
        }

        return Promise.resolve();
    };

    /**
     * Forcefully reset the state. If an optional PartialState argument is given, then only the variable declared
     * inside will be override. If no argument is passed, the state is going to be totally cleared with default values.
     *
     * @param params
     */
    mutateState: (params) => Promise<void> = (params?: PartialState) => setStateAsync(this, params || defaultState);

    /**
     * Use this to update state from a search interface. queryParams depends on the api you are using, and are totally
     * optional.
     *
     * @param queryParams
     */
    updateQueryParams: (queryParams) => Promise<void> =
        (queryParams?: object) => setStateAsync(this, {queryParams: queryParams || {}});

    /**
     * Reset tiles and reload the wall according to some new queryParams.
     */
    search: () => Promise<void> = () => new Promise(async resolve => {
        await this.mutateState(null);
        await this.loadPacket(directions.forward, null);
        resolve();
    });

    /**
     * Component call api once mounted, although this behavior can be override for specific needs. If the user choose to
     * use the deferLaunch flag, then it will have to manually trigger the first request when it's ready.
     */
    componentDidMount(): void {
        if (!this.props.deferLaunch) {
            this.loadPacket(directions.forward, null).catch(this.errorHandler);
        }
    }

    /**
     * Load a packet from the dataset when needed. Direction indicate from which limit to load the packet, and also
     * where to insert it once fetched.
     *
     * @param {string} direction - backward or forward
     * @param {React.RefObject<HTMLInputElement>} scrollElement
     */
    loadPacket: (direction, scrollElement) => Promise<void> =
        (direction: string, scrollElement?: React.RefObject<HTMLInputElement>) => new Promise(
            (resolve, reject) => {
                this.setState({loading: true});

                const {results} = this.state;
                let updateScrollPosition: () => void;

                /**
                 * Their is no need to update scroll position for the first load.
                 *
                 * Otherwise, some glitches can happen while randomly inserting and removing DOM parts. To prevent this, and
                 * before fetching any data, we retrieve the vertical offset relative to the window frame of the boundary
                 * element (either the first or last one, depending on the direction). Then once new content has been loaded
                 * to the DOM, we ensure this boundary element keeps the same position on screen (which happens fast enough
                 * to be unnoticeable by end user).
                 *
                 * The reason we stick to boundary element is, because of some optimization concern, while new data is added,
                 * old data can often be removed.
                 */
                if (results.length && scrollElement != null) {
                    const refElement = results[direction === directions.forward ? results.length - 1 : 0];
                    const HTMLElement = document.getElementById(refElement.key);
                    const {top} = HTMLElement.getBoundingClientRect();

                    updateScrollPosition = () => {
                        const {top: newTop} = HTMLElement.getBoundingClientRect();
                        const offset = newTop - top;
                        scrollElement.current.scrollBy({
                            top: offset,
                            left: 0,
                            behavior: 'auto'
                        });
                    };
                }

                /**
                 * Call the api and parse result data. The handler will create an updated PartialState and return it.
                 * Once new state is set, we update scroll position and resolve the function.
                 */
                loadPacketHandler(direction, this.state, this.props)
                    .then(
                        ({apiResults, ...results}) => setStateAsync(this, results)
                            .then(() => Promise.resolve(apiResults))
                    )
                    .then(apiResults => {
                        updateScrollPosition();
                        if (this.props.postLoadAction) {
                            this.props.postLoadAction(apiResults);
                        }
                        if (scrollElement) {
                            scrollElement.current.dispatchEvent(new CustomEvent('scroll'));
                        }
                        resolve();
                    })
                    .catch(reject);
            }
        );

    /**
     * Trigger a fetch to dataset automatically when user is about to reach the end of available data to scroll.
     *
     * @param event
     * @param postProps
     */
    onScroll: (event) => void = (event: any) => {
        /**
         * The guard clause prevents multiple fetches at time.
         */
        if (!this.state.loading && !this.lockScrollAction) {
            /**
             * scrollHandler analyze the current DOM page situation, and if a fetch is needed, returns the correct state
             * parameters for the api call.
             */
            const res = scrollHandler(this.state, this.props, event);

            if (res != null) {
                this.lockScrollAction = true;
                const {direction, ...state} = res;
                setStateAsync(this, state)
                    .then( () => this.loadPacket(direction, {current: event.target}) )
                    .then( () => this.lockScrollAction = false )
                    .catch( this.errorHandler );
            }
        }
    };

    /**
     * Dynamically remove loaded content from list.
     *
     * @param scrollElement
     * @param ids
     */
    removeTuples: (scrollElement, ...ids) => void = async (scrollElement: any | null, ...ids: Array<string>) => {
        await setStateAsync(this, removeHandler(ids, this.state));
        if (scrollElement != null) scrollElement.dispatchEvent(new CustomEvent('scroll'));
    };

    /**
     * Dynamically add loaded content to list.
     *
     * @param scrollElement
     * @param tuples
     * @param index
     */
    insertTuples: (scrollElement, tuples, index) => void =
        async (scrollElement: any | null, tuples: Array<ApiResult>, index: number) => {
            await setStateAsync(this, insertHandler(tuples, this.state, index));
            if (scrollElement != null) scrollElement.dispatchEvent(new CustomEvent('scroll'));
        };

    render(): React.ReactNode {
        const {bypassLoadSize, children} = this.props;

        if (bypassLoadSize) {
            console.warn(
                'You have enabled bypassLoadSize flag. Please note it may only serve development purposes, as it can be ' +
                'very memory costly for large dataset. In case you want a long wall, prefer a large load size (>1000) ' +
                'to this option, as it disable all limits and can impact performances.'
            );
        }

        return addPropsToChildren(
            children,
            {
                endlessScroll: {
                    mutateState: this.mutateState,
                    updateQueryParams: this.updateQueryParams,
                    removeTuples: this.removeTuples,
                    insertTuples: this.insertTuples,
                    onScroll: this.onScroll,
                    search: this.search,
                    params: {...this.state}
                }
            }
        );
    }
}

export default EndlessScrollHandler;