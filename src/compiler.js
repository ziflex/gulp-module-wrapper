'use strict';
var templates = require('./templates');
var utils = require('./utils');
var parse = require('./ast/ast-parser');
var analyzer = require('./ast/ast-analyzer');
var merge = require('./structure');

function normalize(data) {
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