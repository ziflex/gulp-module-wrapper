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

module.exports = {
    parametrize: parametrize
};