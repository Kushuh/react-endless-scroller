import {ApiResults, Boundaries, PartialState, Props, State} from '../vars/interfaces';
import {defaultProps, directions} from '../vars/defaults';
import errors from '../vars/errors';

/**
 * Check if api returned a valid value.
 */
const checkApiReturn: (a) => Promise<ApiResults> = (apiResults: any) => new Promise(
    (resolve, reject) => {
        if (apiResults == null) {
            reject(new Error(errors.apiResults.noResults));
        } else if (apiResults.constructor !== Object) {
            reject(new Error(errors.apiResults.notValidResult(apiResults)));
        } else {
            if (apiResults.boundaries == null) {
                reject(new Error(errors.apiResults.noBoundaries));
            } else if (apiResults.boundaries.constructor !== Object) {
                reject(new Error(errors.apiResults.notValidBoundaries(apiResults.boundaries)));
            } else {
                if (apiResults.boundaries.start == null) {
                    reject(new Error(errors.apiResults.noStartBoundary));
                } else if (apiResults.boundaries.start.constructor !== Number) {
                    reject(new Error(errors.apiResults.notValidStartBoundary(apiResults.boundaries.start)));
                }

                if (apiResults.boundaries.end == null) {
                    reject(new Error(errors.apiResults.noEndBoundary));
                } else if (apiResults.boundaries.end.constructor !== Number) {
                    reject(new Error(errors.apiResults.notValidEndBoundary(apiResults.boundaries.end)));
                }
            }

            if (apiResults.flags == null) {
                reject(new Error(errors.apiResults.noFlags));
            } else if (apiResults.flags.constructor !== Object) {
                reject(new Error(errors.apiResults.notValidFlags(apiResults.flags)));
            } else {
                if (apiResults.flags.endOfResults == null) {
                    reject(new Error(errors.apiResults.noEndOfResultsFlag));
                } else if (apiResults.flags.endOfResults.constructor !== Boolean) {
                    reject(new Error(errors.apiResults.notValidEndOfResultsFlag(apiResults.flags.endOfResults)));
                }
            }

            if (apiResults.queryResults != null) {
                if (apiResults.queryResults.constructor !== Array) {
                    reject(new Error(errors.apiResults.notValidQueryResults(apiResults.queryResults)));
                } else {
                    /**
                     * Each tuple should be an Object that contains an unique key attribute.
                     */
                    for (const tuple of apiResults.queryResults) {
                        if (tuple != null && tuple.constructor !== Object) {
                            reject(new Error(errors.apiResults.notValidTuple(tuple)));
                            break;
                        } else if (tuple != null && tuple.key == null) {
                            reject(new Error(errors.apiResults.noTupleKey));
                            break;
                        }
                    }
                }
            } else {
                /**
                 * Assign default value to query results, since some api return null as empty arrays.
                 */
                apiResults.queryResults = [];
            }
        }

        resolve(apiResults);
    }
);

/**
 * Load a part of dataset from api.
 *
 * @param {string} direction
 * @param {State} state
 * @param {Props} props
 */
