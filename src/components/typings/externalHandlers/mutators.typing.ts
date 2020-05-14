import {ApiResult} from './api.typings';

interface MutatorsOptions {
    scrollElement: any | null;
    ids?: Array<string>;
    tuples?: Array<ApiResult>;
    index?: number;
}

export {MutatorsOptions};