import { Failure } from './Failure';
import { Either } from 'afpl';

export { Failure };

/**
 * Precondition represents some condition that must be satisfied
 * in order for data to be considered a success type.
 *
 * The left type class represents the original type and the
 * right the final one.
 */
export interface Precondition<A, B> {

    (value: A): Result<A, B>;

}

/**
 * Result of a precondition.
 */
export type Result<A, B> = Either<Failure<A>, B>;

/**
 * Context of a failure, used to explain error messages.
 */
export interface Context {

    [key: string]: any

}

/**
 * Explanation of what went wrong with a Precondition.
 */
export type Explanation
    = string
    | object
    ;

/**
 * left wraps a value in the left side of an Either
 */
export const left: <A, B>(a: A) => Either<A, B> = Either.left;

/**
 * right wraps a value in the right side of an Either
 */
export const right: <A, B>(b: B) => Either<A, B> = Either.right;

/**
 * failure produces a new one to one Failure instance wrapped
 * in the left side of an Either.
 */
export const failure = <A, B>(message: string, value: A, ctx: Context = {}) =>
    left<Failure<A>, B>(new Failure(message, value, ctx));

/**
 * success signals a precondition has passed and wraps the latest
 * version of the value in the left side of an Either.
 */
export const success = <A, B>(b: B) => right<Failure<A>, B>(b);

/**
 * set the value to the value specified, no matter what 
 */
export const set = <A, B>(b: B): Precondition<A, B> => (_a: A) => success<A, B>(b);

/**
 * when conditionally applies one of two preconditions depending
 * on the outcome of a test function.
 */
export const when = <A, B>(
    test: (a: A) => boolean,
    applied: Precondition<A, B>,
    otherwise: Precondition<A, B>): Precondition<A, B> =>
    (value: A) => (test(value) === true) ? applied(value) : otherwise(value);

/**
 * whenTrue conditionally applies applied or otherwise depending
 * on whether condition is true or not.
 */
export const whenTrue =
    <A, B>(
        condition: boolean,
        applied: Precondition<A, B>,
        otherwise: Precondition<A, B>): Precondition<A, B> =>
        (value: A) => (condition === true) ? applied(value) : otherwise(value);

/**
 * whenFalse (opposite of whenTrue).
 */
export const whenFalse = <A, B>(
    condition: boolean,
    applied: Precondition<A, B>,
    otherwise: Precondition<A, B>): Precondition<A, B> =>
    (value: A) => (condition === false) ? applied(value) : otherwise(value);

/**
 * equals tests if the value is equal to the value specified (strictly).
 */
export const equals = <A, B>(target: B): Precondition<A, B> =>
    (value: A) => (<any>target === value)  ?
        success<A, B>(target) :
        failure<A, B>('equals', value, { target });

/**
 * notNull requires a value to be specified.
 */
export const notNull = <A>(value: A) =>
    ((value == null) || ((typeof value === 'string') && (value === ''))) ?
        failure('notNull', value) :
        success(value)

/**
 * optional applies the tests given only if the value is != null
 */
export const optional = <A, B>(p: Precondition<A, A | B>)
    : Precondition<A, A | B> =>
    (value: A) =>
        ((value == null) || (typeof value === 'string' && value === '')) ?
            success<A, A>(value) : p(value);

/**
 * or performs the equivalent of a logical 'or' between two preconditions.
 */
export const or =
    <A, B>(left: Precondition<A, B>, right: Precondition<A, B>)
        : Precondition<A, B> =>
        (value: A) => left(value).orElse(() => right(value));

/**
 * and performs the equivalent of a logical 'and' between two preconditions.
 */
export const and =
    <A, B>(l: Precondition<A, A>, r: Precondition<A, B>)
        : Precondition<A, B> =>
        (value: A) => l(value).chain(r);

/**
 * every takes a set of preconditions and attempts to apply each
 * one after the other to the input.
 */
export const every = <A, B>(p: Precondition<A, B>, ...list: Precondition<B, B>[])
    : Precondition<A, B> => (value: A) =>
        p(value)
            .cata<any>(
            f => left(f),
            v => list.reduce((e, f) => e.chain(f), right(v))
            );

/**
 * exists requires the value to be enumerated in the supplied list.
 */
export const exists = <A>(list: A[]): Precondition<A, A> => (value: A) =>
    (list.indexOf(value) < 0) ?
        failure<A, A>('exists', value, {value, list }) :
        success<A, A>(value)

/**
 * unwrap applies a precondition received from a function.
 */
export const unwrap =
    <A, B>(p: () => Precondition<A, B>) => (value: A) => p()(value);