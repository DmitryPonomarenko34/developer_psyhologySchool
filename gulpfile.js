const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const browserSync = require('browser-sync').create();

function browsersync() {
  browserSync.init({
    server: {
      baseDir: "app/"
    },
    notify: false
  })
}

function styles() {
  return src('app/scss/**/*.scss')
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
      'node_modules/jquery/dist/jquery.js',
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function html() {
  return src('app/html/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webphtml())
    .pipe(dest('app'))
    .pipe(browserSync.stream())
}

function images() {
  return src('app/images/**/*.*')
    .pipe(webp({
      quality: 70
    }))
    .pipe(dest('app/images'))
    .pipe(src('app/images/**/*.*'))
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 70,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

function spriteSvg() {
  return src('app/images/icons/*.svg')
    .pipe(svgSprite({
       mode: {
        stack: {
          sprite: "../sprite.svg" //sprite file name
        }
      },
    }))
    .pipe(dest('app/images/icons'))
}

function build() {
  return src([
      'app/fonts/*.woff, *.woff2',
      'app/*.html',
      'app/css/**/*.min.css',
      'app/js/main.min.js'
    ], {
      base: 'app'
    })
    .pipe(dest('dist'))
}

function completeBuild() {
  return del(['dist/images/icons/*', '!dist/images/icons/sprite.svg']);
}

function cleanDist() {
  return del('dist')
}

function watching() {
  watch(['app/scss/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/html/**/*.html'], html);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.html = html;
exports.spriteSvg = spriteSvg;
exports.cleanDist = cleanDist;
exports.build = build;
exports.completeBuild = completeBuild;

exports.build = series(cleanDist, images, build, completeBuild);

exports.default = parallel(styles, scripts, spriteSvg, html, browsersync, watching);