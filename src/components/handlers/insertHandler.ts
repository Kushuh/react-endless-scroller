import {ApiResult, PartialState, State} from '../vars/handler.interfaces';

const insertHandler: (newTuples: Array<ApiResult>, state: State, index?: number) => PartialState =
    (newTuples: Array<ApiResult>, state: State, index?: number) => {
        const {tuples} = state;
        const filteredTuples = newTuples.filter(x => !tuples.find(y => y.key === x.key));
        tuples.splice(index || tuples.length, 0, ...filteredTuples);

        return ({tuples});
    };

export default insertHandler;