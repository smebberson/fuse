var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');
var child;

describe('Using fuse', function () {

	describe('should fuse two files', function () {

		it('by @depends', function (done) {

			exec('fuse -i ' + process.cwd() + '/test/src/depends/basic-depends.js -o ' + process.cwd() + '/test/result/depends/basic-depends-output.js', function (error, stdout, stderr) {

				// check the output against the expected output
				assert.equal(fs.readFileSync(process.cwd() + '/test/result/depends/basic-depends-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/expected/depends/basic-depends-result.js', 'utf-8'));

				// we're done
				done();

			});

		});

		it('by @import', function (done) {

			exec('fuse -i ' + process.cwd() + '/test/src/import/basic-import.js -o ' + process.cwd() + '/test/result/import/basic-import-output.js', function (error, stdout, stderr) {

				// check the output against the expected output
				assert.equal(fs.readFileSync(process.cwd() + '/test/result/import/basic-import-output.js', 'utf-8'), fs.readFileSync(process.cwd() + '/test/expected/import/basic-import-result.js', 'utf-8'));

				// we're done
				done();

			});

		});

	});

});
