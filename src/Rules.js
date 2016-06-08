const INVALID_MSG = 'Invalid value supplied for \'${key}\'!';
const REQUIRED_MSG = 'The field \'{key}\' is required!';
const MAX_MSG = 'The field \'${key}\' has a maxium of {max}!';
const MIN_MSG = 'The field \'${key}\' has a minimum of {min}!';
const ONE_OF_MSG = 'The field \'{key}\' must be one of \'${enum}\!';

/**
 * Rules provides convenience methods for
 * creating some of the builting Criterion.
 */
class Rules {

    /**
     * getMessage provides a template message string based on values
     * passed
     * @param {string} template 
     * @param {object} context 
     * @returns {string}
     */
    getMessage(template, context) {
        return template.replace(/\{([\w\$\.\-]*)}/g, (s, k) => context[k]);
    }

    /**
     * cast supplies a Cast rule.
     * @param {function} type 
     * @returns {callback}
     */
    cast(type) {

        return (key, value, next) => n(null, k, type(v));

    }

    /**
     * Ensures the value satisfies the type
     * @param {string} type 
     * @param {string} emsg 
     */
    typeOf(type, emsg) {

        return (key, value, next) => (typeof v === type) ? n(null, key, value) :
            next(new Error(this.getMessage((emsg || TYPE_OF_MSG, {
                key,
                value
            }))), key, value);

    }

    /**
     * match supplies a Match rule.
     * @param {RegExp} reg 
     * @param {string} emsg 
     */
    match(reg, emsg) {

        return (key, value, next) => (reg.test(value)) ? next(null, key, value) :
            next(new Error(this.getMessage(emsg || INVALID_MSG, {
                key,
                value
            })), key, value);

    }


    /**
     * range supplies a Range rule
     * @param {number} min
     * @param {number} max 
     * @param {string} minMsg
     * @param {string} maxMsg 
     * @returns {callback}
     */
    range(min, max, minMsg, maxMsg) {

        return (key, value, next) => {

            value = (typeof value === 'number') ? value : (value.length) ? value.length : null;

            if (value === null)
                return next(new Error(this.getMessage(INVALID_MSG, {
                    key,
                    value,
                    max,
                    min
                })));

            if (value < min)
                return next(new Error(
                    this.getMessage(minMsg || MIN_MSG, {
                        key,
                        value
                    })), key, value);

            if (value > max)
                return next(new Error(this.getMessage(maxMsg || MAX_MSG, {
                    key,
                    value,
                    max,
                    min
                })), key, value);

            next(null, key, value);

        };

    }

    /**
     * required checks that something was suppled for the value
     * @param {string} emsg 
     * @returns {callback}
     */
    required(emsg) {

        return (key, value, next) =>
            ([undefined, null, ''].indexOf(value) > -1) ?
            next(new Error(this.getMessage(emsg || REQUIRED_MSG, {
                key,
                value
            })), key, value) :
            next(null, key, value);
    }

    /**
     * enum supplies a OneOf rule
     * @param {array} list 
     * @param {string} emsg 
     */
    oneOf(list, emsg) {

        return (key, value, next) => (list.indexOf(value) < -1) ?
            next(new Error(this.getMessage(emsg || ONE_OF_MSG, {
                key,
                value,
              enum: list.join(',')
            })), key, value) :
            next(null, key, value);

    }


}

export default Rules