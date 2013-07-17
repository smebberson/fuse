var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var child;

describe('Using fuse', function () {

	describe('with javascript', function () {

		describe('should fuse two files', function () {

			it('by @depends', function (done) {

				exec('fuse -i ' + process.cwd() + '/test/javascript/src/depends/basic-depends.js -o ' + process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', function (error, stdout, stderr) {

					// check the output against the expected output
					assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/depends/basic-depends-result.js', 'utf-8'));

					// we're done
					done();

				});

			});

			it('by @import', function (done) {

				exec('fuse -i ' + process.cwd() + '/test/javascript/src/import/basic-import.js -o ' + process.cwd() + '/test/javascript/result/import/basic-import-output.js', function (error, stdout, stderr) {

					// check the output against the expected output
					assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/import/basic-import-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/import/basic-import-result.js', 'utf-8'));

					// we're done
					done();

				});

			});

		});

		describe('should fuse multiple files', function () {

			it('with two depends', function (done) {

				exec('fuse -i ' + process.cwd() + '/test/javascript/src/twoDepends/input.js -o ' + process.cwd() + '/test/javascript/result/twoDepends/output.js', function (error, stdout, stderr) {

					// check the output against the expected output
					assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/twoDepends/output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/twoDepends/result.js', 'utf-8'));

					// we're done
					done();

				});

			});

		});

	});

	describe('with html', function () {

		describe('should fuse two files', function () {

			it('by <!-- @depends -->', function (done) {

				exec('fuse -i ' + process.cwd() + '/test/html/src/depends/basic-depends.html -o ' + process.cwd() + '/test/html/result/depends/basic-depends-output.html', function (error, stdout, stderr) {

					// check the output against the expected output
					assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/depends/basic-depends-result.html', 'utf-8'));

					// we're done
					done();

				});

			});

		});

	});

});
