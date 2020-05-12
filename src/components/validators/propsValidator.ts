import {PartialProps} from '../vars/handler.interfaces';
import errors from '../vars/errors';
import tuplesValidator from "./tuplesValidator";

const propsValidator: (p) => Promise<any> = (props: PartialProps) => new Promise(
    async (resolve, reject) => {
        const {
            api,
            initialProps,
            queryParams,
            deferLaunch,
            errorHandler,
            bypassLoadSize,
            packetSize,
            loadSize,
            inRushLoad,
            inRushLoadSize,
            loadThreshold,
            postLoadAction
        } = props;

        if (api == null) {
            reject(new Error(errors.props.missingApi));
        } else if (api.constructor !== Function) {
            reject(new Error(errors.props.notValidApi(api)));
        }

        if (initialProps != null) {
            if (initialProps.constructor !== Object) {
                reject(new Error(errors.props.notValidInitialProps(initialProps)));
            } else {
                const {tuples, flags, boundaries, loading, empty, launched, ...other} = initialProps;

                for (const key of Object.keys(other)) {
                    console.warn(`Unrecognized prop ${key} in initialProps for EndlessFeedHandler component. ` +
                        'This key will be ignored.')
                }

                if (tuples != null && tuples.constructor !== Array) {
                    reject(new Error(errors.props.notValidTuples(tuples)));
                } else if (tuples != null) {
                    await tuplesValidator(tuples, 'tuples in initialProps').catch(reject);
                }

                if (boundaries != null) {
                    if (boundaries.constructor !== Object) {
                        reject(new Error(errors.props.notValidBoundaries(boundaries)));
                    } else {
                        if (boundaries.start != null && boundaries.start.constructor !== Number) {
                            reject(new Error(errors.props.notValidStartBoundary(boundaries.start)));
                        }

                        if (boundaries.end != null && boundaries.end.constructor !== Number) {
                            reject(new Error(errors.props.notValidEndBoundary(boundaries.end)));
                        }

                        if (boundaries.start != null && boundaries.end != null && boundaries.start > boundaries.end) {
                            reject(new Error(errors.props.startGreaterThanEndBoundary(boundaries.start, boundaries.end)));
                        }
                    }
                }

                if (flags != null) {
                    if (flags.constructor != Object) {
                        reject(new Error(errors.props.notValidFlags(flags)));
                    } else {
                        const {endOfResults, beginningOfResults} = flags;

                        if (endOfResults != null && endOfResults.constructor !== Boolean) {
                            reject(new Error(errors.props.notValidEndOfResultsFlag(endOfResults)));
                        }

                        if (beginningOfResults != null && beginningOfResults.constructor !== Boolean) {
                            reject(new Error(errors.props.notValidBeginningOfResultsFlag(beginningOfResults)));
                        }
                    }
                }

                if (loading != null && loading.constructor !== Boolean) {
                    reject(new Error(errors.props.notValidLoadingFlag(loading)));
                }

                if (empty != null && empty.constructor !== Boolean) {
                    reject(new Error(errors.props.notValidEmptyFlag(empty)));
                }

                if (launched != null && launched.constructor !== Boolean) {
                    reject(new Error(errors.props.notValidLaunchedFlag(launched)));
                }
            }


        }

        if (queryParams != null && queryParams.constructor != Object) {
            reject(new Error(errors.props.notValidQueryParams(queryParams)));
        }

        if (deferLaunch != null && deferLaunch.constructor !== Boolean) {
            reject(new Error(errors.props.notValidDeferLaunch(deferLaunch)));
        }

        if (errorHandler != null && errorHandler.constructor !== Function) {
            reject(new Error(errors.props.notValidErrorHandler(errorHandler)));
        }

        if (bypassLoadSize != null && bypassLoadSize.constructor !== Boolean) {
            reject(new Error(errors.props.notValidBypassLoadSize(bypassLoadSize)));
        }

        if (packetSize != null && packetSize.constructor !== Number) {
            reject(new Error(errors.props.notValidPacketSize(packetSize)));
        }

        if (loadSize != null && loadSize.constructor !== Number) {
            reject(new Error(errors.props.notValidLoadSize(loadSize)));
        }

        if (inRushLoad != null && inRushLoad.constructor !== Boolean) {
            reject(new Error(errors.props.notValidInRushLoad(inRushLoad)));
        }

        if (inRushLoadSize != null && inRushLoadSize.constructor !== Number) {
            reject(new Error(errors.props.notValidInRushLoadSize(inRushLoadSize)));
        }

        if (loadThreshold != null) {
            if (loadThreshold.constructor !== Object) {
                reject(new Error(errors.props.notValidLoadThreshold(loadThreshold)));
            } else {
                const {top, bottom, ...other} = loadThreshold;

                for (const key of Object.keys(other)) {
                    console.warn(`Unrecognized prop ${key} in loadThreshold for EndlessFeedHandler component. ` +
                        'This key will be ignored.')
                }

                if (top != null && top.constructor !== Number) {
                    reject(new Error(errors.props.notValidTopThreshold(top)));
                } else if (top <= 0) {
                    reject(new Error(errors.props.tooSmallTopThreshold(top)));
                }

                if (bottom != null && bottom.constructor !== Number) {
                    reject(new Error(errors.props.notValidBottomThreshold(bottom)));
                } else if (bottom <= 0) {
                    reject(new Error(errors.props.tooSmallBottomThreshold(bottom)));
                }
            }
        }

        if (postLoadAction != null && postLoadAction.constructor !== Function) {
            reject(new Error(errors.props.notValidPostLoadAction(postLoadAction)));
        }

        resolve();
    }
);

export default propsValidator;