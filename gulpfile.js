const gulp             = require('gulp');
const concat           = require('gulp-concat');
const sourcemaps       = require('gulp-sourcemaps');
const uglify           = require('gulp-uglify');
const htmlToJs         = require('gulp-html-to-js');
const wrapFile         = require('gulp-wrap-file');
const sass             = require('gulp-sass')(require('sass'));
const rollup           = require('@rollup/stream');
const rollupSourcemaps = require('rollup-plugin-sourcemaps');
const rollupBabel      = require('@rollup/plugin-babel');
const nodeResolve      = require('@rollup/plugin-node-resolve');
const source           = require('vinyl-source-stream');
const buffer           = require("vinyl-buffer");


var conf = {
    dist: "./dist",
    js: {
        file: 'fileup.js',
        fileMin: 'fileup.min.js',
        main: 'src/js/main.js',
        src: 'src/js/**/*.js'
    },
    css: {
        fileMin: 'fileup.min.css',
        file: 'fileup.css',
        main: 'src/css/main.scss',
        src: [
            'src/css/**/*.scss',
        ]
    },
    css_bootstrap: {
        fileMin: 'fileup.bootstrap.min.css',
        main: 'src/css/fileup.bootstrap.scss',
    },
    tpl: {
        file: 'fileup.templates.js',
        dist: './src/js',
        src: [
            'src/html/**/*.html',
            'src/html/*.html'
        ]
    }
};



gulp.task('build_css_min', function(){
    return gulp.src(conf.css.main)
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['node_modules'], outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat(conf.css.fileMin))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(conf.dist));
});

gulp.task('build_css_min_fast', function(){
    return gulp.src(conf.css.main)
        .pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
        .pipe(concat(conf.css.fileMin))
        .pipe(gulp.dest(conf.dist));
});

gulp.task('build_css', function(){
    return gulp.src(conf.css.main)
        .pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
        .pipe(concat(conf.css.file))
        .pipe(gulp.dest(conf.dist));
});



gulp.task('build_js', function() {
    return rollup({
        input: conf.js.main,
        output: {
            sourcemap: false,
            format: 'umd',
            name: "fileUp"
        },
        onwarn: function (log, handler) {
            if (log.code === 'CIRCULAR_DEPENDENCY') {
                return; // Ignore circular dependency warnings
            }
            handler(log.message);
        },
        context: "window",
        plugins: [
            nodeResolve(),
            rollupBabel({babelHelpers: 'bundled'}),
        ]
    })
        .pipe(source(conf.js.file))
        .pipe(buffer())
        .pipe(gulp.dest(conf.dist));
});

gulp.task('build_js_min_fast', function() {
    return rollup({
        input: conf.js.main,
        output: {
            sourcemap: false,
            format: 'umd',
            name: "fileUp"
        },
        onwarn: function (log, handler) {
            if (log.code === 'CIRCULAR_DEPENDENCY') {
                return; // Ignore circular dependency warnings
            }
            handler(log.message);
        },
        context: "window",
        plugins: [
            nodeResolve(),
            rollupSourcemaps(),
            rollupBabel({babelHelpers: 'bundled'}),
        ]
    })
        .pipe(source(conf.js.fileMin))
        .pipe(buffer())
        .pipe(gulp.dest(conf.dist));
});


gulp.task('build_js_min', function() {
    return rollup({
        input: conf.js.main,
        output: {
            sourcemap: false,
            format: 'umd',
            name: "fileUp"
        },
        onwarn: function (log, handler) {
            if (log.code === 'CIRCULAR_DEPENDENCY') {
                return; // Ignore circular dependency warnings
            }
            handler(log.message);
        },
        context: "window",
        plugins: [
            nodeResolve(),
            rollupSourcemaps(),
            rollupBabel({babelHelpers: 'bundled'}),
        ]
    })
        .pipe(source(conf.js.fileMin))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(conf.dist));
});


gulp.task('build_tpl', function() {
    return gulp.src(conf.tpl.src)
        .pipe(htmlToJs({global: 'tpl', concat: conf.tpl.file}))
        .pipe(wrapFile({
            wrapper: function(content, file) {
                content = content.replace(/\\n/g, ' ');
                content = content.replace(/[ ]{2,}/g, ' ');
                return 'let ' + content + ";\nexport default tpl;"
            }
        }))
        .pipe(gulp.dest(conf.tpl.dist));
});


gulp.task('build_bootstrap', function() {
    return gulp.src(conf.css_bootstrap.main)
        .pipe(sourcemaps.init())
        .pipe(sass({includePaths: ['node_modules'], outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(concat(conf.css_bootstrap.fileMin))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(conf.dist));
});



gulp.task('build_watch', function() {
    gulp.watch(conf.tpl.src, gulp.series(['build_tpl', 'build_js_min_fast']));
    gulp.watch(conf.js.src, gulp.parallel(['build_js_min_fast']));
    gulp.watch(conf.css.src, gulp.parallel(['build_css_min_fast']));
});

gulp.task("default", gulp.series([ 'build_tpl', 'build_js_min', 'build_js']));