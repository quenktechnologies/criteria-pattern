"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuple = exports.map = exports.filter = void 0;
var record_1 = require("@quenk/noni/lib/data/record");
var either_1 = require("@quenk/noni/lib/data/either");
var future_1 = require("@quenk/noni/lib/control/monad/future");
var array_1 = require("../result/failure/array");
var result_1 = require("../result");
/**
 * filter (async).
 */
exports.filter = function (p) { return function (value) {
    return future_1.parallel(value.map(p))
        .map(function (r) { return r.reduce(filterResults, []); })
        .chain(function (values) { return future_1.pure(result_1.succeed(values)); });
}; };
var filterResults = function (p, c) {
    return (c instanceof either_1.Right) ? p.concat(c.takeRight()) : p;
};
/**
 * map (async).
 */
exports.map = function (p) { return function (value) {
    return future_1.parallel(value.map(p))
        .map(mapReduce)
        .map(mapFinish(value));
}; };
var mapReduce = function (r) {
    return r.reduce(mapReduceFold, [{}, []]);
};
var mapReduceFold = function (_a, curr, idx) {
    var fails = _a[0], succs = _a[1];
    return curr.fold(function (f) {
        var _a;
        return [record_1.merge(fails, (_a = {}, _a[idx] = f, _a)), succs];
    }, function (b) { return [fails, succs.concat(b)]; });
};
var mapFinish = function (value) { return function (_a) {
    var fails = _a[0], succs = _a[1];
    return Object.keys(fails).length > 0 ?
        array_1.fail(fails, value, { value: value }) :
        result_1.succeed(succs);
}; };
/**
 * tuple (async)
 */
exports.tuple = function (list) { return function (value) {
    if (value.length !== list.length)
        return future_1.pure(result_1.fail('tuple', value));
    return future_1.parallel(value.map(function (v, idx) { return list[idx](v); }))
        .chain(function (results) {
        var fails = results.filter(function (v) {
            return v.isLeft();
        }).map(function (e) { return e.takeLeft(); });
        if (fails.length > 0) {
            var failMap = fails.reduce(function (p, c, k) { p[k] = c; return p; }, {});
            return future_1.pure(either_1.left(array_1.ArrayFailure.create(failMap, value, { value: value })));
        }
        return future_1.pure(result_1.succeed(results.map(function (e) { return e.takeRight(); })));
    });
}; };
//# sourceMappingURL=array.js.map