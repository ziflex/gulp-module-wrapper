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
 } else { ;
__p += '\r\n' +
((__t = ( data.body )) == null ? '' : __t) +
'\r\n';
 } ;
__p += '\r\n});';

}
return __p
};
module.exports = templates;