'use strict';
var syntax = require('./ast-syntax');
var amd = require('./analyzers/amd');

module.exports = function (node, options) {
    var callee,
        analyzer,
        analyzers = {
            'define' : {
                type: 'amd',
                run: amd
            }
        },
        result;

    if (!node.type || node.type !== syntax.CallExpression) {
        return;
    }

    callee = node.callee;

    if (!callee || callee.type !== syntax.Identifier) {
        return;
    }

    analyzer = analyzers[callee.name];
    if(analyzers && analyzers.hasOwnProperty(callee.name)) {
        result = analyzer.run(node, options);
    }

    return result;
};