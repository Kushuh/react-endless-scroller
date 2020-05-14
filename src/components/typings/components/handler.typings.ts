import * as React from 'react';
import {Flags, Boundaries, ApiResults} from '../externalHandlers/api.typings';

/**
 * Override default state with custom user parameters on initialization.
 */
interface Init {
    tuples?: Array<ApiResult>;
    flags?: Flags;
    boundaries?: Boundaries;
    loading?: boolean;
    empty?: boolean;
    launched?: boolean;
}

interface LoadThreshold {
    top: number;
    bottom: number;
}

/**
 * @property {function | Promise} api - fetch function to dynamically load data. It has to comply to
 * https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md requirements.
 * @property {object=} initialProps - override some default state props.
 * @property {object=} queryParams - optional query parameters to pass to the api.
 * @property {boolean=} deferLaunch - cancel the automatic load of the first dataset, and wait for user to manually
 * trigger it.
 * @property {function=} errorHandler - handle each error that happens with a user custom function.
 * @property {boolean=} bypassLoadSize - [DANGEROUS] disable load size limit(1)
 * @property {number=} packetSize - determine which amount of data is going to be loaded, default is 30, minimum 1.
 * @property {number=} loadSize - determine maximum amount of data to keep into DOM, default is 120, minimum 1.
 * @property {boolean=true} inRushLoad - allow initial load to be more large
 * @property {number=} inRushLoadSize - set a custom size for the inRushLoad, minimum is 1.
 * @property {LoadThreshold=} loadThreshold - specify threshold to trigger scroll events(2)
 *
 * (1) This option disables load size, meaning that old result will stay in DOM. It may only serve development purposes,
 * as it can be very memory costly for large dataset. In case you want a long wall, prefer a large load size (>1000) to
 * this option, as it disable all limits and can impact performances.
 *
 * (2) By default, new loads will only trigger once user has scrolled the whole content. However, it is possible to
 * trigger this more early, by setting the threshold properties. Thus, new fetch will trigger as soon as the user come
 * through the threshold point, a distance in pixel from the actual limit of the scrollable element.
 */
interface Props {
    children?: React.ReactNode | React.ReactNodeArray | null,
    api: (params: ApiParams) => Promise<ApiResults>;
    initialProps?: Init;
    queryParams?: Record<string, any>;
    deferLaunch?: boolean;
    errorHandler?: Function;
    bypassLoadSize?: boolean;
    packetSize?: number;
    loadSize?: number;
    inRushLoad?: boolean;
    inRushLoadSize?: number;
    loadThreshold?: LoadThreshold;
    postLoadAction?: (...any) => any;
}

interface PartialProps {
    children?: React.ReactNode | React.ReactNodeArray | null,
    api?: (params: ApiParams) => Promise<ApiResults>;
    initialProps?: Init;
    queryParams?: Record<string, any>;
    deferLaunch?: boolean;
    errorHandler?: Function;
    bypassLoadSize?: boolean;
    packetSize?: number;
    loadSize?: number;
    inRushLoad?: boolean;
    inRushLoadSize?: number;
    loadThreshold?: LoadThreshold;
    postLoadAction?: Function;
}

interface State {
    tuples: Array<ApiResult>;
    flags: Flags;
    boundaries: Boundaries;
    loading: boolean;
    empty: boolean;
    launched: boolean;
}

interface PartialState {
    tuples?: Array<ApiResult>;
    flags?: Flags;
    boundaries?: Boundaries;
    loading?: boolean;
    empty?: boolean;
    launched?: boolean;
    [x: string]: any;
}

export {
    Props,
    PartialProps,
    State,
    PartialState,
    LoadThreshold,
    Init
};