# gulp-test-rigging
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://github.com/darklordzw/gulp-test-rigging/blob/master/LICENSE)

Simple Node.js library to simplify generating reports on unit tests, code-coverage, and code styling locally and in files consumable by [Jenkins][5]. Uses [mocha][1], [istanbul][2], and [xo][3].

## Install

```sh
npm install --save gulp-test-rigging
```

## Usage
To use the module, simply require it in your gulpfile.js after "gulp" and pass "gulp" as a parameter.

```js
var gulp = require('gulp');
require('gulp-test-rigging')(gulp);

gulp.task('default', ['validate']);
```

This adds the following tasks to your gulpfile:

* run-lint - Runs xo on your source files and prints results to the console.
* run-lint-jenkins - Runs xo on your source files and outputs the results to a file.
* run-tests - Runs mocha and istanbul, printing results to the console.
* run-tests-jenkins - Runs mocha and istanbul, outputting the results for each to files.
* validate - Runs both "run-lint" and "run-tests".
* validate-jenkins - Runs both "run-lint-jenkins" and "run-tests-jenkins".
* watch - Runs "validate" as a Gulp watch task.

## Options
Options may be passed to the module following the "gulp" parameter in the require statement. The following lists the available options and their default values:

```js
{
	paths: {
		src: ['app.js'],
		test: ['test/**/*spec.js', 'test/**/*test.js']
	},
	lintReporter: 'checkstyle',
	lintOutputDir: './lint-results',
	lintOutputFile: 'results.xml',
	testOutputDir: './test-results',
	testOutputFile: 'results.xml',
	coverageReporter: 'mocha-jenkins-reporter',
	coverageOutputFormat: ['cobertura']
}
```

## License
Licensed under the [MIT][4] license.

[1]: https://github.com/mochajs/mocha
[2]: https://github.com/gotwarlost/istanbul
[3]: https://github.com/sindresorhus/xo
[4]: ./LICENSE
[5]: https://jenkins.io/
