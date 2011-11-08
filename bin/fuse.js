#!/usr/bin/env node

var fs = require('fs');
var _ = require('underscore');
var argv = require('optimist').usage('Usage: $0 -i [javascript-file.js] -o [javascript-file.js]').demand(['i', 'o']).argv;

// define the regular expression
var dependsRe = /\/\/ ?@depends (.+)\b/gi;

// first thing, let's parse the input file
fs.readFile(argv.i, 'ascii', function (err, data) {
	
	var matches = [];
	var output = data;
	var relativePath;;
	
	if (err) {
		console.log('Unable to read input file %s', argv.i);
		process.exit(1);
	}
	
	relativePath = fs.realpathSync(argv.i).replace(/(.+)?\/(.+)/i, '$1/');
	matches = data.match(dependsRe);
	
	// do we have anything to combine?
	if (!matches) {
		console.log('All done, there was nothing to combine.');
		process.exist(0);
	}
	
	// loop through each match, grab the contents
	_.each(matches, function (match) {
		
		// ok, determine the file name
		var fileContent;
		var filename = match.replace(dependsRe, '$1');
		var filepath = relativePath + filename;
		var bFile = false;
		
		
		// ok, determine the path (relative to the initial input script)
		
		try {
			bFile = fs.statSync(filepath).isFile();
		} catch (e) {
		}
		
		// if the file existed, load in the content and update the output
		if (bFile) {
			
			// let's load in the file
			fileContent = fs.readFileSync(filepath, 'ascii');
			
			// let's replace the match with the filecontent
			output = output.replace(match, fileContent);
			
		}
		
	});
	
	fs.writeFile(argv.o, output, function (err) {
		if (err) {
			console.log('Failed to write to file.');
			process.exist(1);
		} else {
			console.log('Completed.');
			process.exit();
		}
	});
	
});