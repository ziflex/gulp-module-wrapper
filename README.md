# gulp-module-wrapper

[![npm version](https://badge.fury.io/js/gulp-module-wrapper.svg)](https://www.npmjs.com/package/gulp-module-wrapper)
[![Build Status](https://secure.travis-ci.org/ziflex/gulp-module-wrapper.svg?branch=master)](http://travis-ci.org/ziflex/gulp-module-wrapper)

A Gulp plugin that processes files to create AMD/UMD/CommonJS modules.

## Table of Contents

- [Installation](#installation)
- [Information](#information)
- [Basic Usage](#basic-usage)
- [Module Types](#module-types)
- [Dependencies](#dependencies)
- [API](#api)
- [License](#license)

## Installation

```bash
npm install gulp-module-wrapper --save-dev
```

## Information

| Property | Value |
|----------|-------|
| Package | gulp-module-wrapper |
| Description | Processes files to create AMD/UMD/CommonJS modules |
| Node Version | ≥ 0.10 |

## Basic Usage

Process the content of files, wrapping them as modules. The module will return the entire content:

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper())
    .pipe(gulp.dest('./dist/'));
});
```

Process files with custom dependencies, callback parameters, and export variable:

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper({
      deps: ['jade'],          // module's dependencies
      args: ['jade'],          // module's arguments
      exports: 'jade',         // variable to return
      root: 'templates/'       // include a module name in the define() call, relative to moduleRoot
    }))
    .pipe(gulp.dest('./dist/'));
});
```

Configure specific files with individual options:

```javascript
var wrapper = require('gulp-module-wrapper');
var options = {
  'app.js': {
    name: 'app',        // allowed to specify module name, otherwise filename will be used
    deps: ['router'],
    args: ['appRouter'],
    exports: 'app'
  },
  'router.js': {
    name: 'router',
    exports: 'router'
  }
};

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper(options))
    .pipe(gulp.dest('./dist/'));
});
```

Ignore specific files, for example, your AMD loader:

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper({}, ['**/require.js']))
    .pipe(gulp.dest('./dist/'));
});
```

Or ignore files matched by pattern:

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper({}, ['**/*.js']))
    .pipe(gulp.dest('./dist/'));
});
```

For more information about file matching patterns, see [gulp-match documentation](https://github.com/robrich/gulp-match/blob/master/README.md).

**Note:** All modules will get default dependencies like 'exports', 'require', 'module'. If module root is not specified, the filename will be used for the module's name.

## Module Types

`gulp-module-wrapper` supports different module types: `amd`, `umd`, and `commonjs`.

To select the required module type, use the `type` option:

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper({
      type: 'umd'
    }))
    .pipe(gulp.dest('./dist/'));
});
```

**Default:** `amd` is used by default.

### AMD (Asynchronous Module Definition)
```javascript
// Input: console.log('Hello world');
// Output:
define([], function() {
  console.log('Hello world');
});
```

### UMD (Universal Module Definition)
```javascript
// Input: console.log('Hello world');
// Output:
(function (root, factory) {
  // UMD wrapper that works in AMD, CommonJS, and browser globals
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.myModule = factory();
  }
}(this, function () {
  console.log('Hello world');
}));
```

### CommonJS
```javascript
// Input: console.log('Hello world');
// Output:
console.log('Hello world');
```


## Dependencies

### CommonJS Sub-module Dependencies

Since version 0.3.8, you can define sub-module dependencies like `'jade.runtime'`:

```javascript
gulp.task('wrap', function() {
  return gulp.src('./lib/*.js')
    .pipe(wrapper({
      type: 'commonjs',
      deps: ['jade.runtime']
    }))
    .pipe(gulp.dest('./dist/'));
});
```

This will inject the following code: `var jade = require('jade').runtime`.

## API

### wrapper(options, [ignore])

#### Parameters

- **options** `{Object|String}` - Configuration options for the wrapper
- **ignore** `{Array}` _(optional)_ - List of files or glob patterns for files that should not be processed

### Global Options

These options can be applied globally to all files:

#### options.type
- **Type:** `String`
- **Default:** `'amd'`
- **Description:** Type of module wrapper to generate
- **Supported values:** `'amd'`, `'umd'`, `'commonjs'`

#### options.root
- **Type:** `String`
- **Description:** Relative file path for the module

#### options.name
- **Type:** `String`
- **Default:** File name (without extension)
- **Description:** Module name. Useful for separate options or one-file processing
- **Note:** Set to `false` to turn off module name optimization and leave it as-is

#### options.prefix
- **Type:** `String`
- **Description:** Module name prefix. Will be added before the module name
- **Note:** Ignored if `name` is set to `false`

#### options.deps
- **Type:** `Array`
- **Description:** List of module dependencies
- **Note:** All modules will get default dependencies like 'exports', 'require', 'module'

#### options.args
- **Type:** `Array`
- **Default:** `['exports', 'require', 'module']`
- **Description:** List of module constructor arguments

#### options.exports
- **Type:** `String`
- **Description:** Variable to return/export from the module
- **Note:** Set to `false` to turn off module export optimization and leave it as-is

### File-specific Options

You can specify options for individual files using the filename as the key:

```javascript
var options = {
  'app.js': {
    name: 'myApp',
    type: 'umd',
    exports: 'App'
  },
  'utils.js': {
    name: 'utilities',
    deps: ['lodash']
  }
};
```

**Note:** File-specific options have higher priority than global options.

## License

MIT License

Copyright (c) 2014 Tim Voronov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
