'use strict';
var templates = require('./templates');
var utils = require('./utils');

function normalize(data) {
    if (data.args && data.args.length) {
        data.args = data.args.map(function (arg) {
            return utils.parametrize(arg);
        });
    }

    return data;
}

module.exports = function (options) {
    var template = templates[options.type],
        result = '';

    if (template) {
        result = template({
            data: normalize(options.data)
        });
    }

    return result;
};