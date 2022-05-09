# Gulp build

Version 1.3.2

This repository will be useful if you are going to build a small-medium tier project and you want to write your frontend in Typescript or modern Javascript with SCSS styling.

Gulp config fits very good with Wordpress project. You don't have to deal with Webpack and you can start development quickly.

#### 1. Open terminal.

#### 2. We need to start a project, step into desired directory and execute:
```
npm init
```

#### 3.Install gulp-cli if you don't have one:
```
npm install -g gulp-cli
```
#### 4. Install required packages (copy as one line):
```
npm install --save-dev gulp-sass@5.1.0 gulp-autoprefixer@8.0.0 gulp-clean-css@4.3.0 gulp-plumber@1.2.1 gulp-rename@2.0.0 del@6.0.0 gulp-filter@7.0.0 typescript@4.6.3 gulp@4.0.2 browserify@17.0.0 tsify@5.0.4 watchify@3.11.1 vinyl-source-stream@2.0.0 gulp-uglify@3.0.2 vinyl-buffer@1.0.1 gulp-sourcemaps@3.0.0 babelify@10.0.0 @babel/core@7.17.8 @babel/preset-env@7.16.11 @babel/plugin-proposal-class-properties@7.16.7 @babel/plugin-transform-modules-commonjs@7.17.7 @babel/plugin-transform-runtime@7.17.0 gulp-append-prepend@1.0.9 eslint@8.11.0 @typescript-eslint/parser@5.16.0 @typescript-eslint/eslint-plugin@5.16.0

```

#### 5. Configure gulpfile.js, gulp-build.js. You can change paths to files, folders. Add different TS or JS files to separate compiling.

#### 6. Use available Gulp tasks to build your frontend project.
```
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
 ```

#### Useful links:
https://www.typescriptlang.org/docs/handbook/gulp.html

Copyright (c) Oleksii Sirochenko https://github.com/oleksii-sirochenko

MIT License https://opensource.org/licenses/MIT