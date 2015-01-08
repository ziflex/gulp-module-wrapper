var through = require('through2');
var should = require('should');
var path = require('path');
var assert = require('stream-assert');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
require('mocha');

var wrapper = require('../');
var compile = require('../src/compiler');

function jsHintConfig() {
    return path.join(__dirname, '.jshintrc');
}

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
                body: ''
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

    it('should not have syntax errors', function (done) {
        var options = {
            type: 'commonjs',
            name: 'customName',
            deps: ['dep1', 'dep2'],
            args: ['depOne', 'depTwo'],
            exports: 'testModule'
        };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(wrapper(options))
            .pipe(jshint(jsHintConfig()))
            .pipe(jshint.reporter(jshintStylish))
            .pipe(jshint.reporter('fail'))
            .pipe(assert.first(function (d) {
                d.jshint.success.should.be.eql(true);
            }))
            .pipe(assert.end(done));
    });
});

describe('umd', function () {
    function mock(options, content) {
        var name = options.name ? options.name :'';
        var deps = options.deps ? JSON.stringify(options.deps) : '[]';
        var args = (options.args ? options.args.join(',') : []).toString();
        var exports = options.exports ? 'return ' + options.exports + ';' : '';
        content = exports ? content : 'return ' + content;

        var result = '(function (root, factory) {';
        result += 'var resolved = [], required = '+deps+', i, len = required.length;';
        result += 'if (typeof define === "function" && define.amd) {';
        result += 'define("'+(name ? name : '') +'" ' + (name ? ',' : '') + ' '+deps+', factory);';
        result += '    } else if (typeof exports === "object") {';
        result += 'for (i = 0; i < len; i += 1) {';
        result += 'resolved.push(require(required[i]));';
        result += '}';
        result += 'module.exports = factory.apply({}, resolved);';
        result += '} else {';
        result += 'for (i = 0; i < len; i += 1) {';
        result += 'resolved.push(root[required[i]]);';
        result += '}';
        result += 'root["' + name + '"] = factory.apply({}, resolved);';
        result += '}';
        result += '}(this, function (' + args + ') {';
        result += content;
        result += exports;
        result += '}));';

        return result;
    }

    it('should wrap with default settings', function (done) {
        var original = '',
            options = {
                type: 'umd'
            };

        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-1';
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name', function (done) {
        var original = '',
            options = {
                type: 'umd',
                name: 'umd-module'
            };
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name and dependencies', function (done) {
        var original = '',
            options = {
                type: 'umd',
                name: 'umd-module',
                deps: ['dep1', 'dep2']
            };
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.args = ['require', 'exports', 'module'].concat(options.deps || []);
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);

                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name, dependencies and overridden arguments', function (done) {
        var original = '',
            options = {
                type: 'umd',
                name: 'umd-module',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo']
            };
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name, dependencies, overridden arguments and custom return', function (done) {
        var original = '';
        var options = {
            type: 'umd',
            name: 'umd-module',
            deps: ['dep1', 'dep2'],
            args: ['depOne', 'depTwo'],
            exports: '"hello world!"'
        };
        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps);
                options.args = ['require', 'exports', 'module'].concat(options.args);
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should not have syntax errors', function (done) {
        var options = {
            type: 'umd',
            name: 'umd-module',
            deps: ['dep1', 'dep2'],
            args: ['depOne', 'depTwo'],
            exports: '"hello world!"'
        };

        gulp.src(fixtures('./plain-script-1.js'))
            .pipe(wrapper(options))
            .pipe(jshint(jsHintConfig()))
            .pipe(jshint.reporter(jshintStylish))
            .pipe(jshint.reporter('fail'))
            .pipe(assert.first(function (d) {
                d.jshint.success.should.be.eql(true);
            }))
            .pipe(assert.end(done));
    });
});

describe('commonjs', function () {

    function mock(options, content) {
        var result = '';

        if (options.deps) {
            for (var i = 0; i < options.deps.length; i += 1) {
                var dep = options.deps[i];
                var arg = options.args[i];
                result += 'var ' + (arg ? arg : dep) + ' = require("' + dep + '");';
            }
        }

        if(options.exports){
            result += content;
            result += 'exports["' + options.name + '"] = ' + options.exports + ';';
        } else {
            result += 'exports["' + options.name + '"] = ' + content + ';';
        }

        return result;
    }

    it('should wrap with default settings', function (done) {
        var original = '',
            options = {
                type: 'commonjs'
            };
        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with dependencies', function (done) {
        var original = '',
            options = {
                type: 'commonjs',
                deps: ['dep1', 'dep2']
            };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                options.args = options.deps;
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with dependencies and overridden arguments', function (done) {
        var original = '',
            options = {
                type: 'commonjs',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo']
            };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with dependencies, overridden arguments and custom return', function (done) {
        var original = '',
            options = {
                type: 'commonjs',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo'],
                exports: 'testModule'
            };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name, dependencies, overridden arguments and custom return', function (done) {
        var original = '',
            options = {
                type: 'commonjs',
                name: 'customName',
                deps: ['dep1', 'dep2'],
                args: ['depOne', 'depTwo'],
                exports: 'testModule'
            };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(content(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                should.equal(normalize(d.contents.toString()), normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should not have syntax errors', function (done) {
        var options = {
            type: 'commonjs',
            name: 'customName',
            deps: ['dep1', 'dep2'],
            args: ['depOne', 'depTwo'],
            exports: 'testModule'
        };

        gulp.src(fixtures('./plain-script-3.js'))
            .pipe(wrapper(options))
            .pipe(jshint(jsHintConfig()))
            .pipe(jshint.reporter(jshintStylish))
            .pipe(jshint.reporter('fail'))
            .pipe(assert.first(function (d) {
                d.jshint.success.should.be.eql(true);
            }))
            .pipe(assert.end(done));
    });
});