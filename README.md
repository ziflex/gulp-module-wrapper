## Information

<table>
<tr>
<td>Package</td><td>gulp-module-wrapper</td>
</tr>
<tr>
<td>Description</td>
<td>Uses AST for processing files to create modules (currently only AMD)</td>
</tr>
<tr>
<td>Node Version</td>
<td>≥ 0.10</td>
</tr>
</table>

## Usage

Process the contents of the file, module will return the entire contents

```javascript
var wrap = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrap())
    .pipe(gulp.dest('./dist/'))
});
```

Process the contents, with custom dependencies, callback params, and variable to return (exports)

```javascript
var wrap = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrap({
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
var wrap = require('gulp-module-wrapper');
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
    .pipe(wrap(options))
    .pipe(gulp.dest('./dist/'))
});
```

Ignore files, for example, your AMD loader

```javascript
var wrap = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrap({}, ['**/require.js']))
    .pipe(gulp.dest('./dist/'))
});
```

or matched by pattern

```javascript
var wrap = require('gulp-module-wrapper');

gulp.task('wrap', function() {
  gulp.src('./lib/*.js')
    .pipe(wrap({}, ['**/*.js']))
    .pipe(gulp.dest('./dist/'))
});
```
For more information look [here](https://github.com/robrich/gulp-match/blob/master/README.md)

All modules will get default dependencies like 'exports', 'require', 'module'.
If module root is not specified, filename will be used for module's name.

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
