'use strict';
module.exports = function (options, structure) {
    var result = {};

    result.name = options.name || structure.name;
    result.deps = (options.deps || []).concat(structure.deps || []);
    result.args = (options.args || []).concat(structure.args || []);
    result.body = structure.body;
    result.exports = structure.exports  ? false : options.exports;

    if (result.deps.length > result.args.length) {
        result.args = result.args.concat(result.deps.slice(result.args.length));
    }

    return result;
};