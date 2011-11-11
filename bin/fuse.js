#!/usr/bin/env node

var argv = require('optimist').usage('Usage: $0 -i [javascript-file.js] -o [javascript-file.js]').demand(['i', 'o']).argv;
var fuse = require('../lib/fuse');

if (argv.w) {
	
	fuse.watchFile(argv.i, argv.o);
	
} else {

	// assume we're not watching a file, let's just package!
	fuse.readFile(argv.i, argv.o);

}