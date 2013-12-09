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

	fuser = new Fuse();

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

}