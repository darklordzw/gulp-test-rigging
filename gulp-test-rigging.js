const exec = require('child_process').exec;
const fs = require('fs');
const mkdirp = require('mkdirp');
const plugins = require('gulp-load-plugins')();
const defaults = require('lodash.defaults');

module.exports = function (gulp, config) {
	// Set config defaults.
	config = config || {};
	defaults(config,
		{
			paths: {}
		},
		{ lintReporter: 'checkstyle' },
		{ lintOutputDir: './lint-results' },
		{ lintOutputFile: 'results.xml' },
		{ testOutputDir: './test-results' },
		{ testOutputFile: 'results.xml' },
		{ coverageReporter: 'mocha-jenkins-reporter' },
		{ coverageOutputFormat: ['cobertura'] }
	);

	config.paths.src = config.paths.src || ['app.js'];
	config.paths.test = config.paths.test || ['test/**/*spec.js', 'test/**/*test.js'];
	config.paths.lint = [].concat(config.paths.src, config.paths.test);

	/**
	 * Runs run-lint linter on source code
	 * and prints a report.
	 *
	 * `gulp run-lint`
	 */
	gulp.task('run-lint', () =>
		gulp.src(config.paths.lint)
			.pipe(plugins.xo())
			.pipe(plugins.xo.format())
			.pipe(plugins.xo.failAfterError())
	);

	/**
	 * Runs run-lint linter on source code
	 * and prints a report that can be consumed by Jenkins.
	 *
	 * `gulp run-lint-jenkins`
	 */
	gulp.task('run-lint-jenkins', () => {
		const params = [].concat(config.paths.lint, ['--reporter=' + config.lintReporter])
			.join(' ');
		exec('xo ' + params, (err, stdout) => { // eslint-disable-line handle-callback-err
			// Make sure the output directory exists.
			mkdirp(config.lintOutputDir, (err) => {
				if (err) {
					return console.error(err);
				}

				fs.writeFile(config.lintOutputDir + '/' + config.lintOutputFile, stdout, (err) => {
					if (err) {
						return console.error(err);
					}
				});
			});
		});
	});

	/**
	 * Runs unit tests and prints out
	 * a report.
	 *
	 * `gulp run-tests`
	 */
	gulp.task('run-tests', (cb) => {
		process.env.NODE_ENV = 'test';
		gulp.src(config.paths.src)
			.pipe(plugins.istanbul())
			.pipe(plugins.istanbul.hookRequire())
			.on('finish', () => {
				gulp.src(config.paths.test)
					.pipe(plugins.mocha())
					.pipe(plugins.istanbul.writeReports({
						reporters: ['text', 'text-summary']
					}))
					.on('end', () => {
						cb();
						process.exit();
					});
			});
	});

	/**
	 * Runs unit tests and prints out
	 * a report.
	 *
	 * `gulp run-tests-jenkins`
	 */
	gulp.task('run-tests-jenkins', (cb) => {
		process.env.NODE_ENV = 'test';
		gulp.src(config.paths.src)
			.pipe(plugins.istanbul())
			.pipe(plugins.istanbul.hookRequire())
			.on('finish', () => {
				gulp.src(config.paths.test)
					.pipe(plugins.mocha({
						reporter: config.coverageReporter,
						reporterOptions: {
							junit_report_path: config.testOutputDir + '/' + config.testOutputFile // eslint-disable-line camelcase
						}
					}))
					.pipe(plugins.istanbul.writeReports({
						reporters: config.coverageOutputFormat
					}))
					.on('end', () => {
						cb();
						process.exit();
					});
			});
	});

	/**
	 * Lints source code and runs test suite.
	 *
	 * `gulp validate`
	 */
	gulp.task('validate', ['run-lint', 'run-tests']);

	/**
	 * Lints source code and runs test suite.
	 *
	 * `gulp validate-jenkins`
	 */
	gulp.task('validate-jenkins', ['run-lint-jenkins', 'run-tests-jenkins']);

	/**
	 * Watches sources and runs linter on
	 * changes.
	 *
	 * `gulp watch`
	 */
	gulp.task('watch-lint', () => gulp.watch(config.paths.lint, ['run-lint']));

	/**
	 * Watches sources and runs linter on
	 * changes.
	 *
	 * `gulp watch`
	 */
	gulp.task('watch-tests', () => gulp.watch(config.paths.src, ['run-tests']));

	/**
	 * Watches sources and runs both linter and tests on
	 * changes.
	 *
	 * `gulp watch`
	 */
	gulp.task('watch-validate', () => gulp.watch(config.paths.lint, ['run-validate']));
};
