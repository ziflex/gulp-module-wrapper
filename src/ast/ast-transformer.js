'use strict';
var syntax = require('./ast-syntax');
var amd = require('./analyzers/amd');
var compile = require('./../compiler');

module.exports = function (node, options) {
    var callee,
        analyzer,
        analyzers = {
            'define' : {
                type: 'amd',
                run: amd
            }
        },
        structure;

    if (!node.type || node.type !== syntax.CallExpression) {
        return;
    }

    callee = node.callee;

    if (!callee || callee.type !== syntax.Identifier) {
        return;
    }

    analyzer = analyzers[callee.name];
    if(analyzers && analyzers.hasOwnProperty(callee.name)) {
        structure = analyzer.run(node, options);

        if (structure) {
            node.update(compile({
                type: analyzer.type,
                data: structure
            }));
        }
    }
};