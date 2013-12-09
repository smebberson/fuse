#!/usr/bin/env node

"use strict";

var colors = require('colors');
var _ = require('underscore');
var argv = require('optimist').usage('\nFuse JavaScript or HTML files.\n\nUsage: $0 -i [input-file.(js|html)] -o [output-file.(js|html)] (-w) (-c) (-m) (-l)').demand(['i', 'o']).describe('i', 'Input file').describe('o', 'Output file').describe('w', 'Watch the input file for changes.').describe('c', 'Compress the output using UglifyJS2 (JavaScript only).').describe('m', 'Mangle the output using UglifyJS2. (JavaScript only)').describe('l', 'Lint the JavaScript using JSHint (JavaScript only)').argv;
var fuse = require('../lib/fuse');
var path = require('path');
var fuser;

if (argv.w) {

	// arguments: input, output, compress, mangle, lint
	fuser = fuse.fuse(argv.i, argv.o, argv.c, argv.m, argv.l);

	fuser.on('watch', function (file) {
		console.log('Watching ' + colors.cyan(file) + ' for changes.');
	});

	fuser.on('unwatch', function (file) {
		console.log('No longer watching ' + colors.cyan(file) + ' for changes.');
	});

	fuser.on('fuse', function (results) {
		console.log('Updated ' + colors.green(results.updated) + ', fusing ' + results.fused.length + ' files @ ' + colors.green(fuser.formatTime()) + '.\n');
	});

	fuser.on('nofuse', function () {
		console.log('The output file wasn\'t generated as there was nothing to combine.'.blue + '\n');
	});

	fuser.on('error', function (err) {
		console.log(colors.red('There was an error while fusing: ' + err));
	});

	fuser.on('change', function (inputFileName) {
		console.log(colors.blue(( inputFileName ) + ' changed ------------'));
	});

	fuser.on('lint', function (l) {
		console.log(l);
	});

	// let's start watching the files and fuse immediately too
	fuser.watch(true);
	
} else {

	// arguments: input, output, compress, mangle, lint
	fuser = fuse.fuse(argv.i, argv.o, argv.c, argv.m, argv.l);

	fuser.on('fuse', function (results) {
		console.log('Updated ' + colors.green(results.updated) + ', fusing ' + results.fused.length + ' files @ ' + colors.green(fuser.formatTime()) + '.\n');
		process.exit();
	});

	fuser.on('nofuse', function () {
		console.log('The output file wasn\'t generated as there was nothing to combine.'.blue + '\n');
		process.exit();
	});

	fuser.on('error', function (err) {
		console.log(colors.red('There was an error while fusing: ' + err));
		process.exit(1);
	});

	// fuse the file, and the thrown events will take care of process exit
	fuser.fuseFile();

}
