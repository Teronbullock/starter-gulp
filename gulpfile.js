//initialize modules
const {src, dest, watch, series, parallel } = require('gulp');

const autoprefixer = require('autoprefixer'); 
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();


//file path variables
const files = {
  sassPath: 'src/assets/sass/**/*.scss',
  jsPath: 'src/assets/js/**/*.js'

}

//sass task 
function sassTask() {
  //src is the path to the sass files
   //the .pipe() lets you string commands together
  return src(files.sassPath, {sourcemaps: true} )
    .pipe( sass().on('error', sass.logError))
    .pipe( postcss([ autoprefixer(), cssnano() ]) )
    .pipe(dest('dist/assets/css', { sourcemaps: '.' })
  );
}

//js task
function jsTask() {
  //src is the path to the js files
  return src(files.jsPath, {sourcemaps: true} )
    .pipe( concat('main.js') )
    .pipe( uglify() )
    .pipe( dest('dist/assets/js', { sourcemaps: '.' } ) 
  );

}

//cachebusting task
const cbString = new Date().getDate();
function cacheBustTask(  ) {
  return src(['src/index.html'])
    .pipe( replace(/cb=\d+/g, 'cb=' + cbString) )
    .pipe(dest('dist') 
  );

}

//browsersync tasks
function browserSyncServer(cb) {
  browserSync.init({
    server: {
      baseDir: 'dist/'
    },
    browser: 'safari'
  });
  cb();
}

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}


//watch task
function watchTask() {
  //the function takes two prams, what to watch and what to run if there are changes
  watch( [files.sassPath, files.jsPath], 
    series(sassTask, jsTask, browserSyncReload) );

  watch( 'src/*.html', series(cacheBustTask, browserSyncReload) );  
}


//default task
exports.default = series(
  parallel(sassTask, jsTask),
  cacheBustTask,
  browserSyncServer,
  watchTask
);

