var _ = require("lodash");
var templates = {};
templates["amd"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += 'define(' +
((__t = ( data.name ? JSON.stringify(data.name) + ',' : '' )) == null ? '' : __t) +
'' +
((__t = ( data.deps ? JSON.stringify(data.deps) + ',' : '[],' )) == null ? '' : __t) +
'function(' +
((__t = ( (!data.args ? [] : data.args.join(',')).toString() )) == null ? '' : __t) +
'){\r\n';
 if(data.exports){ ;
__p += '\r\n' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\nreturn ' +
((__t = ( data.exports )) == null ? '' : __t) +
';\r\n';
 } else if(data.exports === false) { ;
__p += '\r\n' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\n';
 } else {;
__p += '\r\nreturn ' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\n';
 } ;
__p += '\r\n});';

}
return __p
};
templates["umd"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '(function (root, factory) {\r\n    if (typeof define === \'function\' && define.amd) {\r\n        define(' +
((__t = ( data.name ? JSON.stringify(data.name) + ',' : '' )) == null ? '' : __t) +
'' +
((__t = ( data.deps ? JSON.stringify(data.deps) : '[]' )) == null ? '' : __t) +
', factory);\r\n    } else if (typeof exports === \'object\') {\r\n        var resolved = [];\r\n        var required = ' +
((__t = ( data.deps ? JSON.stringify(data.deps) : '[]' )) == null ? '' : __t) +
';\r\n\r\n        for (var i = 0; i < required.length; i += 1) {\r\n            resolved.push(require(required[i]));\r\n        }\r\n\r\n        module.exports = factory.apply({}, resolved);\r\n    } else {\r\n        var resolved = [];\r\n        var required = ' +
((__t = ( data.deps ? JSON.stringify(data.deps) : '[]' )) == null ? '' : __t) +
';\r\n\r\n        for (var i = 0; i < required.length; i += 1) {\r\n            resolved.push(root[required[i]]);\r\n        }\r\n\r\n        root.' +
((__t = ( data.name )) == null ? '' : __t) +
' = factory.apply({}, resolved);\r\n    }\r\n}(this, function (' +
((__t = ( (!data.args ? [] : data.args.join(',')).toString() )) == null ? '' : __t) +
') {\r\n    ';
 if(data.exports){ ;
__p += '\r\n    ' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\n    return ' +
((__t = ( data.exports )) == null ? '' : __t) +
';\r\n    ';
 } else { ;
__p += '\r\n    return ' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\n    ';
 } ;
__p += '\r\n}));';

}
return __p
};
module.exports = templates;