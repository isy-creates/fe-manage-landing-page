const { src, dest, watch, series, parallel } = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const terser = require('gulp-terser');
const webpack = require('webpack-stream');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const mode = require('gulp-mode')();
const browserSync = require('browser-sync').create();

//SCSS & CSS Tasks
const css = () => {
  // scss file location
  return src('./src/styles/**/*.scss')
    //enable sourcemaps in developmentmode
    .pipe( mode.development(sourcemaps.init() ))
    //pass that file to through sass compiler
    .pipe( sass().on('error', sass.logError) )
    //autoprefixer
    .pipe( autoprefixer() )
    //minfy 
    .pipe(mode.production( csso() ))
    //write sourcemaps
    .pipe(mode.development( sourcemaps.write() ))
    // where to save the compiled css?
    .pipe(dest('./dist/css'))
    //stream changes to all browsers
    .pipe(mode.development( browserSync.stream()) );
}

//JavaScript Tasks
const js = () => {
  return src('./src/js/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe( webpack({
      mode: 'development',
      devtool: 'inline-source-map'
    }))
    .pipe( mode.development( sourcemaps.init({ loadMaps: true}) ))
    .pipe( rename('main.js'))
    .pipe( mode.production( terser({ output: {comments: false} }) ))
    .pipe( mode.development( sourcemaps.write() ))
    .pipe( dest('./dist/js') )
    .pipe( mode.development( browserSync.stream() ));
}

//CopyImages
const copyImages = () => {
  return src('./src/images/**/*.{png,jpg,jpeg,gif,svg}')
  .pipe (dest('./dist/images'));
}

//CopyFonts
const copyFonts = () => {
  return src('./src/fonts/**/*.{svg,eot,ttf,woff,woff2}')
  .pipe( dest('./dist/fonts/'))
}

//clean Task
const clean = () => {
  return del(['./dist']);
}

//cleanImages
const cleanImages = () => {
  return del(['./dist/images']);
}

//cleanJS
const cleanJs = () => {
  return del(['.dist/js']);
}

const cleanFonts = () => {
  return del(['./dist/fonts']);
}

//LiveServer
const watchForChanges = () => {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  //if anything changes in the specific folders, start the function
  watch('./src/styles/**/*.scss', css);
  watch('./*.html').on('change', browserSync.reload);
  watch('./src/js/**/*.js', series(cleanJs, js)).on('change', browserSync.reload);
  watch('./src/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
  watch('./src/fonts/**/*.{svg,eot,ttf,woff,woff2}', series(cleanFonts, copyFonts));
}

exports.default = series(clean, parallel(css, js, copyImages, copyFonts), watchForChanges);
exports.build = series(clean, parallel(css, js, copyImages, copyFonts));