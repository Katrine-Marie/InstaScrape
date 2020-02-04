const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
var minifyjs = require('gulp-js-minify');
const eslint = require('gulp-eslint');

gulp.task('default', () =>
    gulp.src('src/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(eslint('config.json'))
        .pipe(eslint.format())
        .pipe(babel())
        .pipe(concat('instascrape.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(minifyjs())
        .pipe(gulp.dest('dist'))
);
