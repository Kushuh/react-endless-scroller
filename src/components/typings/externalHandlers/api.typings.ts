/**
 * Inform the components about the current request status.
 */
interface Flags {
    beginningOfResults?: boolean;
    endOfResults?: boolean;
}

/**
 * Inform the components about the current request position.
 */
interface Boundaries {
    start?: number;
    end?: number;
}

/**
 * Handle request results. queryResults is set to optional since some api return null as empty arrays.
 */
interface ApiResults {
    queryResults?: Array<ApiResult>;
    flags: Flags;
    boundaries: Boundaries;
    [x: string]: any;
}

/**
 * Only force a key to be present in the result tile. Any other parameter is free and optional, and depends on the
 * dataset returned by api.
 */
interface ApiResult {
    key: string;
    [x: string]: unknown;
}

/**
 * Refer to https://github.com/Kushuh/react-endless-scroller/blob/master/APISPECSHEET.md for more details.
 */
interface ApiParams {
    start: number;
    end: number;
    [x: string]: unknown;
}

export {
    Flags,
    Boundaries,
    ApiResult,
    ApiResults,
    ApiParams
}