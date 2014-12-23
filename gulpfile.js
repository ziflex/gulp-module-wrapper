var gulp = require('gulp');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var template = require('gulp-jst');
var wrap = require('gulp-wrap');

var TASKS = [];

function task() {
  var name, deps, init;

  name = arguments[0];

  if (Array.isArray(arguments[1])) {
    deps = arguments[1];
    init = arguments[2];
  } else {
    deps = [];
    init = arguments[1];
  }

  TASKS.push(name);
  gulp.task(name, deps, init);
}

task('build', function () {
  return gulp.src('./src/templates/*.jst')
      .pipe(template())
      .pipe(wrap('templates["<%= file.relative.replace(\'.js\', \'\') %>"] = <%= contents %>;'))
      .pipe(concat('templates.js'))
      .pipe(wrap('var _ = require("lodash");\nvar templates = {};\n<%= contents %>\nmodule.exports = templates;'))
      .pipe(gulp.dest('./src/templates'));
});

task('test', ['build'], function () {
  return gulp.src('./tests/main.js')
      .pipe(mocha({reporter: 'mocha-fivemat-reporter'}));
});

gulp.task('default', TASKS, function (done) {
  done();
});
