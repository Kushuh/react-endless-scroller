import React from 'react';
import {setStateAsync, addPropsToChildren} from 'kushuh-react-utils';
import {defaultState, directions} from './vars/defaults';
import {PartialState, Props, State} from './typings/components/handler.typings';
import {ApiResult} from './typings/externalHandlers/api.typings';
import loadPacketHandler from './handlers/loadPacketHandler';
import scrollHandler from './handlers/scrollHandler';
import removeHandler from './handlers/removeHandler';
import insertHandler from './handlers/insertHandler';
import {MutatorsOptions} from './typings/externalHandlers/mutators.typing';

let propsValidator;
const isDevENV = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

if (isDevENV) {
    propsValidator = import('./validators/propsValidator');
}

/**
 * Infinite scroll handler. Note this is the root components, which allows full control but is also slightly more tricky.
 * For an easier and more generic declaration, please refer to the <EndlessFeed/> components.
 *
 * This components is meant to work with a specific API. You can either use the prebuilt Go/Couchbase Api from [bucket],
 * or build your own according to this spec sheet : https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md.
 */
class EndlessFeedHandler extends React.Component<Props, PartialState> {
    lockScrollAction = false;
    initialProps = this.props.initialProps || {};

    /**
     * Only run validators in dev environment.
     *
     * @param props
     */
    constructor(props: Props) {
        super(props);

        if (isDevENV) {
            propsValidator.then(
                ({default: validator}) => validator(props).catch(
                    error => {
                        console.error(error);
                        throw new Error(error);
                    }
                )
            );
        }

        this.errorHandler = this.errorHandler.bind(this);
        this.mutateState = this.mutateState.bind(this);
        this.feed = this.feed.bind(this);
        this.loadPacket = this.loadPacket.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.removeTuples = this.removeTuples.bind(this);
        this.insertTuples = this.insertTuples.bind(this);
        this._removeTuples = this._removeTuples.bind(this);
        this._insertTuples = this._insertTuples.bind(this);
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<PartialState>, snapshot?: any) {
        if (isDevENV) {
            propsValidator.then(
                ({default: validator}) => validator(this.props).catch(
                    error => {
                        console.error(error);
                        throw new Error(error);
                    }
                )
            );
        }
    }

    /**
     * Only force full state during initialization. This ensure every parameter is correctly set. We later use the
     * PartialState interface to allow partial updates of the state (both are similar, except every parameter in
     * PartialState is optional).
     *
     * @param {[]object} tuples - holds an array of tiles retrieved from database
     * @param {object{
     *     @param {boolean} beginningOfResults - no tuples left above
     *     @param {boolean} endOfResults - no tuples left below
     * }} flags - inform the components about the current request status(1)
     * @param {object{
     *     @param {number} start - offset from start
     *     @param {number} end - offset from end
     * }} boundaries - inform the components about the current request position(2)
     * @param {boolean} loading
     * @param {boolean} empty
     * @param {boolean} launched
     *
     *
     * (1) Unless specified otherwise, the components load tuples from start. Thus, beginningOfResults flag is set to
     * true. Since they may be some data to load, endOfResults is set to false. If the dataset doesn't contain any, or
     * even enough tuples, then the first load will instantly set the second flag to true. If no tuples are returned
     * from first load, an additional empty flag will be set to true.
     *
     * (2) Given a dataset of n tiles. At any moment, the tuples are loaded from offset x to offset y,
     * with 0 <= x <= y <= n.
     */
    state: State = {
        tuples: (this.props.initialProps || {}).tuples || [],
        flags: Object.assign(
            {beginningOfResults: true, endOfResults: false},
            this.initialProps.flags || {}
        ),
        boundaries: Object.assign(
            {start: 0, end: 0},
            this.initialProps.boundaries || {}
        ),
        loading: this.initialProps.loading != null ? this.initialProps.loading : !this.props.deferLaunch,
        empty: this.initialProps.empty || false,
        launched: this.initialProps.launched || false
    };

    /**
     * Unless deferLaunch is set to true, first api call is launched before the component even mounts. We don't call the
     * class wrapper since we don't want to update state yet. If ever data fetches before component is mounted, it will
     * be hold until componentDidMount method is called (the then method of an already resolved Promise works, it will
     * resolve synchronously).
     *
     * This allow for faster data loading and page charging.
     */
    preLoad = this.props.deferLaunch ?
        null :
        loadPacketHandler(directions.forward, this.state, this.props);

