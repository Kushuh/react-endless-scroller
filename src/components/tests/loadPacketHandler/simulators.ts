import {ApiParams, ApiResult, ApiResults} from '../../vars/handler.interfaces';
import errors from '../../vars/errors';

const dataset: Array<ApiResult | null> = [];
for (let i = 0; i < 1000; i++) {
    dataset.push({
        index: i,
        key: `element-${i}`
    });
}

const simulator: (mode, dts) => (params) => Promise<ApiResults> = (mode: number, dts: Array<ApiResult>) => {
    const fakeApi: (params) => Promise<ApiResults> = (params: ApiParams) => new Promise(
        (resolve, reject) => {
            switch (mode) {
                case 0:
                    const cappedEnd = params.end >= 0 ? params.end : 0;
                    const newStart = params.start >= 0 ? params.start : 0;
                    const newEnd = newStart + dts.slice(newStart, cappedEnd).length;
                    resolve({
                        queryResults: dts.slice(newStart, cappedEnd),
                        flags: {endOfResults: newEnd >= dts.length},
                        boundaries: {
                            start: newStart,
                            end: newEnd
                        }
                    });
                    break;
                case 1:
                    reject(new Error());
                    break;
                default:
                    /**
                     * Purposely simulate an erroneous response
                     */
                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    // @ts-ignore
                    resolve({foo: 'bar'});
                    break;
            }
        }
    );

    return fakeApi;
};

export {dataset, simulator};