const loadPacketHandler: (direction, state, props) => Promise<PartialState> =
    (direction: string, state: State, props: Props) => new Promise(
        (resolve, reject) => {
            let {packetSize, loadSize, inRushLoad, inRushLoadSize} = props;
            const {api, bypassLoadSize} = props;

            /**
             * For an easier declaration, packetSize and loadSize are not required, and have default values. Note
             * loadSize will be assigned a default value event though the bypassLoadSize flag is set to true. It will
             * be ignored afterwards.
             */
            packetSize = packetSize == null ? defaultProps.packetSize : packetSize;
            loadSize = loadSize == null ? packetSize * 4 : loadSize;

            /**
             * Minimum sizes are required for the component to work.
             */
            if (packetSize < defaultProps.minPacketSize) {
                reject(new Error(errors.packetSize.tooSmall(packetSize)));
            }

            if (loadSize < defaultProps.minLoadSize && !bypassLoadSize) {
                reject(new Error(errors.loadSize.tooSmall(loadSize)));
            }

            /**
             * Always enforce a little overlapping between loads.
             */
            if (loadSize < Math.ceil(1.5 * packetSize)) {
                reject(new Error(errors.loadSize.noLessThanPacketSize(loadSize, packetSize)));
            }

            inRushLoad = inRushLoad == null ? true : inRushLoad;
            inRushLoadSize = inRushLoadSize == null ? Math.floor(loadSize / 2) : inRushLoadSize;

            if (inRushLoadSize < defaultProps.minInRushLoadSize) {
                reject(new Error(errors.inRushLoadSize.tooSmall(inRushLoadSize)));
            }

            /**
             * No need for validation since it has already been done.
             */
            const {queryParams, boundaries, results, flags} = state;
            /**
             * If inRushLoad flag is set, first load can load a specific amount of data.
             */
            const adaptivePacketSize = inRushLoad && (results.length < inRushLoadSize) ? inRushLoadSize : packetSize;

            /**
             * Always load from start to end. Backward loading means we want a forward load starting at most packetSize
             * results before current low limit.
             */
            const startPoint = direction === directions.forward ? boundaries.end : boundaries.start - adaptivePacketSize;

            /**
             * Call to api then parse results.
             */
            api(
                {
                    ...(queryParams || {}),
                    start: startPoint,
                    end: startPoint + adaptivePacketSize
                }
            )
                .then(
                    unknownResults => checkApiReturn(unknownResults).catch(error => {
                        reject(error);
                        return Promise.reject();
                    })
                )
                .then(
                    apiResults => {
                        const {queryResults} = apiResults;

                        /**
                         * If database gets updated between fetches, some results can appear multiple times. Each result
                         * is identified by an unique key attribute, so if the same key appears twice, it gets removed
                         * from the new set.
                         */
                        const preFilteredResults = queryResults.filter(x => !results.find(y => y.key === x.key));

                        /**
                         * Merge new results to previous one, and crop to fit loadSize if set.
                         */
                        let mergedContent = direction === directions.forward ?
                            [...results, ...preFilteredResults] :
                            [...preFilteredResults, ...results];

                        let overlapSize = mergedContent.length - loadSize;
                        overlapSize =  overlapSize >= 0 ? overlapSize : 0;
                        const isMergedContentOverlapping = !bypassLoadSize && overlapSize > 0;

                        if (!bypassLoadSize) {
                            mergedContent = direction === directions.forward ?
                                mergedContent.slice(-loadSize) :
                                mergedContent.slice(0, loadSize);
                        }

                        /**
                         * Compute new boundaries. As fetch only retrieves one size of the set, only one of the return
                         * boundary is accurate. Example is that a forward load will only update the end limit, not
                         * the start one.
                         *
                         * The limit that doesn't get returned by fetch still has to be checked, as it can be updated
                         * when content overloads the loadSize limit. For example, if a forward request is called on
                         * a loaded dataset that already matches the loadSize limit: after the fetch, the loaded content
                         * will have a size of loadSize + packetSize. This will remove the first packetSize results, thus
                         * translate the start limit from +packetSize.
                         */
                        let newStart = boundaries.start;
                        if (!bypassLoadSize) {
                            if (direction === directions.forward && mergedContent.length > adaptivePacketSize) {
                                newStart = boundaries.start + overlapSize;
                            } else {
                                newStart = apiResults.boundaries.start;
                            }
                        } else if (direction === directions.backward || mergedContent.length <= adaptivePacketSize) {
                            newStart = apiResults.boundaries.start;
                        }

                        let newEnd = boundaries.end;
                        if (!bypassLoadSize) {
                            if (direction === directions.backward && mergedContent.length > adaptivePacketSize) {
                                newEnd = boundaries.end - overlapSize;
                            } else {
                                newEnd = apiResults.boundaries.end;
                            }
                        } else if (direction === directions.forward || mergedContent.length <= adaptivePacketSize) {
                            newEnd = apiResults.boundaries.end;
                        }

                        const newBoundaries: Boundaries = {start: newStart, end: newEnd};

                        /**
                         * On forward fetch we trust the api to tell us if we reach the end of dataset. Otherwise, four
                         * scenarios can occur :
                         *
                         * (1 & 2) No results where returned. It can either occur because both start and end points
                         * were < 0 (in which case we have no way to tell if the dataset contain any result), or > 0. In
                         * this last scenario, it means we requested past the dataset limit. We can thus set the
                         * endOfResults flag to true/
                         *
                         * (3 & 4) Results where returned. If an overlap happened on backward mode, then the limit is not
                         * reached anymore. Otherwise, we keep the last endOfResults value, since end boundary didn't
                         * changed.
                         */
                        let isEndOfResult = flags.endOfResults;
                        if (direction === directions.forward) {
                            isEndOfResult = apiResults.flags.endOfResults;
                        } else if (mergedContent.length === 0) {
                            isEndOfResult = startPoint + adaptivePacketSize > 0;
                        } else if (isMergedContentOverlapping) {
                            isEndOfResult = false;
                        }

                        const isBeginningOfResult = newBoundaries.start === 0;

                        resolve({
                            launched: true,
                            loading: false,
                            error: null,
                            results: mergedContent,
                            flags: {
                                endOfResults: isEndOfResult,
                                beginningOfResults: isBeginningOfResult
                            },
                            boundaries: newBoundaries,
                            apiResults
                        });
                    }
                )
                .catch(error => reject(error));
        }
    );

export default loadPacketHandler;