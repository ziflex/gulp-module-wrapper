var helpers = require("./helpers");
var should = require("should");
var assert = require("stream-assert");
var gulp = require("gulp");
var jshint = require("gulp-jshint");
var jshintStylish = require("jshint-stylish");
var utils = require("../src/utils");
var concat = require("gulp-concat");
require("mocha");

var wrapper = require("../");

describe("amd", function () {

    function mock(options, content) {
        var name = options.name ? options.name  : '';
        var deps = options.deps ? JSON.stringify(options.deps) : '[]';
        var args = (options.args ? options.args.join(',') : []).toString();
        var exports = options.exports ? 'return ' + options.exports : '';
        content = exports ? content : 'return ' + content;

        if (exports) {
            if (!utils.endsWith(exports, ';')) {
                exports += ';';
            }
        } else {
            if (!utils.endsWith(content, ';')) {
                content += ';';
            }
        }

        var result = 'define("' + name +'",' + deps + ', function (' + args + ') {';
        result += content;
        result += exports;
        result += '});';

        return result;
    }

    it('should process single plain script', function (done) {
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("plain-script-1",["require","exports","module"],function(require,exports,module){ return console.log("plain-script-1"); });');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single plain script with exports', function (done) {
        var src = helpers.getFixtures('./plain-script-2.js');
        var options = {
            exports: 'name'
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("plain-script-2",["require","exports","module"],function (require,exports,module) {var name = "plain-script-2"; console.log(name); return name;});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single anonymous module', function (done) {
        var src = helpers.getFixtures('./anon-module-1.js');
        gulp.src(src)
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("anon-module-1",["require","exports","module"],function (require,exports,module) {return console.log("anon-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single named module', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        gulp.src(src)
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("named-module-1",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with root option', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        var options = {
            root: 'tests'
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("fixtures/named-module-1",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with name option', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        var options = {
            name: 'my-custom-module-name'
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("my-custom-module-name",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with global dependencies', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        var options = {
            deps: ['dep1', 'dep2'],
            args: ['args1', 'args2']
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("named-module-1",["require","exports","module","dep1", "dep2"],function (require,exports,module,args1,args2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with custom dependencies', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        var options = {
            deps: ['dep1'],
            'named-module-1.js' : {
                deps: ['dep1', 'dep2']
            }
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("named-module-1",["require","exports","module","dep1", "dep2"],function (require,exports,module,dep1,dep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process plain script with single custom dependency', function (done) {
        var src = helpers.getFixtures('./plain-script-2.js');
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
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("plain-script-2",["require","exports","module","dep"],function (require,exports,module,dep) {var name = "plain-script-2"; console.log(name); return name;});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single module with normalized arguments', function (done) {
        var src = helpers.getFixtures('./named-module-1.js');
        var options = {
            deps: ['path/to/dep1', 'path/to/dep2']
        };
        gulp.src(src)
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("named-module-1",["require","exports","module","path/to/dep1", "path/to/dep2"],function (require,exports,module,pathToDep1,pathToDep2) {return console.log("named-module-1");});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process single named module with native return value', function (done) {
        var src = helpers.getFixtures('./named-module-4.js');

        gulp.src(src)
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var result = helpers.normalize(d.contents.toString());
                var expected = helpers.normalize('define("named-module-4",["require","exports","module"],function (require,exports,module) {var name = "named-module-4"; return name;});');

                should.equal(result, expected);
            }))
            .pipe(assert.end(done));
    });

    it('should process multiple named modules in single file', function (done) {
        gulp.src([helpers.getFixtures('./named-module-1.js'), helpers.getFixtures('./named-module-2.js')])
            .pipe(concat('named-modules'))
            .pipe(wrapper({
                name: false
            }))
            .pipe(assert.first(function (d) {
                var result = d.contents.toString();
                var expected = '';
                expected += 'define("named-module-1",["require","exports","module"],function (require,exports,module) {return console.log("named-module-1");});';
                expected += 'define("named-module-2",["require","exports","module", "dep1","dep2"],function (require,exports,module,dep1,dep2) {return console.log("named-module-2");});';

                should.equal(helpers.normalize(result), helpers.normalize(expected));
            }))
            .pipe(assert.end(done));
    });

    it('should not have syntax errors', function (done) {
        var options = {
            type: 'commonjs',
            name: 'customName',
            prefix: 'test',
            deps: ['dep1', 'dep2'],
            args: ['depOne', 'depTwo'],
            exports: 'testModule'
        };

        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(wrapper(options))
            .pipe(jshint(helpers.getJsHintConfig()))
            .pipe(jshint.reporter(jshintStylish))
            .pipe(jshint.reporter('fail'))
            .pipe(assert.first(function (d) {
                d.jshint.success.should.be.eql(true);
            }))
            .pipe(assert.end(done));
    });

    it('should process JSON file', function (done) {
        var original,
            src = helpers.getFixtures('./fixture.json');

        gulp.src(src)
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper())
            .pipe(assert.first(function (d) {
                var options = {};
                options.name = 'fixture';
                options.deps = ['require', 'exports', 'module'];
                options.args = ['require', 'exports', 'module'];
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should add prefix to module\'s name', function (done) {
        var original,
            options = {
                name: 'plain-script',
                prefix: 'test-'
            };
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'test-plain-script';
                options.deps = ['require', 'exports', 'module'];
                options.args = ['require', 'exports', 'module'];
                var result = d.contents.toString();
                var expected = mock(options, original);

                should.equal(helpers.normalize(result), helpers.normalize(expected));
            }))
            .pipe(assert.end(done));
    });

    it('should override global\'s "name" options with file\'s specific one', function (done) {
        var original,
            options = {
                name: false,
                'plain-script-1.js' : {
                    name : 'custom-script-name'
                }
            };

        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'custom-script-name';
                options.deps = ['require', 'exports', 'module'];
                options.args = ['require', 'exports', 'module'];
                var result = d.contents.toString();
                var expected = mock(options, original);

                should.equal(helpers.normalize(result), helpers.normalize(expected));
            }))
            .pipe(assert.end(done));
    });
});