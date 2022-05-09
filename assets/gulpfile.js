/**
 * https://github.com/alex-sirochenko/gulp-build
 *
 * MIT License https://opensource.org/licenses/MIT
 */

// Nodejs.
const path = require('path');

const gulp = require('gulp');

// Utilities.
const rename = require('gulp-rename');
const del = require('del');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');

// SCSS, CSS.
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

// TS, JS.
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');

// Functions for build.
const {
    getScssFiles,
    getTsFiles,
    getJsFiles,
} = require('./gulp-build');

/**
 * --------------------
 * Available gulp tasks
 * --------------------
 * Project build:
 *
 * gulp build
 * --------------------
 * SCSS:
 *
 * gulp build-scss
 * gulp watch-scss
 * --------------------
 * Typescript:
 *
 * gulp build-ts
 * gulp watch-ts
 * --------------------
 * Javascript:
 *
 * gulp build-js
 * gulp watch-js
 * --------------------
 */

/**
 * Builds entire frontend project
 */
gulp.task('build', async () => {
    // Empty dist folder before build.
    del.sync('dist/**', {force: true});

    // Move files that not required compiling from src to dist.
    gulp.src('src/css/**/*.{css,css.map}').pipe(gulp.dest('dist/css'));
    gulp.src('src/fonts/**/*.{ttf,woff,woff2,otf,eot,svg}').pipe(gulp.dest('dist/fonts'));
    gulp.src('src/js/**/*.{js,js.map}').pipe(gulp.dest('dist/js'));
    gulp.src('src/img/**/*.{jpeg,jpg,png,gif,svg}').pipe(gulp.dest('dist/img'));
    gulp.src('src/libs/**/*.{css,css.map,js,jpeg,jpg,png,gif,svg}').pipe(gulp.dest('dist/libs'));

    // Build dist files.
    // If you build only ts or js files you should exclude unused task.
    gulp.parallel(
        'build-js',
        'build-ts',
        'build-scss'
    )();
});

/**
 * Processes SCSS files to CSS, creates sourcemap for CSS, creates minified file of CSS.
 */
gulp.task('build-scss', async () => {
    const list = getScssFiles();

    processStyles(list);
});

/**
 * Processes style files and creates files.
 */
function processStyles(list) {
    for (let i = 0; i < list.length; i++) {
        gulp.src(list[i]['src'])
            .pipe(plumber({
                errorHandler: (err) => {
                    console.log(err.toString());
                }
            }))
            .pipe(sourcemaps.init())
            .pipe(sass())
            .pipe(autoprefixer(['last 10 versions'], {cascade: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(list[i]['dist']))
            .pipe(filter('**/!(*.map)*.css'))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest(list[i]['dist']));
    }
}

/**
 * Watches SCSS folder for changes and invokes 'build-scss' task to process SCSS files.
 */
gulp.task('watch-scss', () => {
    gulp.series('build-scss')();
    gulp.watch('src/scss/**/*.scss', gulp.series('build-scss'));
});

gulp.task('build-ts', tsInit.bind(null, false));
gulp.task('watch-ts', tsInit.bind(null, true));

/**
 * Builds Typescript files. Add your settings for each Typescript file that should be built separately.
 */
async function tsInit(watch) {
    const list = getTsFiles();

    for (let item of list) {
        item.pkg = getBrowserify(item.src, true);
    }

    processScripts(list, watch, true);
}

gulp.task('build-js', jsInit.bind(null, false));
gulp.task('watch-js', jsInit.bind(null, true));

/**
 * Builds Javascript files. Add your settings for each Javascript file that should be built separately.
 */
async function jsInit(watch) {
    const list = getJsFiles();

    for (let item of list) {
        item.pkg = getBrowserify(item.src, false);
    }

    processScripts(list, watch, false);
}

/**
 * Prepares Browserify instance and returns it.
 */
function getBrowserify(entry, ts = false) {
    const bro = browserify({
        basedir: '.',
        ignoreWatch: [
            '**\/node_modules\/**',
            './ng-app\/**'
        ],
        debug: true,
        entries: entry,
        cache: {},
        packageCache: {}
    });

    const babelifyCfg = {
        presets: ['@babel/preset-env'],
        plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-transform-runtime',
        ]
    };

    if (ts) {
        bro.plugin(tsify);
        babelifyCfg.extensions = ['.ts'];
    }

    return bro.transform('babelify', babelifyCfg);
}

/**
 * Creates dynamic Gulp tasks, attaches Watchify to Browserify, invokes watching and run tasks which trigger files
 * processing.
 *
 * @param list
 * @param watch
 * @param ts
 */
function processScripts(list, watch, ts) {
    const tasks = [];
    for (let i = 0; i < list.length; i++) {
        const task = `build-${ts ? 'ts' : 'js'}: filename - ${path.posix.basename(list[i].dist)}`;
        const preparedBundle = bundle.bind(list[i]);
        if (watch) {
            addWatchify(list[i], preparedBundle);
        }
        gulp.task(task, preparedBundle);
        tasks.push(task);
    }
    if (tasks.length) {
        gulp.parallel(tasks)();
    }
}

/**
 * Create Browserify bundle. Triggers Browserify to process files. Returns Browserify bundle.
 */
async function bundle() {
    return this.pkg.bundle()
        .on('error', (error) => {
            console.error(error.toString());
        })
        .pipe(source(path.posix.basename(this.dist)))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(path.dirname(this.dist)))
        .pipe(sourcemaps.write('./'))
        .pipe(filter('**/!(*.map)*.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(path.dirname(this.dist)));
}

/**
 * Adds Watchify plugin to Browserify bundle with TS or JS files.
 *
 * @param listItem Contains Browserify pkg, src, dist of a file.
 * @param preparedBundle Browserify bundle.
 */
function addWatchify(listItem, preparedBundle) {
    const browserifyPkg = listItem.pkg;
    const dist = listItem.dist;

    watchify(browserifyPkg)
        .on('update', filePaths => {
            for (let i = 0; i < filePaths.length; i++) {
                const entryPath = path.dirname(browserifyPkg._options.entries).replace(/^\.{1,2}/, '');

                if (filePaths[i].indexOf(entryPath) !== -1) {
                    preparedBundle();
                    break;
                }
            }
        })
        .on("time", timeMs => {
            const date = new Date();
            const pad = (val) => val < 10 ? '0' + val : val;
            const hours = pad(date.getHours());
            const minutes = pad(date.getMinutes());
            const seconds = pad(date.getSeconds());
            const folder = path.posix.basename(dist);

            console.log(`[${hours}:${minutes}:${seconds}] Finished: ${folder} ${timeMs}ms`);
        });
}