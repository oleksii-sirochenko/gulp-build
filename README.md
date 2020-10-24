# Gulp build

Version 1.1.1

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
#### 4. Install required packages (one line):
```
npm install --save-dev gulp-sass gulp-autoprefixer gulp-clean-css gulp-plumber gulp-notify gulp-rename del gulp-filter typescript gulp@4.0.0 browserify tsify watchify vinyl-source-stream gulp-uglify vinyl-buffer gulp-sourcemaps babelify babel-core babel-preset-env @babel/plugin-proposal-class-properties @babel/plugin-transform-modules-commonjs gulp-append-prepend eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin ts-lint
```

#### 5. Configure gulpfile.js. You can change paths to files, folders. Add different TS or JS files to separate compiling.

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

Copyright (c) Aleksey Sirochenko https://github.com/alex-2077/

MIT License https://opensource.org/licenses/MIT