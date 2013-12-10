var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var child;
var fuse = path.resolve(process.cwd(), 'bin', 'fuse.js');

describe('Using fuse', function () {

	describe('on the command line', function () {

		describe('with javascript', function () {

			before(function (done){
				// make the directory first to hold the result content
				fs.mkdir(process.cwd() + '/test/javascript/result/', done);
			});

			after(function (done) {
				// remove the result directory
				fs.rmdir(process.cwd() + '/test/javascript/result/', done);
			});

			describe('should fuse two files', function () {

				it('by @depends', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/javascript/result/depends/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/javascript/src/depends/basic-depends.js -o ' + process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/depends/basic-depends-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/depends/basic-depends-result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/depends/basic-depends-output.js');
						fs.rmdirSync(process.cwd() + '/test/javascript/result/depends/');
						
						// we're done
						done();

					});

				});

				it('by @import', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/javascript/result/import/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/javascript/src/import/basic-import.js -o ' + process.cwd() + '/test/javascript/result/import/basic-import-output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/import/basic-import-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/import/basic-import-result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/import/basic-import-output.js');
						fs.rmdirSync(process.cwd() + '/test/javascript/result/import/');
						
						// we're done
						done();

					});

				});

				it('by @include', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/javascript/result/include/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/javascript/src/include/basic-include.js -o ' + process.cwd() + '/test/javascript/result/include/basic-include-output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/include/basic-include-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/include/basic-include-result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/include/basic-include-output.js');
						fs.rmdirSync(process.cwd() + '/test/javascript/result/include/');
						
						// we're done
						done();

					});

				});

			});

			describe('should fuse multiple files', function () {

				it('with two depends', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/javascript/result/twoDepends/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/javascript/src/twoDepends/input.js -o ' + process.cwd() + '/test/javascript/result/twoDepends/output.js', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/javascript/result/twoDepends/output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/javascript/expected/twoDepends/result.js', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/javascript/result/twoDepends/output.js');
						fs.rmdirSync(process.cwd() + '/test/javascript/result/twoDepends/');
						
						// we're done
						done();

					});

				});

			});

		});

		describe('with html', function () {

			before(function (done){
				// make the directory first to hold the result content
				fs.mkdir(process.cwd() + '/test/html/result/', done);
			});

			after(function (done) {
				// remove the result directory
				fs.rmdir(process.cwd() + '/test/html/result/', done);
			});

			describe('should fuse two files', function () {

				it('by <!-- @depends -->', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/depends/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/html/src/depends/basic-depends.html -o ' + process.cwd() + '/test/html/result/depends/basic-depends-output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/depends/basic-depends-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/depends/');
						
						// we're done
						done();

					});

				});

				it('by <!-- @import -->', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/import/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/html/src/import/basic-import.html -o ' + process.cwd() + '/test/html/result/import/basic-import-output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/import/basic-import-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/import/basic-import-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/import/basic-import-output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/import/');

						// we're done
						done();

					});

				});

				it('by <!-- @include -->', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/include/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/html/src/include/basic-include.html -o ' + process.cwd() + '/test/html/result/include/basic-include-output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/include/basic-include-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/include/basic-include-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/include/basic-include-output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/include/');

						// we're done
						done();

					});

				});

			});

			describe('should fuse multiple files', function () {

				it('with two depends', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/twoDepends/');

					exec('node ' + fuse + ' -i ' + process.cwd() + '/test/html/src/twoDepends/input.html -o ' + process.cwd() + '/test/html/result/twoDepends/output.html', function (error, stdout, stderr) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/twoDepends/output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/twoDepends/result.html', 'utf-8'));

						// delete the file and folder
						fs.unlinkSync(process.cwd() + '/test/html/result/twoDepends/output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/twoDepends');

						// we're done
						done();

					});

				});

			});

		});

	});

	describe('as a module', function () {

		describe('with html', function () {

			before(function (done){
				// make the directory first to hold the result content
				fs.mkdir(process.cwd() + '/test/html/result/', done);
			});

			after(function (done) {
				// remove the result directory
				fs.rmdir(process.cwd() + '/test/html/result/', done);
			});

			describe('should fuse content', function () {

				it('with <!-- @depends -->', function (done) {

					var fuse = require('../lib');
					var content = "<p>html first</p><!-- @depends depends.html --><p>html end</p>";
					var expected = "<p>html first</p><p>content from depends.html</p><p>html end</p>";

					fuse.fuseContent(content, path.resolve(__dirname, 'module', 'depends'), 'html', function (err, result) {

						assert.equal(expected, result);

						done(err);

					});

				});

				it('without a directive', function (done) {

					var fuse = require('../lib');
					var content = "<p>html first</p><!-- @nodepend depends.html --><p>html end</p>";
					var expected = "<p>html first</p><!-- @nodepend depends.html --><p>html end</p>";

					fuse.fuseContent(content, path.resolve(__dirname, 'module', 'depends'), 'html', function (err, result) {

						assert.equal(expected, result);

						done(err);

					});

				});

			});

			describe('it should fuse two files', function () {

				it('by <!-- @depends -->', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/depends/');

					var fuse = require('../lib');

					fuse.fuseFile(process.cwd() + '/test/html/src/depends/basic-depends.html', process.cwd() + '/test/html/result/depends/basic-depends-output.html', function (err, result) {

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/depends/basic-depends-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/depends/basic-depends-output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/depends/');
						
						// we're done
						done();
				
					});

				});

				it('without a directive', function (done) {

					// make the directory first to hold the result content
					fs.mkdirSync(process.cwd() + '/test/html/result/noDepends/');

					var fuse = require('../lib');

					fuse.fuseFile(process.cwd() + '/test/html/src/noDepends/no-depends.html', process.cwd() + '/test/html/result/noDepends/no-depends-output.html', function (err, result) {

						assert.equal(result.updated, process.cwd() + '/test/html/result/noDepends/no-depends-output.html');

						// check the output against the expected output
						assert.equal(fs.readFileSync(process.cwd() + '/test/html/result/noDepends/no-depends-output.html', 'utf-8'), fs.readFileSync(process.cwd() + '/test/html/expected/noDepends/no-depends-result.html', 'utf-8'));

						// delete the file
						fs.unlinkSync(process.cwd() + '/test/html/result/noDepends/no-depends-output.html');
						fs.rmdirSync(process.cwd() + '/test/html/result/noDepends/');
						
						// we're done
						done();
				
					});

				});

			});

		});

	});

});