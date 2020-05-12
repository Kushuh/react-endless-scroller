import {State} from '../vars/interfaces';

const removeHandler: (ids, state) => Function = (ids: Array<string>, state: State) => {
    const {tuples} = state;
    const filteredIds = ids.filter(x => tuples.find(y => y.key === x));

    return ({boundaries: {start, end}}) => ({
        tuples: tuples.filter(x => !filteredIds.includes(x.key)),
        boundaries: {
            start,
            end: end - filteredIds.length
        }
    });
};

export default removeHandler;