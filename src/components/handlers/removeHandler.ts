import {State} from '../vars/interfaces';

const removeHandler: (ids, state) => Function = (ids: Array<string>, state: State) => {
    const {results} = state;
    const filteredIds = ids.filter(x => results.find(y => y.key === x));

    return ({boundaries: {start, end}}) => ({
        results: results.filter(x => !filteredIds.includes(x.key)),
        boundaries: {
            start,
            end: end - filteredIds.length
        }
    });
};

export default removeHandler;