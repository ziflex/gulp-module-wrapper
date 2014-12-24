'use strict';
var parse = require('./ast-parser');
var transform = require('./ast-transformer');
var compile = require('./../compiler');
var _ = require('lodash');

module.exports = function (content, options) {
    var result;

    // try to update modules
    result = parse(content, function (node) {
        transform(node, options);
    }).toString();

    // for plain scripts
    if (content === result) {
        result = compile({
            type: 'amd',
            data: _.merge(options, {
                body: content
            })
        });
    }

    return result;
};