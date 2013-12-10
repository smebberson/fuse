"use strict";

var fuse = require('../lib/fuse');

exports.fuseContent = function (content, relativePath, mode, callback) {

	var content = content || '',
		path = path || '',
		mode = mode || 'js',
		fuser;

	// check we have content
	if (!content.length) return callback(null, content);

	// check we have a path
	if (!relativePath.length) return callback(new Error('No relative path was supplied.'));

	fuser = new fuse.Fuse();

	fuser.on('fuse', function (results) {
		callback(null, results);
	});

	fuser.on('nofuse', function () {
		callback(null, results);
	});

	fuser.on('error', function (err) {
		callback(err);
	});

	fuser.fuseContent(content, relativePath, mode);

};

exports.fuseFile = function (input, output, callback) {

	// arguments: input, output, compress, mangle, lint
	var fuser = fuse.fuse(input, output);

	fuser.on('fuse', function (results) {
		callback(null, results);
	});

	fuser.on('nofuse', function () {
		callback(null, results);
	});

	fuser.on('error', function (err) {
		callback(err);
	});

	// fuse the file, and the thrown events will take care of process exit
	fuser.fuseFile();

};