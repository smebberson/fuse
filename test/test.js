var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var child;

describe('Using fuse', function () {

	describe('on the command line', function () {

		describe('with javascript', function () {

			describe('should fuse two files', function () {

				it('by @depends', function (done) {

					exec('fuse -i ' + process.cwd() + '/test/javascript/src/depends/basic-depends.js -o ' + process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/depends/basic-depends-result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/depends/basic-depends-output.js');
						
						// we're done
						done();

					});

				});

				it('by @import', function (done) {

					exec('fuse -i ' + process.cwd() + '/test/javascript/src/import/basic-import.js -o ' + process.cwd() + '/test/javascript/result/import/basic-import-output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/import/basic-import-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/import/basic-import-result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/import/basic-import-output.js');
						
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

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/twoDepends/output.js');
						
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

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html');
						
						// we're done
						done();

					});

				});

				it('by <!-- @import -->', function (done) {

					exec('fuse -i ' + process.cwd() + '/test/html/src/import/basic-import.html -o ' + process.cwd() + '/test/html/result/import/basic-import-output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/import/basic-import-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/import/basic-import-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/import/basic-import-output.html');

						// we're done
						done();

					});

				});

			});

			describe('should fuse multiple files', function () {

				it('with two depends', function (done) {

					exec('fuse -i ' + process.cwd() + '/test/html/src/twoDepends/input.html -o ' + process.cwd() + '/test/html/result/twoDepends/output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/twoDepends/output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/twoDepends/result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/twoDepends/output.html');

						// we're done
						done();

					});

				});

			});

		});

	});

	describe('as a module', function () {

		describe('with html', function () {

			it('should fuse content', function (done) {

				var fuse = require('../lib');
				var content = "<p>html first</p><!-- @depends depends.html --><p>html end</p>";
				var expected = "<p>html first</p><p>content from depends.html</p><p>html end</p>";

				fuse.fuseContent(content, path.resolve(__dirname, 'module', 'depends'), 'html', function (err, result) {

					assert.equal(expected, result);

					done(err);

				});

			});

		});

	});

});
