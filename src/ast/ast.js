'use strict';
var parse = require('./ast-parser');
var transform = require('./ast-transformer');
var compile = require('./../compiler');
var _ = require('lodash');

module.exports = function (content, options) {
    var result;

    // try to update modules
    if (options.type === 'amd') {
        result = parse(content, function (node) {
            transform(node, options);
        }).toString();
    }

    if (content === result) {
        result = compile({
            type: options.type,
            data: _.merge(options, {
                body: content
            })
        });
    }

    return result;
};