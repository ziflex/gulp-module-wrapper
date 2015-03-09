'use strict';
var templates = require('./templates');
var utils = require('./utils');
var parse = require('./ast/ast-parser');
var analyzer = require('./ast/ast-analyzer');
var merge = require('./structure');
var _ = require('lodash');

var DEFAULT_DEPS = ['require', 'exports', 'module'];

function normalize(data) {

    // Remove duplicated default dependencies
    // Fix for ES6 modules transpiler
    _.forEach(DEFAULT_DEPS, function (dep) {
        var found = _.where(data.deps, function (x) {return x === dep; });

        if (found && found.length > 1) {
            var index = data.deps.indexOf(dep);
            data.deps = data.deps.splice(index + 1);
            data.args = data.args.splice(index + 1);
        }
    });

    if (data.args && data.args.length) {
        data.args = data.args.map(function (arg) {
            return utils.parametrize(arg);
        });
    }
    
    return data;
}

function compile(options) {
    var type = options.type ? options.type.toLowerCase() : '',
        template = templates[type],
        result = '';

    if (template) {
        result = template({
            data: normalize(options)
        });
    }

    return result;
}

module.exports = function (content, options) {
    var compiled = [], structures = [];

    // amd: try to optimize 'amd' module.
    if (options.type === 'amd') {
        parse(content, function (node) {
            var structure = analyzer(node, options);

            if (structure) {
                structures.push(structure);
            }
        });
    }

    if (!structures.length) {
        structures.push(merge(options, {body: content}));
    }

    structures.forEach(function (opts) {
        compiled.push(compile(opts));
    });

    return compiled.join('\n');
};