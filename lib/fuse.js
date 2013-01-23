"use strict";

var colors = require('colors');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var ujs = require('uglify-js');

var fuse = exports;

// regular expression to find referenced files
fuse.re = /\/\/ ?@(?:depends|import) (.+)\b/gi;

fuse.formatTime = function () {

	var d = new Date();

	return [
		d.getHours(),
		':',
		d.getSeconds(),
		'.',
		d.getSeconds()
	].join('');

};

// core function for parsing and outputing a fused file
// optional arguments: compress, mangle, exit
fuse.fuseFile = function (inputFile, outputFile) {

	// do we need to compress?
	var compress = (arguments.length > 2) ? arguments[2] : false;
	// do we need to mangle?
	var mangle = (arguments.length > 3) ? arguments[3] : false;
	// exit will be true, if we're not watching files
	var exit = (arguments.length === 5) ? arguments[4] : true;
	// grab the content of the input file
	var content = fuse.getFileContent(inputFile);
	// grab a list of the referenced files
	var matches = fuse.getReferencedFiles(content);
	// determine the relative path we need to work from
	var relativePath = path.dirname(path.normalize(inputFile));
	// output is a version of the content that we'll update
	var output = content;
	// uglify-js2 variables
	var ast = null;
	var compressedAst = null;
	var compressor = null;

	// do we have anything to combine?
	if (!matches.length) {
		console.log('All done, there was nothing to combine (output file was not generated).'.blue);
		if (exit) {
			process.exit(0);
		}
	}

	// loop through each match, grab the file content
	_.each(matches, function (match) {

		// ok, determine the file name
		var fileContent;
		var filepath = path.join(relativePath,match.path);
		var bFile = false;

		try {
			bFile = fs.statSync(filepath).isFile();
		} catch (e) {
		}

		// if the file exists, load in the content and update the output
		if (bFile) {

			// let's load in the file
			fileContent = fs.readFileSync(filepath, 'ascii');

			// let's replace the match with the filecontent
			output = output.replace(match.str, fileContent);

		}

	});

	// use uglify-js2 to minify the code if arguments are present
	if (compress || mangle) {

		// setup the compressor
		compressor = ujs.Compressor({warnings: false});

		// parse the output and create an AST
		ast = ujs.parse(output);

		// should we compress?
		if (compress) {
			ast.figure_out_scope();
			compressedAst = ast.transform(compressor);
		}

		// should we mangle?
		if (mangle) {
			(compressedAst || ast).figure_out_scope();
			(compressedAst || ast).compute_char_frequency();
			(compressedAst || ast).mangle_names();
		}

		// generate the new code string
		output = (compressedAst || ast).print_to_string();

	}
	
	// save the file to disk
	fs.writeFile(outputFile, output, function (err) {
		if (err) {
			console.log('Failed to write to file.'.red);
			process.exit(1);
		} else {
			console.log('Updated ' + colors.green(outputFile) + ', fusing ' + (matches.length+1) + ' files @ ' + colors.green(fuse.formatTime()) + '.\n');
			if (exit) {
				process.exit();
			}
		}
	});

};

// watch the input file for changes, if it does, we need to compile a new output file
fuse.watchFile = function (inputFile, outputFile, compress, mangle) {
	
	var inputFileName = path.basename(inputFile);
	
	fs.watchFile(inputFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(( inputFileName ) + ' changed.'));
			fuse.fuseFile(inputFile, outputFile, compress, mangle, false);
		}
		
	});
	
};

// watch a referenced file for changes, if it does, we need to compile a new output file
fuse.watchSrcFile = function (srcFile, inputFile, outputFile) {
	
	var srcFileName = path.basename(srcFile);
	
	fs.watchFile(srcFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(srcFileName + ' changed.'));
			fuse.fuseFile(inputFile, outputFile, false);
		}
		
	});
	
};

// read the file and grab the content
// because it's the input file, simple output any errors and quit
fuse.getFileContent = function (inputFile) {
	
	try {
		return fs.readFileSync(inputFile, 'utf-8');
	} catch (e) {
		console.log('Unable to read input file %s'.red, inputFile);
		process.exit(1);
	}
	
};

// get a list of the files to include, from the input file
fuse.getReferencedFiles = function (content) {
	
	var paths = [];
	var matches = content.match(fuse.re);
	
	_.each(matches, function (match) {

		// ok, determine the file name
		var filepath = match.replace(fuse.re, '$1');

		// return the filepath, and the original string
		paths.push({'path': filepath, "str": match});

	});
	
	return paths;
	
};

// return only the filename, removing the actual file path
fuse.getFileName = function (path) {
	return path.replace(/.*\/(.*)/i, '$1');
};
