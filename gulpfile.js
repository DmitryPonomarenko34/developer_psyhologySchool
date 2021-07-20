const {
  src,
  dest,
  watch,
  parallel,
  series,
} = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const del = require('del');
const webphtml = require('gulp-webp-html');
const changed = require('gulp-changed');
const fileinclude = require('gulp-file-include');
const debug = require('gulp-debug');
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
      'node_modules/@fancyapps/ui/dist/fancybox.umd.js',
      'node_modules/slick-carousel/slick/slick.js',
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
  return src(['app/images/**/*.{png,jpg}', '!app/images/**/*.webp'])
    .pipe(changed('app/images/**/*.{png,jpg}'))
    .pipe(imagemin([
      imagemin.mozjpeg({
        quality: 70
      }),
      imageminPngquant({
        quality: [0.6, 0.7]
      }),
    ], ))
    .pipe(debug({
      title: 'img:'
    }))
    .pipe(dest('dist/images'))
}

function imagesWebp() {
  return src('app/images/**/*.{png,jpg}')
    .pipe(changed('app/images', {
      extension: '.webp'
    }))
    .pipe(imagemin([
      imageminWebp({
        quality: 70
      }),
    ]))
    .pipe(rename({
      extname: ".webp"
    }))
    .pipe(debug({
      title: 'webp:'
    }))
    .pipe(dest('app/images'))
}


function spriteMono() {
  return src(['app/images/icons/mono/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../mono/spriteMono.svg"
        },
      },
      shape: {
        transform: [{
          svgo: {
            plugins: [
              {
                inlineStyles: true
              },
              {
                removeViewBox: false
              },
              {
                removeDoctype: true
              },
              {
                removeXMLProcInst: true
              },
              {
                removeUselessStrokeAndFill: false,
              },
              {
                removeXMLNS: true
              },
              {
                removeAttrs: {
                  attrs: ['class', 'data-name', 'fill', 'stroke'],
                },
              },
            ],
          },
        }, ],
      },
    }))
    .pipe(debug({
      title: 'sprite:'
    }))
    .pipe(dest('app/images/icons'))
}

function spriteMulti() {
  return src(['app/images/icons/multi/*.svg'])
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite: "../multi/spriteMulti.svg"
        },
      },
      shape: {
        transform: [{
          svgo: {
            plugins: [
              {
                inlineStyles: true
              },
              {
                removeViewBox: false
              },
              {
                removeDoctype: true
              },
              {
                removeXMLProcInst: true
              },
              {
                removeUselessStrokeAndFill: false,
              },
              {
                removeXMLNS: true
              },
              {
                removeAttrs: {
                  attrs: ['class', 'data-name',],
                },
              },
            ],
          },
        }, ],
      },
    }))
    .pipe(debug({
      title: 'sprite:'
    }))
    .pipe(dest('app/images/icons'))
}


function build() {
  return src([
      'app/fonts/*.woff',
      'app/fonts/*.woff2',
      'app/*.html',
      'app/images/**/*.webp',
      'app/images/icons/mono/spriteMono.svg',
      'app/images/icons/multi/spriteMulti.svg',
      'app/css/*.min.css',
      'app/js/main.min.js'
    ], {
      base: 'app'
    })
    .pipe(dest('dist'))
}

function completeBuild() {
  return del(['app/images/icons/mono/spriteMono.svg', 'app/images/icons/multi/spriteMulti.svg']);
}

function cleanDist() {
  return del('dist')
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch(['app/images/**/*', '!app/images/icons/*.svg'], series(images, imagesWebp));
  watch(['app/images/icons/**/*.svg', '!app/images/icons/mono/spriteMono.svg', '!app/images/icons/multi/spriteMulti.svg'], series(completeBuild, spriteMono, spriteMulti));
  watch(['app/html/**/*.html'], html);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.imagesWebp = imagesWebp;
exports.html = html;
exports.spriteMono = spriteMono;
exports.spriteMulti = spriteMulti;
exports.cleanDist = cleanDist;
exports.build = build;
exports.completeBuild = completeBuild;

exports.build = series(cleanDist, build, images);

exports.default = series(completeBuild, parallel(styles, scripts, html, images, imagesWebp, spriteMono, spriteMulti, browsersync, watching));