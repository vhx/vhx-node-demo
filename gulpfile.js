var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var postcss      = require('gulp-postcss');


// watches current scss files ONLY.
gulp.task('sass', function(){
	return gulp.src('./styles/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./public'))
});

gulp.task('autoprefixer', function () {
  return gulp.src('public/index.css')
    .pipe(sourcemaps.init())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./public'));
});

// watches for changes on save.
gulp.task('watch', ['sass', 'autoprefixer'], function(){
	gulp.watch('./styles/partials/*.scss', ['sass']);
	gulp.watch('./public/index.css', ['autoprefixer']);
});
