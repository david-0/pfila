const gulp = require('gulp');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var nodemon = require('gulp-nodemon');

const JSON_FILES = ['src/*.json', 'src/**/*.json'];

sass.compiler = require('node-sass');

// pull in the project TypeScript config
const tsProject = ts.createProject('tsconfig.json');

gulp.task('scripts', () => {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', gulp.series('scripts', () => {
    gulp.watch('src/**/*.ts', gulp.series('scripts'));
}));

gulp.task('assets', function () {
    return gulp.src(JSON_FILES)
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
    return gulp.src('src/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('start', function (done) {
  nodemon({
    script: 'dist/app.js'
    , ext: 'js'
    , env: { 'NODE_ENV': 'development' }
    , done: done
  })
})

//gulp.task('default', gulp.parallel('watch', 'assets', 'styles'));
gulp.task('default', gulp.parallel('watch', 'start'));
