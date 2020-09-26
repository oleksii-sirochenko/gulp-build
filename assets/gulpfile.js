/**
 * https://github.com/alex-2077/gulp-build
 *
 * MIT License https://opensource.org/licenses/MIT
 */

const gulp = require('gulp');

// utilities
const rename = require('gulp-rename');
const del = require('del');
const plumber = require('gulp-plumber');
const filter = require('gulp-filter');
const notify = require('gulp-notify');

// scss,css
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

// ts
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');

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
    // empty dist folder
    del.sync('dist/**');
    
    // move files that not required compiling from src to dist
    gulp.src('src/css/**/*.{css,css.map}').pipe(gulp.dest('dist/css'));
    gulp.src('src/fonts/**/*.{ttf,woff,woff2,otf,eot,svg}').pipe(gulp.dest('dist/fonts'));
    gulp.src('src/js/**/*.{js,js.map}').pipe(gulp.dest('dist/js'));
    gulp.src('src/img/**/*.{jpeg,jpg,png,gif,svg}').pipe(gulp.dest('dist/img'));
    
    // build dist files
    // if you build only ts or js files you should exclude unused task
    gulp.parallel('build-js', 'build-ts', 'build-scss')();
});

/**
 * Processes SCSS files to CSS, creates sourcemap for CSS, creates minified file of CSS.
 */
gulp.task('build-scss', async () => {
    const list = [
        {
            src: 'src/scss/style.scss',
            dist: 'dist/css'
        },
        {
            src: 'src/scss/admin-style.scss',
            dist: 'dist/css'
        },
    ];
    
    for (let i = 0; i < list.length; i++) {
        gulp.src(list[i]['src'])
            .pipe(plumber({
                errorHandler: (err) => {
                    notify.onError({
                        title: "Gulp",
                        subtitle: "Failure!",
                        message: "Error: <%= error.message %>",
                        sound: "Basso"
                    })(err);
                    this.emit('end');
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
});

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
 * Builds Javascript files. Add your settings for each Typescript file that should be built separately.
 */
async function tsInit(watch) {
    const list = [
        {
            pkg: getBrowserify('src/ts/page1/page1.ts', true),
            filename: 'page1.js',
            dist: 'dist/js/page1',
        },
        {
            pkg: getBrowserify('src/ts/page2/page2.ts', true),
            filename: 'page2.js',
            dist: 'dist/js/page2',
        },
    ];
    processScripts(list, watch, true);
}

gulp.task('build-js', jsInit.bind(null, false));
gulp.task('watch-js', jsInit.bind(null, true));

/**
 * Builds Typescript files. Add your settings for each Javascript file that should be built separately.
 */
async function jsInit(watch) {
    const list = [
        {
            pkg: getBrowserify('src/js/page3/page3.js', false),
            filename: 'page3.js',
            dist: 'dist/js/page3',
        },
        {
            pkg: getBrowserify('src/js/page4/page4.js', false),
            filename: 'page4.js',
            dist: 'dist/js/page4',
        },
    ];
    processScripts(list, watch, false);
}

function getBrowserify(entries, ts) {
    const bro = browserify({
        basedir: '.',
        ignoreWatch: ['**\/node_modules\/**'],
        debug: true,
        entries: entries,
        cache: {},
        packageCache: {}
    });
    
    let babelifyCfg = {
        presets: ['@babel/preset-env'],
        plugins: [
            "@babel/plugin-proposal-class-properties",
        ]
    };
    
    if (ts) {
        bro.plugin(tsify);
        babelifyCfg.extensions = ['.ts'];
    }
    
    return bro.transform('babelify', babelifyCfg);
}

async function bundle() {
    return this.pkg.bundle()
        .on('error', (error) => {
            console.error(error.toString());
        })
        .pipe(source(this.filename))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(gulp.dest(this.dist))
        .pipe(sourcemaps.write('./'))
        .pipe(filter('**/!(*.map)*.js'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(this.dist));
}

function processScripts(list, watch, ts) {
    const tasks = [];
    for (let i = 0; i < list.length; i++) {
        const task = `build-${ts ? 'ts' : 'js'}: filename - ${list[i].filename}`;
        const preparedBundle = bundle.bind(list[i]);
        if (watch) {
            watchify(list[i].pkg)
                .on('update', preparedBundle)
                .on("time", (timeMs) => {
                    const date = new Date();
                    pad = (val) => val < 10 ? '0' + val : val;
                    console.log(`[${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}] Finished: ${list[i].filename} ${timeMs}ms`);
                });
            ;
        }
        gulp.task(task, preparedBundle);
        tasks.push(task);
    }
    gulp.parallel(tasks)();
}