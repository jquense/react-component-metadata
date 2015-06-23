'use strict';
var gulp    = require('gulp')
  , rimraf  = require('rimraf')
  , plumber = require('gulp-plumber')
  , babelTransform = require('gulp-babel-helpers');


gulp.task('clean', function(cb){
  rimraf('./lib', cb);
})

gulp.task('transpile', ['clean'], function(){

  return gulp.src('./src/**/*.js')
      .pipe(plumber())
      .pipe(babelTransform('./util/babelHelpers.js'))
      .pipe(gulp.dest('./lib'));
})

gulp.task('release', ['clean', 'transpile'])