    async componentDidMount() {
        if (this.preLoad !== null) {
            try {
                const {apiResults, ...results} = await this.preLoad;
                if (this.props.postLoadAction) {
                    this.props.postLoadAction(apiResults);
                }

                await setStateAsync(this, results);
            } catch(error) {
                await this.errorHandler(error);
            }
        }
    }

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
    mutateState: (params?: PartialState) => Promise<void> =
        (params?: PartialState) => setStateAsync(this, params || defaultState);

    /**
     * Reset tuples and reload the wall.
     */
    feed: () => Promise<void> = () => new Promise(async resolve => {
        await this.mutateState(null);
        await this.loadPacket(directions.forward, null);
        resolve();
    });

    /**
     * Backward compatibility.
     */
    search = this.feed;

    /**
     * Load a packet from the dataset when needed. Direction indicate from which limit to load the packet, and also
     * where to insert it once fetched.
     *
     * @param {string} direction - backward or forward
     * @param {React.RefObject<HTMLElement>} scrollElement
     */
    loadPacket: (direction: string, scrollElement?: React.RefObject<HTMLElement>) => Promise<void> =
        (direction: string, scrollElement?: React.RefObject<HTMLElement>) => new Promise(
            async (resolve, reject) => {
                this.setState({loading: true});

                const {tuples} = this.state;
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
                if (tuples.length && scrollElement != null) {
                    const refElement = tuples[direction === directions.forward ? tuples.length - 1 : 0];
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
                try {
                    const {apiResults, ...results} = await loadPacketHandler(direction, this.state, this.props);
                    if (this.props.postLoadAction) {
                        this.props.postLoadAction({apiResults, ...results});
                    }
                    await setStateAsync(this, results);
                    if (updateScrollPosition != null) updateScrollPosition();
                    if (scrollElement) {
                        scrollElement.current.dispatchEvent(new CustomEvent('scroll'));
                    }
                    resolve();
                } catch(error) {
                    reject(error);
                }
            }
        );

    /**
     * Trigger a fetch to dataset automatically when user is about to reach the end of available data to scroll.
     *
     * @param event'
     */
    onScroll: (event: any) => void = async (event: any) => {
        /**
         * The guard clause prevents multiple fetches at time.
         */
        if (!this.state.loading && !this.lockScrollAction) {
            /**
             * scrollHandler analyze the current DOM page situation, and if a fetch is needed, returns the correct state
             * parameters for the api call.
             */
            const direction = scrollHandler(this.state, this.props, event);

            if (direction != null) {
                this.lockScrollAction = true;
                await this.loadPacket(direction, {current: event.target}).catch( this.errorHandler );
                this.lockScrollAction = false;
            }
        }
    };

    /**
     * Dynamically remove loaded content from list.
     *
     * @param params
     */
    removeTuples: (params: MutatorsOptions) => void =
        async (params: MutatorsOptions) => {
            await setStateAsync(this, removeHandler(params.ids, this.state));
            if (params.scrollElement != null) {
                params.scrollElement.dispatchEvent(new CustomEvent('scroll'));
            }
        };

    /**
     * Backward compatibility.
     *
     * @param scrollElement
     * @param ids
     * @private
     */
    _removeTuples: (scrollElement: any | null, ...ids: Array<string>) => void =
        async (scrollElement: any | null, ...ids: Array<string>) => {
            await setStateAsync(this, removeHandler(ids, this.state));
            if (scrollElement != null) scrollElement.dispatchEvent(new CustomEvent('scroll'));
        };

    /**
     * Dynamically add loaded content to list.
     *
     * @param params
     */
    insertTuples: (params: MutatorsOptions) => void =
        async (params: MutatorsOptions) => {
            await setStateAsync(this, insertHandler(params.tuples, this.state, params.index));
            if (params.scrollElement != null) {
                params.scrollElement.dispatchEvent(new CustomEvent('scroll'));
            }
        };

    _insertTuples: (scrollElement: any | null, tuples: Array<ApiResult>, index: number) => void =
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
                feed: {
                    mutateState: this.mutateState,
                    removeTuples: this.removeTuples,
                    insertTuples: this.insertTuples,
                    onScroll: this.onScroll,
                    search: this.feed,
                    params: {...this.state}
                }
            }
        );
    }
}

export default EndlessFeedHandler;