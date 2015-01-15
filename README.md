## Information

<table>
<tr>
<td>Package</td><td>gulp-module-wrapper</td>
</tr>
<tr>
<td>Description</td>
<td>Processes files to create AMD/UMD/CommonJS modules</td>
</tr>
<tr>
<td>Node Version</td>
<td>≥ 0.10</td>
</tr>
</table>

[![npm version](https://badge.fury.io/js/gulp-module-wrapper.svg)](https://www.npmjs.com/package/gulp-module-wrapper)

## Basic Usage

Processes the content of the file, module will return the entire content  

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper())
    .pipe(gulp.dest('./dist/'))
});
```

Process the contents, with custom dependencies, callback params, and variable to return (exports)  

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper({
      deps: ['jade'],          // module's dependencies
      args: ['jade'],          // module's arguments
      exports: 'jade',         // variable to return
      root: 'templates/'       // include a module name in the define() call, relative to moduleRoot
    }))
    .pipe(gulp.dest('./dist/'))
});
```

The same but for specific files  

```javascript
var wrapper = require('gulp-module-wrapper');
var options = {
  'app.js' : {
    'name' : 'app'        // allowed to specify module name, otherwise filename will be used
    'deps' : ['router'],
    'args' : ['appRouter'],
    'exports' : 'app'
  },
  'router.js' : {
      'name' : 'router'
      'exports' : 'router'
    }
};

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper(options))
    .pipe(gulp.dest('./dist/'))
});
```

Ignore files, for example, your AMD loader  

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper({}, ['**/require.js']))
    .pipe(gulp.dest('./dist/'))
});
```

or matched by pattern  

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper({}, ['**/*.js']))
    .pipe(gulp.dest('./dist/'))
});
```
For more information look [here](https://github.com/robrich/gulp-match/blob/master/README.md)  

All modules will get default dependencies like 'exports', 'require', 'module'.  
If module root is not specified, filename will be used for module's name.  

### Module type

``gulp-module-wrapper`` supports different module types: ``amd``, ``umd``, ``commonjs``
To selected required module type just passe the option ``type``:  

```javascript
var wrapper = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrapper({
      type: 'umd'
    }))
    .pipe(gulp.dest('./dist/'))
});
```

``amd`` is used by default.  

## API  
### wrapper(options, [ignore])  

#### options.[file-name].type  
Type: `String`.  
Type of module. 
Supported types: `amd`, `umd`, ``commonjs``.  
Default: `amd`.  

### options.[file-name].root  
Type: `String`.  
Relative file's path.  

### options.[file-name].name  
Type: `String`.  
Module name. Useful for separate options or one-file processing.  
Default: File name.  
Note: Set to ``false`` to turn off module's name optimization and leave it as it is.  

### options.[file-name].prefix  
Type: `String`.  
Module's name prefix. Will be added before module's name.  
Note: Ignored if ``name`` is set to ``false``.  

#### options.[file-name].deps  
Type: `Array`.  
List of module dependencies.  
Note: All modules will get default dependencies like 'exports', 'require', 'module'.  

### options.[file-name].args  
Type: `Array`.  
List of module's constructor arguments.  
Default:  All module's constructors will get default arguments like 'exports', 'require', 'module'.  

### options.[file-name].exports  
Type: `String`.  
Variable to return.  
Note: Set to ``false`` to turn off module's export optimization and leave it as it is.  

Separate options can be mixed with global one, but separate options has higher priority.  

### ignore  
Type: `Array`.  
List of files or glob patterns for files that should not be processed.  

## LICENSE

(MIT License)

Copyright (c) 2014 Tim Voronov

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
