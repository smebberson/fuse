#!/usr/bin/env node

var colors = require('colors');
var fs = require('fs');
var _ = require('underscore');
var argv = require('optimist').usage('Usage: $0 -i [javascript-file.js] -o [javascript-file.js] (-w)').demand(['i', 'o']).describe('i', 'JavaScript input file').describe('o', 'JavaScript output file').describe('w', 'Watch the input file for changes.').argv;
var fuse = require('../lib/fuse');
var path = require('path');

if (argv.w) {
	
	// let's grab each file that we need to watch
	var a = fuse.getReferencedFiles(fuse.getFileContent(argv.i));
	var relativePath = path.dirname(argv.i);
	
	// loop through an setup a watch on each referenced file
	_(a).each(function (path) {
		fuse.watchSrcFile(relativePath + path.path, argv.i, argv.o);
		console.log('Watching ' + colors.cyan( path.path ) + ' for changes.');
	});
	
	// we also need to watch the input file
	fuse.watchFile(argv.i, argv.o);
	console.log('Watching ' + colors.cyan( argv.i ) + ' for changes.\nCTRL + C to stop.');
	
} else {

	// assume we're not watching a file, let's just package!
	fuse.fuseFile(argv.i, argv.o);

}
