var fs = require('fs');
var through = require('through2');
var should = require('should');
var path = require('path');
var assert = require('stream-assert');
var gulp = require('gulp');
var mocha = require('mocha');

var wrapper = require('../');
var compile = require('../src/compiler');
var parser = require('../src/ast/ast-parser');
var amd = require('../src/ast/analyzers/amd');

function fixtures (glob) {
    return path.join(__dirname, 'fixtures', glob);
}

function content (callback) {
    return through.obj(function (file, enc, cb) {
        callback(String(file.contents));
        this.push(file);
        cb();
    });
}

function normalize (str) {
    return str
        .replace(/[\n | \t | \b | \r]/gi, '')
        .replace(/"/gi, "'");
}

describe('compiler', function () {
    it('should compile using "amd" template', function () {
        var options = {
            type: 'amd',
            data: {
                factory: {
                    body: ''
                }
            }
        };
        compile(options).should.not.eql('');
    });
});

describe('wrapper', function () {
    it('should wrap single plain script', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("plain-script",["require","exports","module"],function(require,exports,module){ var name = "plain-script"; console.log(name); });');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single anonymous module', function (done) {
        var src = fixtures('./anon-module-1.js');
        var original = '';
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("anon-module-1",["require","exports","module"],function (require,exports,module) {var name = "test-module";console.log(name);});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single named module', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module"],function (require,exports,module) {var name = "test-module";console.log(name);});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    //it('should wrap single plain script with global settings', function (done) {
    //    var original = '';
    //    gulp.src(fixtures('./plain-script.js'))
    //        .pipe(content(function (result) {
    //            original = result;
    //        }))
    //        .pipe(wrapper({
    //            deps: ['dep-1', 'dep-2', 'dep-3'],
    //            args: ['dep1', 'dep2', 'dep3']
    //        }))
    //        .pipe(assert.first(function (d) {
    //            var result = normalize(d.contents.toString());
    //            var expected = normalize('define("plain-script",["require","exports","module","dep-1", "dep-2", "dep-3"],function(require,exports,module,dep1, dep2, dep3){ var name = "plain-script"; console.log(name); });');
    //
    //            should.equal(result, expected);
    //        }))
    //        .pipe(assert.end(done));
    //});
    //
    //
    //it('should wrap single anonymous module with dependency injection', function (done) {
    //    var src = fixtures('./anon-module-1.js');
    //    var original = '';
    //    gulp.src(src)
    //        .pipe(content(function (result) {
    //            original = result;
    //        }))
    //        .pipe(wrapper({
    //            'anon-module-1.js' : {
    //                deps: ['dep1', 'dep2', 'dep3']
    //            }
    //        }))
    //        .pipe(assert.first(function (d) {
    //            var result = normalize(d.contents.toString());
    //            var expected = normalize('define("anon-module-1",["dep1","dep2","dep3"],function (dep1,dep2,dep3) {var name = "test-module";console.log(name);});');
    //
    //            should.equal(result, expected);
    //        }))
    //        .pipe(assert.end(done));
    //});
    //
    //it('should optimization single anonymous module using dependencies', function (done) {
    //    var src = fixtures('./anon-module-2.js');
    //    var original = '';
    //    gulp.src(src)
    //        .pipe(content(function (result) {
    //            original = result;
    //        }))
    //        .pipe(wrapper())
    //        .pipe(assert.first(function (d) {
    //            var result = normalize(d.contents.toString());
    //            var expected = normalize('define("anon-module-2",["dep1","dep2"],function (dep1,dep2) {var name = "test-module";console.log(name);});');
    //
    //            should.equal(result, expected);
    //        }))
    //        .pipe(assert.end(done));
    //});
    //
    //it('should optimization single anonymous module using arguments', function (done) {
    //    var src = fixtures('./anon-module-2.js');
    //    var original = '';
    //    gulp.src(src)
    //        .pipe(content(function (result) {
    //            original = result;
    //        }))
    //        .pipe(wrapper())
    //        .pipe(assert.first(function (d) {
    //            var result = normalize(d.contents.toString());
    //            var expected = normalize('define("anon-module-3",["dep1","dep2"],function (dep1,dep2) {var name = "test-module";console.log(name);});');
    //
    //            should.equal(result, expected);
    //        }))
    //        .pipe(assert.end(done));
    //});
});