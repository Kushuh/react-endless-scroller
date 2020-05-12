import {ApiResult, PartialState, State} from '../vars/handler.interfaces';

const insertHandler: (newTuples, state, index) => PartialState =
    (newTuples: Array<ApiResult>, state: State, index: number) => {
        const {tuples} = state;
        const filteredTuples = newTuples.filter(x => !tuples.find(y => y.key === x.key));
        tuples.splice(index, 0, ...filteredTuples);

        return ({tuples});
    };

export default insertHandler;