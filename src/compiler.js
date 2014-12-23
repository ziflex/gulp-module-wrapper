var templates = require('./templates/templates');

module.exports = function (options) {
    var template = templates[options.type],
        result = '';

    if (template) {
        result = template({
            data: options.data
        });
    }

    return result;
};