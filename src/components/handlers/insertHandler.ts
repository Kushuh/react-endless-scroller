import {PartialState, State} from '../typings/components/handler.typings';
import {ApiResult} from '../typings/externalHandlers/api.typings';

const insertHandler: (newTuples: Array<ApiResult>, state: State, index?: number) => PartialState =
    (newTuples: Array<ApiResult>, state: State, index?: number) => {
        const {tuples} = state;
        const filteredTuples = tuples.filter(x => !newTuples.find(y => y.key === x.key));
        filteredTuples.splice(index || filteredTuples.length, 0, ...newTuples);

        return ({tuples: filteredTuples});
    };

export default insertHandler;