var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var plugins = require('gulp-load-plugins')();
var defaults = require('lodash.defaults');

module.exports = function (gulp, config) {
    // Set config defaults.
    config = config || {};
    defaults(config,
        {
            paths: {
                src: ['app.js'],
                test: ['test/**/*spec.js', 'test/**/*test.js']
            }
        },
        {lintReporter: 'checkstyle'},
        {lintOutputDir: './lint-results'},
        {lintOutputFile: 'results.xml'},
        {testOutputDir: './test-results'},
        {testOutputFile: 'results.xml'},
        {coverageReporter: 'mocha-jenkins-reporter'},
        {coverageOutputFormat: ['cobertura']}
    );

    /**
     * Runs run-lint linter on source code
     * and prints a report.
     *
     * `gulp run-lint`
     */
    gulp.task('run-lint', () =>
        gulp.src([].concat(config.paths.src, config.paths.test))
            .pipe(plugins.xo())
    );

    /**
     * Runs run-lint linter on source code
     * and prints a report that can be consumed by Jenkins.
     *
     * `gulp run-lint-jenkins`
     */
    gulp.task('run-lint-jenkins', () => {
        var params = [].concat(config.paths.src, config.paths.test, ['--reporter=' + config.lintReporter])
            .join(' ');
        exec('xo ' + params, function (err, stdout) {
            if (err) {
                return console.error(err);
            }

            // Make sure the output directory exists.
            mkdirp(config.lintOutputDir, function (err) {
                if (err) {
                    return console.error(err);
                }

                fs.writeFile(config.lintOutputDir + '/' + config.lintOutputFile, stdout, function (err) {
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
            .on('finish', function () {
                gulp.src(config.paths.test)
                    .pipe(plugins.mocha())
                    .pipe(plugins.istanbul.writeReports({
                        reporters: ['text', 'text-summary']
                    }))
                    .on('end', cb);
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
            .on('finish', function () {
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
                    .on('end', cb);
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
    gulp.task('watch', () => gulp.watch(config.paths.src, ['validate']));
};
