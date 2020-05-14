import {PartialProps, PartialState} from '../vars/handler.interfaces';
import {directions} from '../vars/defaults';

const scrollHandler: (state: PartialState, props: PartialProps, event: any) => string | null =
    (state: PartialState, props: PartialProps, event: any) => {
        const {flags: {endOfResults, beginningOfResults}} = state;
        const {loadThreshold} = props;
        const {target} = event;

        const threshold = Object.assign({top: 1, bottom: 1}, loadThreshold || {});

        if (
            target.scrollTop >= (target.scrollHeight - target.offsetHeight - threshold.bottom) &&
            !endOfResults
        ) {
            return directions.forward;
        } else if (target.scrollTop <= threshold.top && !beginningOfResults) {
            return directions.backward;
        } else {
            return null;
        }
    };

export default scrollHandler;