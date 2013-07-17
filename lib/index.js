"use strict";

var fuse = require('../lib/fuse');

exports.fuseContent = function (content, relativePath, mode, callback) {

	var content = content || '';
	var path = path || '';
	var mode = mode || 'js';

	// check we have content
	if (!content.length) return callback(null, content);

	// check we have a path
	if (!relativePath.length) return callback(new Error('No relative path was supplied.'));

	// now we can get started, proxy this function off to the main one within fuse itself
	fuse.fuseContent(content, relativePath, mode, function (err, result) {

		if (err) return callback(err);

		return callback(null, result);

	});

}