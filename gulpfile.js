const gulp = require('gulp');
const nodemon = require('gulp-nodemon');

gulp.task('start', function (done) {
  nodemon({
    script: 'dist/app.js'
    , ext: 'js'
    , env: { 'NODE_ENV': 'production' }
    , done: done
  })
})

gulp.task('default', gulp.series('start'));
