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
    gulp.series('build-ts', 'build-scss')();
});

/**
 * Processes SCSS files to CSS, creates sourcemap for CSS, creates minified file of CSS.
 */
gulp.task('build-scss', async () => {
    const list = [
        'src/scss/style.scss',
        'src/scss/admin-style.scss',
    ];
    
    for (let i = 0; i < list.length; i++) {
        gulp.src(list[i])
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
            .pipe(gulp.dest('dist/css'))
            .pipe(filter('**/!(*.map)*.css'))
            .pipe(cleanCSS())
            .pipe(rename({suffix: '.min'}))
            .pipe(gulp.dest('dist/css'));
    }
});

/**
 * Watches SCSS folder for changes and invokes 'build-scss' task to process SCSS files.
 */
gulp.task('watch-scss', () => {
    gulp.series('build-scss')();
    gulp.watch('src/scss/**/*.scss', gulp.series('build-scss'));
});

gulp.task('build-ts', scriptsInit.bind(null, false));
gulp.task('watch-ts', scriptsInit.bind(null, true));

/**
 * Builds typescript files. Add your settings for each typescript file that should be built separately.
 */
async function scriptsInit(watch) {
    const list = [
        {
            pkg: getBrowserify('src/ts/page1/page1.ts'),
            filename: 'page1.js',
            dist: 'dist/js/page1',
        },
        {
            pkg: getBrowserify('src/ts/page2/page2.ts'),
            filename: 'page2.js',
            dist: 'dist/js/page2',
        },
    ];
    processScripts(list, watch);
}

function getBrowserify(entries) {
    return browserify({
        basedir: '.',
        ignoreWatch: ['**\/node_modules\/**'],
        debug: true,
        entries: entries,
        cache: {},
        packageCache: {}
    })
        .plugin(tsify)
        .transform('babelify', {
            presets: ['env'],
            extensions: ['.ts']
        });
}

function bundle() {
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

function processScripts(list, watch) {
    const tasks = [];
    for (let i = 0; i < list.length; i++) {
        const task = `build-ts: filename - ${list[i].filename}`;
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

