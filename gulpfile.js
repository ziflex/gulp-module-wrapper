'use strict';
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    jshintStylish = require('jshint-stylish'),
    mocha = require('gulp-mocha'),
    template = require('gulp-jst'),
    wrap = require('gulp-wrap'),
    version = require('gulp-bump'),
    TASKS = [];

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

task('validate', function () {
    return gulp.src(['./src/*.js', './src/ast/*.js', '!./src/templates.js'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter(jshintStylish))
        .pipe(jshint.reporter('fail'));
});

task('build', ['validate'], function () {
    return gulp.src('./src/templates/*.jst')
        .pipe(template())
        .pipe(wrap('templates["<%= file.relative.replace(\'.js\', \'\') %>"] = <%= contents %>;'))
        .pipe(concat('templates.js'))
        .pipe(wrap('var _ = require("lodash");\nvar templates = {};\n<%= contents %>\nmodule.exports = templates;'))
        .pipe(gulp.dest('./src'));
});

task('test', ['build'], function () {
  return gulp.src('./tests/main.js')
      .pipe(mocha({reporter: 'mocha-fivemat-reporter'}));
});

gulp.task('default', TASKS, function () {
  return gulp.src(['./package.json'])
      .pipe(version())
      .pipe(gulp.dest('./'));
});
