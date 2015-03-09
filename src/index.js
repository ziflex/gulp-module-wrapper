'use strict';
var compile = require('./compiler');
var utils = require('./utils');
var gulpUtils = require('gulp-util');
var match = require('gulp-match');
var _ = require('lodash');
var through = require('through2');
var path = require('path');
var PluginError = gulpUtils.PluginError;

var PLUGIN_NAME = 'gulp-module-wrapper';
var DEFAULT_OPTIONS =  {
    type: 'amd',
    root: null,
    name: null,
    prefix: '',
    deps: null,
    args: null,
    exports: null
};
var DEFAULT_MODULES = ['require', 'exports', 'module'];

function resolveOptions(file, opts) {
    var filename = path.basename(file.path),
        result = _.defaults(_.clone(opts), DEFAULT_OPTIONS);

    result.file = file;

    if (opts[filename]) {
        result = _.defaults(_.clone(opts[filename]), result);
    }

    return result;
}

function getOptions(file, opts) {
    var defaults = { deps: [], args: [] },
        result = resolveOptions(file, opts || {});

    if (result.type !== 'commonjs') {
        defaults.deps = DEFAULT_MODULES;
        defaults.args = DEFAULT_MODULES;
    }

    result.deps = utils.concatUniq(defaults.deps, result.deps);
    result.args = utils.concatUniq(defaults.args, result.args);

    if (result.name === false) {
        result.name = null;
    } else {
        if (typeof result.root === 'string') {
            result.name = path.relative(result.root, result.file.path).slice(0, -path.extname(result.file.path).length).replace(/\\/gi, '/');
        }

        if (typeof result.name !== 'string') {
            result.name = path.basename(result.file.path, path.extname(result.file.path));
        }

        if (result.prefix) {
            result.name = opts.prefix + result.name;
        }
    }

    return result;
}

module.exports = function (options, ignore) {
    return through.obj(function (file, enc, cb) {
        var self = this, opts;

        function err(message) {
            self.emit('error', new PluginError(PLUGIN_NAME, message));
            return cb();
        }

        ignore = ignore || [];

        if (!ignore.length || !match(file, ignore)) {
            opts = getOptions(file, options || {});

            if (file.isStream()) {
                return err('Streaming not supported');
            }

            if (file.isBuffer()) {
                try {
                    file.contents = new Buffer(compile(String(file.contents), opts));
                } catch (ex) {
                    return err(ex.message);
                }
            }
        }

        this.push(file);
        cb();
    });
};