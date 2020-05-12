import {Boundaries, PartialState, Props, State} from '../vars/interfaces';
import {defaultProps, directions} from '../vars/defaults';
import errors from '../vars/errors';

let apiValidator;
const isDevENV = !process.env.NODE_ENV || process.env.NODE_ENV !== 'production';

if (isDevENV) {
    apiValidator = import('../validators/apiValidator');
}

/**
 * Load a part of dataset from api.
 *
 * @param {string} direction
 * @param {State} state
 * @param {Props} props
 */
const loadPacketHandler: (direction, state, props) => Promise<PartialState> =
    (direction: string, state: State, props: Props) => new Promise(
        async (resolve, reject) => {
            let {queryParams, packetSize, loadSize, inRushLoad, inRushLoadSize} = props;
            const {api, bypassLoadSize} = props;

            /**
             * For an easier declaration, packetSize and loadSize are not required, and have default values. Note
             * loadSize will be assigned a default value event though the bypassLoadSize flag is set to true. It will
             * be ignored afterwards.
             */
            packetSize = packetSize == null ? defaultProps.packetSize : packetSize;
            loadSize = loadSize == null ? packetSize * 4 : loadSize;

            /**
             * Minimum sizes are required for the components to work.
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
            const {boundaries, tuples, flags} = state;
            /**
             * If inRushLoad flag is set, first load can load a specific amount of data.
             */
            const adaptivePacketSize = inRushLoad && (tuples.length < inRushLoadSize) ? inRushLoadSize : packetSize;

            /**
             * Always load from start to end. Backward loading means we want a forward load starting at most packetSize
             * results before current low limit.
             */
            const startPoint = direction === directions.forward ? boundaries.end : boundaries.start - adaptivePacketSize;

            /**
             * Call to api then parse results.
             */
            try {
                const apiResults = await api({
                    start: startPoint,
                    end: startPoint + adaptivePacketSize,
                    ...(queryParams || {})
                });

                if (isDevENV) {
                    await apiValidator.then(({default: validator}) => validator(apiResults)).catch(reject);
                }

                const {queryResults} = apiResults;

                /**
                 * If database gets updated between fetches, some results can appear multiple times. Each result
                 * is identified by an unique key attribute, so if the same key appears twice, it gets removed
                 * from the new set.
                 */
                const preFilteredResults = queryResults.filter(x => !tuples.find(y => y.key === x.key));

                /**
                 * Merge new results to previous one, and crop to fit loadSize if set.
                 */
                let mergedContent = direction === directions.forward ?
                    [...tuples, ...preFilteredResults] :
                    [...preFilteredResults, ...tuples];

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
                    tuples: mergedContent,
                    flags: {
                        endOfResults: isEndOfResult,
                        beginningOfResults: isBeginningOfResult
                    },
                    boundaries: newBoundaries,
                    apiResults
                });
            } catch (error) {
                reject(error);
            }
        }
    );

export default loadPacketHandler;