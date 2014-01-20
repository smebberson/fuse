"use strict";

var fuse = require('../lib/fuse'),
	debugContent = require('debug')('fuse:content'),
	debugContentDetail = require('debug')('fuse:content-detail'),
	debugFile = require('debug')('fuse:file');

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
		// an object with updated, and fused is returned
		debugContent('Fused %s', relativePath);
		callback(null, results.updated);
	});

	fuser.on('nofuse', function (results) {
		// only the original content is returned
		debugContent('Fused (no content) %s', relativePath);
		callback(null, results.updated);
	});

	fuser.on('error', function (err) {
		debugContent('Error for %s, %s', relativePath, err);
		callback(err);
	});

	debugContent('Fusing content in %s mode', mode);
	debugContentDetail('Fuse content is\n%s', content);
	fuser.fuseContent(content, relativePath, mode);

};

exports.fuseFile = function (input, output, callback) {

	// arguments: input, output, compress, mangle, lint
	var fuser = fuse.fuse(input, output);

	fuser.on('fuse', function (results) {
		debugFile('Fused and generated %s', output);
		callback(null, results);
	});

	fuser.on('nofuse', function (results) {
		debugFile('Fused and generated (not content) %s', output);
		callback(null, results);
	});

	fuser.on('error', function (err) {
		debugFile('Error for %s, %s', output, err);
		callback(err);
	});

	// fuse the file, and the thrown events will take care of process exit
	debugFile('Fusing file (input: %s, output:%s)', input, output);
	fuser.fuseFile();

};