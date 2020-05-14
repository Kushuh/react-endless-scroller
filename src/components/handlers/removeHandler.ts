import {State} from '../typings/components/handler.typings';

const removeHandler: (ids: Array<string>, state: State) => Function = (ids: Array<string>, state: State) => {
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