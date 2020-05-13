import errors from "../vars/errors";

const tuplesValidator: (t, o) => Promise<any> = (tuples: Array<any>, origin: string) => new Promise(
    (resolve, reject) => {
        /**
         * Each tuple should be an Object that contains an unique key attribute.
         */
        for (const tuple of tuples) {
            if (tuple == null || tuple.constructor.name !== 'Object') {
                reject(new Error(errors.apiResults.notValidTuple(tuple, origin)));
                break;
            } else if (tuple.key == null) {
                reject(new Error(errors.apiResults.noTupleKey));
                break;
            }
        }

        resolve();
    }
);

export default tuplesValidator;