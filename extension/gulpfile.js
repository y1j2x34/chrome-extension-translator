// generated on 2018-04-20 using generator-chrome-extension 0.7.1
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const del = require('del');
const runSequence = require('run-sequence');
const wiredep = require('wiredep').stream;

const $ = gulpLoadPlugins();

gulp.task('clean', () => {
    return gulp.src(['app/scripts', 'dist/']).pipe($.clean());
});
gulp.task('extras', () => {
    return gulp
        .src(['app/*.*', 'app/_locales/**', '!app/scripts.babel', '!app/*.json', '!app/*.html'], {
            base: 'app',
            dot: true
        })
        .pipe(gulp.dest('dist'));
});

function lint(files, options) {
    return () => {
        return gulp
            .src(files)
            .pipe($.eslint(options))
            .pipe($.eslint.format());
    };
}

gulp.task(
    'lint',
    lint('app/scripts.babel/**/*.js', {
        configFile: 'app/.eslintrc'
    })
);

gulp.task('images', () => {
    return gulp
        .src('app/images/**/*')
        .pipe(
            $.if(
                $.if.isFile,
                $.cache(
                    $.imagemin({
                        progressive: true,
                        interlaced: true,
                        // don't remove IDs from SVGs, they are often used
                        // as hooks for embedding and styling
                        svgoPlugins: [{ cleanupIDs: false }]
                    })
                ).on('error', function(err) {
                    console.log(err);
                    this.end();
                })
            )
        )
        .pipe(gulp.dest('dist/images'));
});
gulp.task('webfonts', () => {
    return gulp.src(['app/bower_components/fontawesome/web-fonts-with-css/webfonts/fa-solid-900.*', '!**/*.svg', '!**/*.eot'], {
        buffer: false
    }).pipe(gulp.dest('dist/webfonts/'));
});

gulp.task('html', () => {
    return gulp
        .src('app/*.html')
        .pipe($.useref({ searchPath: ['.tmp', 'app', '.'] }))
        .pipe($.sourcemaps.init())
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
        .pipe($.sourcemaps.write())
        .pipe(
            $.if(
                '*.html',
                $.htmlmin({
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true
                })
            )
        )
        .pipe(gulp.dest('dist'));
});

gulp.task('chromeManifest', () => {
    return gulp
        .src('app/manifest.json')
        .pipe(
            $.chromeManifest({
                buildnumber: true,
                background: {
                    target: 'scripts/background.js',
                    exclude: ['scripts/chromereload.js']
                }
            })
        )
        .pipe($.if('*.css', $.cleanCss({ compatibility: '*' })))
        .pipe($.if('*.js', $.sourcemaps.init()))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.js', $.sourcemaps.write('.')))
        .pipe(gulp.dest('dist'));
});
gulp.task('babel', () => {
    const mergeStream = require('merge-stream');
    const rollup = require('rollup-stream');
    const rollupPluginJson = require('rollup-plugin-json');
    const source = require('vinyl-source-stream');
    const buffer = require('vinyl-buffer');
    const rollupCommonjs = require('rollup-plugin-commonjs');

    let stream1 = gulp.src([
        'app/scripts.babel/background.js',
        'app/scripts.babel/chromereload.js'
    ])
    .pipe($.babel())
    .pipe(gulp.dest('app/scripts'));

    let popupStream = rollup({
        input: 'app/scripts.babel/popup.js',
        sourcemap: true,
        format: 'es',
        plugins: [
            rollupPluginJson({
                // preferConst: true,
                indent: '    '
            })
        ]
    })
    .on('error', $.util.log)
    .pipe(source('popup.js'))
    .pipe($.cached('scripts'))
    .pipe(buffer())
    .pipe($.babel())
    .pipe($.remember('scripts'))
    .pipe(gulp.dest('app/scripts'))
    ;
    return mergeStream([stream1, popupStream])
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('watch', ['lint', 'babel'], () => {
    $.livereload.listen();

    gulp
        .watch(['app/*.html', 'app/scripts/**/*.js', 'app/images/**/*', 'app/styles/**/*', 'app/_locales/**/*.json'])
        .on('change', $.livereload.reload);

    gulp.watch([
        'app/scripts.babel/**/*',
        'app/languages.json'
    ], ['babel']);
    gulp.watch('bower.json', ['wiredep']);

    gulp.watch('app/manifest.json', ['chromeManifest']);
});

gulp.task('size', () => {
    return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('wiredep', () => {
    gulp
        .src('app/*.html')
        .pipe(
            wiredep({
                ignorePath: /^(\.\.\/)*\.\./
            })
        )
        .pipe(gulp.dest('app'));
});

gulp.task('package', function() {
    var manifest = require('./dist/manifest.json');
    return gulp
        .src('dist/**')
        .pipe($.zip('AITranslator-' + manifest.version + '.zip'))
        .pipe(gulp.dest('package'));
});

gulp.task('build', cb => {
    runSequence('lint', 'babel', 'chromeManifest', ['html', 'images', 'extras','webfonts'], 'size', cb);
});

gulp.task('default', ['clean'], cb => {
    runSequence('build', cb);
});
