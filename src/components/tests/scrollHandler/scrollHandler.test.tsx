import {describe, expect, it} from '@jest/globals';
import scrollHandler from '../../handlers/scrollHandler';
import {directions} from '../../vars/defaults';

describe(
    'test scroll handler return',
    () => {
        it('should return null when both flags set to true', () => {
            let result = scrollHandler(
                {flags: {endOfResults: true, beginningOfResults: true}},
                {},
                {
                    target: {
                        scrollTop: 0,
                        scrollHeight: 100,
                        offsetHeight: 100
                    }
                }
            );

            expect(result).toBeNull();

            result = scrollHandler(
                {flags: {endOfResults: true, beginningOfResults: true}},
                {},
                {
                    target: {
                        scrollTop: 0,
                        scrollHeight: 100,
                        offsetHeight: 1000
                    }
                }
            );

            expect(result).toBeNull();

            result = scrollHandler(
                {flags: {endOfResults: true, beginningOfResults: true}},
                {},
                {
                    target: {
                        scrollTop: 1000,
                        scrollHeight: 100,
                        offsetHeight: 1000
                    }
                }
            );

            expect(result).toBeNull();
        });

        it('should return null when not past limits', () => {
            let result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {},
                {
                    target: {
                        scrollTop: 3000,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBeNull();

            result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 800,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBeNull();

            result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 3700,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBeNull();
        });

        it('should return forward instruction when past bottom limit and no endOfResults', () => {
            let result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 3701,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBe(directions.forward);

            result = scrollHandler(
                {flags: {endOfResults: true, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 3701,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBeNull();
        });

        it('should return backward instruction when past top limit and no beginningOfResults', () => {
            let result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 799,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBe(directions.backward);

            result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: true}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 799,
                        scrollHeight: 5000,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBeNull();
        });

        it('should return forward instruction prior to backward instruction', () => {
            let result = scrollHandler(
                {flags: {endOfResults: false, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 0,
                        scrollHeight: 500,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBe(directions.forward);

            result = scrollHandler(
                {flags: {endOfResults: true, beginningOfResults: false}},
                {loadThreshold: {top: 799, bottom: 799}},
                {
                    target: {
                        scrollTop: 0,
                        scrollHeight: 500,
                        offsetHeight: 500
                    }
                }
            );

            expect(result).toBe(directions.backward);
        });
    }
);
