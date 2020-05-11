import {ApiResult, PartialState, State} from '../vars/interfaces';

const insertHandler: (tuples, state, index) => PartialState =
    (tuples: Array<ApiResult>, state: State, index: number) => {
        const {results} = state;
        const filteredTuples = tuples.filter(x => !results.find(y => y.key === x.key));
        results.splice(index, 0, ...filteredTuples);

        return ({results});
    };

export default insertHandler;