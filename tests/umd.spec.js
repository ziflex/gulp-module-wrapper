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

describe('umd', function () {
    function mock(options, content) {
        var name = options.name ? options.name :'';
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

        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.name = 'plain-script-1';
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
            }))
            .pipe(assert.end(done));
    });

    it('should wrap with specific name', function (done) {
        var original = '',
            options = {
                type: 'umd',
                name: 'umd-module'
            };
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.args = ['require', 'exports', 'module'].concat(options.deps || []);
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);

                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps || []);
                options.args = ['require', 'exports', 'module'].concat(options.args || []);
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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
        gulp.src(helpers.getFixtures('./plain-script-1.js'))
            .pipe(helpers.getContent(function (result) {
                original = result;
            }))
            .pipe(wrapper(options))
            .pipe(assert.first(function (d) {
                options.deps = ['require', 'exports', 'module'].concat(options.deps);
                options.args = ['require', 'exports', 'module'].concat(options.args);
                should.equal(helpers.normalize(d.contents.toString()), helpers.normalize(mock(options, original)));
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

        gulp.src(helpers.getFixtures('./plain-script-1.js'))
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
                type: 'umd'
            }))
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
                type: 'umd',
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
});