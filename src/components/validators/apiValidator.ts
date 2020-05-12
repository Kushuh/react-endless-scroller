import {ApiResults} from '../vars/interfaces';
import errors from '../vars/errors';
import tuplesValidator from "./tuplesValidator";

/**
 * Check if api returned a valid value.
 */
const apiValidator: (a) => Promise<ApiResults> = (apiResults: any) => new Promise(
    async (resolve, reject) => {
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

                if (
                    apiResults.boundaries.start != null &&
                    apiResults.boundaries.end != null &&
                    apiResults.boundaries.start > apiResults.boundaries.end
                ) {
                    reject(new Error(
                        errors.apiResults.startGreaterThanEndBoundary(
                            apiResults.boundaries.start, apiResults.boundaries.end
                        )
                    ));
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
                    await tuplesValidator(apiResults.queryResults, 'api in queryResults').catch(reject);
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

export default apiValidator;