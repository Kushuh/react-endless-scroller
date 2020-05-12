import * as React from 'react';
import {ApiParams, ApiResults, Init, LoadThreshold} from './handler.interfaces';

interface Props {
    children?: React.ReactNode | React.ReactNodeArray,
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
    children?: React.ReactNode | React.ReactNodeArray,
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

}

export {Props, PartialProps, State};