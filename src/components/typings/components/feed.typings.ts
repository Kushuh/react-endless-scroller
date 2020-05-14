import * as React from 'react';
import {Init, LoadThreshold} from './handler.typings';
import {ApiParams, ApiResults} from '../externalHandlers/api.typings';

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

}

export {Props, PartialProps, State};