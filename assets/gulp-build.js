'use strict';

/**
 * Gulp build file.
 *
 * Provides exported function to be used in a gulpfile.js. Used to separate file configurations from gulpfile.js
 * implementation logic.
 *
 */

/**
 * Returns list of objects used in build-scss gulp task.
 *
 * @returns {*[]}
 */
exports.getScssFiles = () => {
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

    return list;
};

/**
 * Returns list of objects used in build-ts, watch-ts gulp tasks.
 *
 * @returns {*[]}
 */
exports.getTsFiles = () => {
    const list = [
        {
            src: 'src/ts/page1/page1.ts',
            dist: 'dist/js/page1/page1.js',
        },
        {
            src: 'src/ts/page2/page2.ts',
            dist: 'dist/js/page2/page2.js',
        },
    ];

    return list;
};

/**
 * Returns list of objects used in build-js, watch-js gulp tasks.
 *
 * @returns {*[]}
 */
exports.getJsFiles = () => {
    const list = [
        {
            src: 'src/js/page3/page3.js',
            dist: 'dist/js/page3/page3.js',
        },
        {
            src: 'src/js/page4/page4.js',
            dist: 'dist/js/page4/page4.js',
        },
    ];

    return list;
};