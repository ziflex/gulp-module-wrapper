var fs = require('fs');
var through = require('through2');
var should = require('should');
var path = require('path');
var assert = require('stream-assert');
var gulp = require('gulp');
require('mocha');

var wrapper = require('../');
var compile = require('../src/compiler');

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
    it('should process single plain script', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("plain-script-1",["require","exports","module"],function(require,exports,module){ return console.log("plain-script-1"); });');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single plain script with exports', function (done) {
        var src = fixtures('./plain-script-2.js');
        var original = '';
        var options = {
            exports: 'name'
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("plain-script-2",["require","exports","module"],function (require,exports,module) {var name = "plain-script-2"; console.log(name); return name;});');

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
                var expected = normalize('define("anon-module-1",["require","exports","module"],function (require,exports,module) {return console.log("anon-module-1");});');

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
                var expected = normalize('define("named-module-1",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with root option', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        var options = {
            root: 'tests'
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("fixtures/named-module-1",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with name option', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        var options = {
            name: 'my-custom-module-name'
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("my-custom-module-name",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with global dependencies', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        var options = {
            deps: ['dep1', 'dep2'],
            args: ['args1', 'args2']
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module","dep1", "dep2"],function (require,exports,module,args1,args2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with custom dependencies', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        var options = {
            deps: ['dep1'],
            'named-module-1.js' : {
                deps: ['dep1', 'dep2']
            }
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module","dep1", "dep2"],function (require,exports,module,dep1,dep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with normalized arguments', function (done) {
        var src = fixtures('./named-module-1.js');
        var original = '';
        var options = {
            deps: ['path/to/dep1', 'path/to/dep2']
        };
        gulp.src(src)
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module","path/to/dep1", "path/to/dep2"],function (require,exports,module,pathToDep1,pathToDep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });
});