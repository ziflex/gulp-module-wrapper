var through = require("through2");
var path = require("path");

function jsHintConfig() {
    return path.join(__dirname, ".jshintrc");
}

function getFixtures (glob) {
    return path.join(__dirname, "fixtures", glob);
}

function getContent (callback) {
    return through.obj(function (file, enc, cb) {
        callback(String(file.contents));
        this.push(file);
        cb();
    });
}

function normalize (str) {
    return str
        .replace(/[\n | \t | \b | \r]/gi, "")
        .replace(/"/gi, "'");
}

module.exports = {
    normalize: normalize,
    getFixtures : getFixtures,
    getContent: getContent,
    getJsHintConfig: jsHintConfig
};