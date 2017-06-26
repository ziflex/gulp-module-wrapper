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

describe('commonjs', function () {

    function mock(options, content) {
        var result = '';

        if (options.deps) {
            for (var i = 0; i < options.deps.length; i += 1) {
                var dep = options.deps[i];
                var arg = options.args[i];
                if(dep.indexOf('.') > 0) {
                    var arr = dep.split(".");
                    var module = arr[0];
                    var subModule = arr[1];
                    result += 'var ' + (module) + ' = require("' + module + '").' + subModule + ';';
                }else {
                    result += 'var ' + (arg ? arg : dep) + ' = require("' + dep + '");';
                }
            }
        }

        if(options.exports){
            result += content;
            result += 'module.exports = ' + options.exports;
        } else {
            result += 'module.exports = ' + content;
        }

        if (!utils.endsWith(result, ';')) {
            result += ';';
        }

        return result;
    }

    it('should wrap with default settings', function (done) {
        var original = '',
            options = {
                type: 'commonjs'
            };
        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with dependencies', function (done) {
        var original = '',
            options = {
                type: 'commonjs',
                deps: ['dep1', 'dep2', 'dep3.dep4']
            };

        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                options.args = options.deps;
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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

        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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

        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-3';
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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

        gulp.src(helpers.getFixtures('./plain-script-3.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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
            .pipe(wrapper({
                type: 'commonjs'
            }))
            .pipe(assert.first(function (d) {
                var options = {};
                options.name = 'fixture';
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });
});
