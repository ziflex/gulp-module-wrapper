'use strict';

function parametrize(str) {
    var result = str,
        rx = new RegExp(/^[^a-zA-Z_$]|[^0-9a-zA-Z_$]/gi),
        parts = str.split(rx);

    if (parts.length) {
        result = parts.map(function (part, idx) {
            return idx ? part[0].toUpperCase() + part.substr(1) : part;
        }).join('');
    }

    return result;
}

function isJSON(str) {
    var firstChar = '',
        lastChar = '',
        result = false;

    if (str) {
        if (str.trim()) {
            firstChar = str[0];
            lastChar = str[str.length -1];

            result = (firstChar === '{' || firstChar === '[') &&
            (lastChar === '}' || lastChar === ']');
        }
    }

    return result;
}

function endsWith(str, criteria) {
    var result = false;

    str = str || '';
    criteria = criteria || '';

    if (str && criteria) {
        result = str[str.length - 1] === criteria;
    }

    return result;
}

module.exports = {
    parametrize: parametrize,
    isJSON: isJSON,
    endsWith: endsWith
};