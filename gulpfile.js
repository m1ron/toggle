var gulp = require('gulp'),
  scss = require('gulp-sass')(require('sass')),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create(),
  twig = require('gulp-twig');

gulp.task('scss', function () {
  return gulp.src('./scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
    .pipe(autoprefixer('last 2 version'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream());
});

gulp.task('serve', gulp.series('scss', function () {

  browserSync.init({
    server: './',
    open: 'external'
  });

  gulp.watch('./scss/**/*.scss', gulp.series('scss'));
}));

gulp.task('default', gulp.series('serve'));