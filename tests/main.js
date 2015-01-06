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

describe('amd', function () {

    it('should process single plain script', function (done) {
        gulp.src(fixtures('./plain-script-1.js'))
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
        var options = {
            exports: 'name'
        };
        gulp.src(src)
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
        gulp.src(src)
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
        gulp.src(src)
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
        var options = {
            root: 'tests'
        };
        gulp.src(src)
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
        var options = {
            name: 'my-custom-module-name'
        };
        gulp.src(src)
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
        var options = {
            deps: ['dep1', 'dep2'],
            args: ['args1', 'args2']
        };
        gulp.src(src)
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
        var options = {
            deps: ['dep1'],
            'named-module-1.js' : {
                deps: ['dep1', 'dep2']
            }
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module","dep1", "dep2"],function (require,exports,module,dep1,dep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process plain script with single custom dependency', function (done) {
        var src = fixtures('./plain-script-2.js');
        var options = {
            'plain-script-2.js' : {
                name: 'plain-script-2',
                deps: ['dep'],
                exports: 'name'
            }
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("plain-script-2",["require","exports","module","dep"],function (require,exports,module,dep) {var name = "plain-script-2"; console.log(name); return name;});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with normalized arguments', function (done) {
        var src = fixtures('./named-module-1.js');
        var options = {
            deps: ['path/to/dep1', 'path/to/dep2']
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-1",["require","exports","module","path/to/dep1", "path/to/dep2"],function (require,exports,module,pathToDep1,pathToDep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single named module with native return value', function (done) {
        var src = fixtures('./named-module-4.js');

        gulp.src(src)
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize('define("named-module-4",["require","exports","module"],function (require,exports,module) {var name = "named-module-4"; return name;});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });
});

describe('umd', function () {
    it('should wrap with default settings', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper({
                type: 'umd'
            }))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize(compile({
                    type: 'umd',
                    data: {
                        name: 'plain-script-1',
                        deps: ['require', 'exports', 'module'],
                        args: ['require', 'exports', 'module'],
                        body: original
                    }
                }));

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper({
                type: 'umd',
                name: 'umd-module'
            }))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize(compile({
                    type: 'umd',
                    data: {
                        name: 'umd-module',
                        deps: ['require', 'exports', 'module'],
                        args: ['require', 'exports', 'module'],
                        body: original
                    }
                }));

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name and dependencies', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper({
                type: 'umd',
                name: 'umd-module',
                deps: ['dep1', 'dep2']
            }))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize(compile({
                    type: 'umd',
                    data: {
                        name: 'umd-module',
                        deps: ['require', 'exports', 'module', 'dep1', 'dep2'],
                        args: ['require', 'exports', 'module', 'dep1', 'dep2'],
                        body: original
                    }
                }));

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name, dependencies and overridden arguments', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper({
                type: 'umd',
                name: 'umd-module',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo']
            }))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize(compile({
                    type: 'umd',
                    data: {
                        name: 'umd-module',
                        deps: ['require', 'exports', 'module', 'dep1', 'dep2'],
                        args: ['require', 'exports', 'module', 'depOne', 'depTwo'],
                        body: original
                    }
                }));

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name, dependencies, overridden arguments and custom reutrn', function (done) {
        var original = '';
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper({
                type: 'umd',
                name: 'umd-module',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo'],
                exports: '"hello world!";'
            }))
            .pipe(assert.first(function (d) {
                var result = normalize(d.contents.toString());
                var expected = normalize(compile({
                    type: 'umd',
                    data: {
                        name: 'umd-module',
                        deps: ['require', 'exports', 'module', 'dep1', 'dep2'],
                        args: ['require', 'exports', 'module', 'depOne', 'depTwo'],
                        body: original,
                        exports: '"hello world!";'
                    }
                }));

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });
});