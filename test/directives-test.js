var vows = require('vows');
var assert = require('assert');
var exec = require('child_process').exec;
var child;

/* vows.describe('Using fuse').addBatch({
	'should allow fusing': {
		topic: function () {
			return true;
		},
		'by @import statement': function (topic) {
			assert.isTrue(topic);
		},
		'by @depends statement': function (topic) {
			assert.isTrue(topic);
		}
	}
}).export(module); */

child = exec('fuse -i ' + process.cwd() + '/test/src/import/basic-import.js -o ' + process.cwd() + '/test/result/import/basic-import-output.js', function (error, stdout, stderr) {
	console.log('stdout: ' + stdout);
	console.log('stderr: ' + stderr);
	if (error) console.log('exec error: ' + error);
});
