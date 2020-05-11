import {Props, PartialState} from '../vars/interfaces';
import {directions} from '../vars/defaults';

const scrollHandler: (s, p, o) => Record<string, unknown> | null =
    (state: PartialState, props: Props, event: any) => {
        const {flags: {endOfResults, beginningOfResults}} = state;
        const {loadThreshold} = props;
        const {target} = event;

        const threshold = Object.assign({top: 1, bottom: 1}, loadThreshold || {});

        if (
            target.scrollTop >= (target.scrollHeight - target.offsetHeight - threshold.bottom) &&
            !endOfResults
        ) {
            return({loading: true, direction: directions.forward});
            // Top reached
        } else if (target.scrollTop <= threshold.top && !beginningOfResults) {
            return({loading: true, direction: directions.backward});
        } else {
            return null;
        }
    };

export default scrollHandler;