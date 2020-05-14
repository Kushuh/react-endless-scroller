import {PartialState, State} from '../typings/components/handler.typings';
import {ApiResult} from '../typings/externalHandlers/api.typings';

const insertHandler: (newTuples: Array<ApiResult>, state: State, index?: number) => PartialState =
    (newTuples: Array<ApiResult>, state: State, index?: number) => {
        const {tuples} = state;
        const filteredTuples = tuples.filter(x => !newTuples.find(y => y.key === x.key));
        tuples.splice(index || tuples.length, 0, ...filteredTuples);

        return ({tuples});
    };

export default insertHandler;