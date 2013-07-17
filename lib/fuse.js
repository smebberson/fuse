(function () {

"use strict";

var colors = require('colors');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var ujs = require('uglify-js');
var jshint = require('jshint').JSHINT;
var sys = require('sys');
var mustache = require('./mustache.js');

var fuse = exports;

// regular expression to find referenced files
fuse.re = fuse.reJS = /\/\/ ?@(?:depends|import) (.+)\b/gi;
fuse.reHTML = /<!--\s?@(?:depends|import)\s(.+?)\s?-->/gi;

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

	// what mode are we running in, HTML or JS?
	var mode = path.extname(inputFile).replace(/^\./, '');
	// do we need to compress (js only)?
	var compress = (arguments.length > 2) ? arguments[2] && mode === 'js' : false;
	// do we need to mangle (js only)?
	var mangle = (arguments.length > 3) ? arguments[3] && mode === 'js' : false;
	// do we need to run the files through JSHint (js only)?
	var lint = (arguments.length > 4) ? arguments[4] && mode === 'js' : false;
	// exit will be true, if we're not watching files
	var exit = (arguments.length === 6) ? arguments[5] : true;
	// swtich the regular expression based on mode
	this.re = (mode === 'js') ? this.reJS : this.reHTML;
	// grab the content of the input file
	var content = fuse.loadFile(inputFile);
	// grab a list of the referenced files
	var matches = fuse.getReferencedFiles(content, this.re);
	// determine the relative path we need to work from
	var relativePath = path.dirname(path.normalize(inputFile));
	// output is a version of the content that we'll update
	var output = content;
	// uglify-js2 variables
	var ast = null;
	var compressedAst = null;
	var compressor = null;
	var lintResult = null;
	var lintData = {};

	// are we linting?
	// if so, ling the input file
	if (lint) {
		lintData[path.basename(inputFile)] = fuse.lintFile(content);
	}

	// do we have anything to combine?
	if (!matches.length) {		

		// run the lint report if required
		if (lint) fuse.lintReport(lintData);

		// report that there was nothing to do
		console.log('The output file wasn\'t generated as there was nothing to combine.'.blue + '\n');

		if (exit) {
			process.exit(0);
		}

	} else {

		// loop through each match, grab the file content
		_.each(matches, function (match) {

			// ok, determine the file name
			var fileContent;
			var filename = path.basename(match.path);
			var filepath = path.join(relativePath,match.path);
			var bFile = false;

			fileContent = fuse.loadFile(filepath);

			// let's replace the match with the filecontent
			output = output.replace(match.str, fileContent);

			// are we linting?
			// if so, lint each dependancy file
			if (lint) {
				lintData[filename] = fuse.lintFile(fileContent);
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

		// run the lint report
		if (lint) fuse.lintReport(lintData);

	}

};

fuse.fuseContent = function (content, relativePath, mode, callback) {

	// determine the regex to use, based on the mode
	var re = (mode === 'js') ? this.reJS : this.reHTML;
	// grab a list of the referenced files
	var matches = fuse.getReferencedFiles(content, re);
	// determine the relative path we need to work from
	var relativePath = path.resolve(relativePath);
	// output is a version of the content that we'll update
	var output = content;

	// loop through each match, grab the file content
	matches.forEach(function (match) {

		// ok, determine the file name
		var fileContent;
		var filename = path.basename(match.path);
		var filepath = path.join(relativePath,match.path);
		var bFile = false;

		fileContent = fuse.loadFile(filepath);

		// let's replace the match with the filecontent
		output = output.replace(match.str, fileContent);

	});

	callback(null, output);

}

fuse.lintReport = function (lintData) {

	var buffer = '';

	// loop through the linting results and output any suggestions
	for (var file in lintData) {

		// skip the files that didn't contain errors
		if (lintData[file] !== true) {

			buffer += '\n' + colors.red(file) + ' contains lint:'.red + '\n';
			for (var err in lintData[file]) {
				lintData[file][err].evidence = lintData[file][err].evidence.trim();
				buffer += mustache.render('   Error on line {{line}} at position {{character}}, {{reason}} \'' + '{{evidence}}'.magenta + '\'\n', lintData[file][err]);
			}

		}

	}

	if (buffer.length) {
		console.log(buffer + '\r');
	}

};

fuse.lintFile = function (content) {

	var lintResult = jshint(content);
	return lintResult || jshint.errors;

};

// watch the input file for changes, if it does, we need to compile a new output file
fuse.watchFile = function (inputFile, outputFile, compress, mangle, lint) {
	
	var inputFileName = path.basename(inputFile);
	
	fs.watchFile(inputFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(( inputFileName ) + ' changed ------------'));
			fuse.fuseFile(inputFile, outputFile, compress, mangle, lint, false);
		}
		
	});
	
};

// watch a referenced file for changes, if it does, we need to compile a new output file
fuse.watchSrcFile = function (srcFile, inputFile, outputFile, compress, mangle, lint) {
	
	var srcFileName = path.basename(srcFile);
	
	fs.watchFile(srcFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(srcFileName + ' changed ------------'));
			fuse.fuseFile(inputFile, outputFile, compress, mangle, lint, false);
		}
		
	});
	
};

// read the file and grab the content
// because it's the input file, simple output any errors and quit
fuse.loadFile = function (file) {

	var bFile = false;

	try {
		bFile = fs.statSync(file).isFile();
	} catch (e) {
		return '';
	}

	// if the file exists, load in the content and update the output
	if (bFile) return fuse.getFileContent(file);
	
};

// we assume this file has been verified by loadFile
fuse.getFileContent = function (file) {

	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (e) {
		return '';
	}

}

// get a list of the files to include, from the input file
fuse.getReferencedFiles = function (content, regex) {
	
	var paths = [];
	var matches = content.match(regex);
	
	_.each(matches, function (match) {

		// ok, determine the file name
		var filepath = match.replace(regex, '$1');

		// return the filepath, and the original string
		paths.push({'path': filepath, "str": match});

	});
	
	return paths;
	
};

// return only the filename, removing the actual file path
fuse.getFileName = function (path) {
	return path.replace(/.*\/(.*)/i, '$1');
};

}());