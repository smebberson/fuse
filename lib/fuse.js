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
var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Fuse (inputFile, outputFile) {

	if (inputFile === undefined) {
		throw new Error('You must define the input file.');
	}

	if (outputFile === undefined) {
		throw new Error('You must define the output file.');
	}

	this.re = this.reJS = /\/\/ ?@(?:depends|import) (.+)\b/gi;
	this.reHTML = /<!--\s?@(?:depends|import)\s(.+?)\s?-->/gi;

	this.inputFile = inputFile;
	this.outputFile = outputFile;

	// what mode are we running in, HTML or JS?
	// this needs to be improved, because it means it will only work if the file ext is 'html' || 'js'
	this.mode = path.extname(this.inputFile).replace(/^\./, '');
	// swtich the regular expression based on mode
	this.regex = (this.mode === 'js') ? this.reJS : this.reHTML;
	// not watching by default
	this.watching = false;

	// do we need to compress (js only)?
	this.compress = (arguments.length > 2 && arguments[2] !== undefined) ? arguments[2] && this.mode === 'js' : false;
	// do we need to mangle (js only)?
	this.mangle = (arguments.length > 3 && arguments[3] !== undefined) ? arguments[3] && this.mode === 'js' : false;
	// do we need to run the files through JSHint (js only)?
	this.lint = (arguments.length > 4 && arguments[4] !== undefined) ? arguments[4] && this.mode === 'js' : false;

	// create an array to hold the watches for this fuse
	this.files = [];

	return this;

}

util.inherits(Fuse, EventEmitter);

Fuse.prototype.watch = function (fuseImmediately) {

	var _this = this;
	this.watching = true;

	// retrieve a list of files to watch
	var aFiles = this.scanFiles();
	var relativePath = path.dirname(this.inputFile) + '/';

	// loop through an setup a watch on each referenced file
	_(aFiles).each(function (path) {

		_this.watchSrcFile(relativePath + path.path);
		_this.files.push(relativePath + path.path);
	});
	
	// we also need to watch the input file
	this.watchFile(this.inputFile);
	this.files.push(this.inputFile);

	if (fuseImmediately) this.fuseFile();

	return this;

};



Fuse.prototype.scanFiles = function () {

	return this.getReferencedFiles(this.getFileContent(this.inputFile), this.regex);

};

Fuse.prototype.checkReferences = function (references) {

	var _this = this,
		files = [this.inputFile],
		relativePath = path.dirname(this.inputFile) + '/';

	// find references that are missing from files (these are files that need to be watched)
	references.forEach(function (reference) {

		var found = _this.files.some(function (file) {
			return path.resolve(file) === path.resolve(reference.path);
		});

		// add the file regardless if its found or not, because we're rebulding the files array
		files.push(relativePath + reference.path);

		// if the file is in the files array, let's add it and start watching
		if (!found) _this.watchSrcFile(relativePath + reference.path);

	});

	// find files that are missing from references (this are files that need to be unwatched)
	this.files.forEach(function (file) {

		// ignore the input file, we've already added this
		if (file === _this.inputFile) return;

		// search for this file in references
		var found = references.some(function (reference) {
			return path.resolve(file) === path.resolve(reference.path);
		});

		// references is newer then file, so it may have been removed
		if (!found) _this.unwatchSrcFile(file);

	});

	// update the old array, with the new one
	this.files = files;

};

Fuse.prototype.formatTime = function () {

	var d = new Date();

	return [
		d.getHours(),
		':',
		d.getMinutes(),
		'.',
		d.getSeconds()
	].join('');

};

// core function for parsing and outputing a fused file
// optional arguments: compress, mangle, exit
Fuse.prototype.fuseFile = function () {

	// grab the content of the input file
	var content = this.getFileContent(this.inputFile);
	// grab a list of the referenced files
	var matches = this.getReferencedFiles(content, this.regex);
	// determine the relative path we need to work from
	var relativePath = path.dirname(path.normalize(this.inputFile));
	// output is a version of the content that we'll update
	var output = content;
	// uglify-js2 variables
	var ast = null;
	var compressedAst = null;
	var compressor = null;
	var lintResult = null;
	var lintData = {};
	var _this = this;

	// do we need to check the references?
	if (this.watching) this.checkReferences(matches);

	// are we linting?
	// if so, lint the input file
	if (this.lint) {
		lintData[path.basename(this.inputFile)] = this.lintFile(content);
	}

	// do we have anything to combine?
	if (!matches.length) {		

		// run the lint report if required
		if (this.lint) this.lintReport(lintData);

		return this.emit('nofuse');

	} else {

		// loop through each match, grab the file content
		_.each(matches, function (match) {

			// ok, determine the file name
			var fileContent;
			var filename = path.basename(match.path);
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

				// are we linting?
				// if so, lint each dependancy file
				if (_this.lint) {
					lintData[filename] = _this.lintFile(fileContent);
				}

			}

		});

		// use uglify-js2 to minify the code if arguments are present
		if (this.compress || this.mangle) {

			// setup the compressor
			compressor = ujs.Compressor({warnings: false});

			// parse the output and create an AST
			ast = ujs.parse(output);

			// should we compress?
			if (this.compress) {
				ast.figure_out_scope();
				compressedAst = ast.transform(compressor);
			}

			// should we mangle?
			if (this.mangle) {
				(compressedAst || ast).figure_out_scope();
				(compressedAst || ast).compute_char_frequency();
				(compressedAst || ast).mangle_names();
			}

			// generate the new code string
			output = (compressedAst || ast).print_to_string();

		}
		
		// save the file to disk
		fs.writeFile(_this.outputFile, output, function (err) {

			if (err) {

				_this.emit('error', err);

			} else {

				_this.emit('fuse', {
					updated: _this.outputFile,
					fused: matches.map(function (match) {
						return match.path
					})
				});

			}

			// run the lint report
			if (_this.lint) _this.lintReport(lintData);

		});

	}

};

Fuse.prototype.lintReport = function (lintData) {

	var buffer = '';

	// loop through the linting results and output any suggestions
	for (var file in lintData) {

		// skip the files that didn't contain errors
		if (lintData[file] !== true) {

			buffer += colors.red(file) + ' contains lint:'.red + '\n';
			for (var err in lintData[file]) {
				lintData[file][err].evidence = lintData[file][err].evidence.trim();
				buffer += mustache.render('   Error on line {{line}} at position {{character}}, {{reason}} \'' + '{{evidence}}'.magenta + '\'\n', lintData[file][err]);
			}

		}

	}

	if (buffer.length) {
		this.emit('lint', buffer + '\r');
	}

};

Fuse.prototype.lintFile = function (content) {

	var lintResult = jshint(content);
	return lintResult || jshint.errors;

};

// watch the input file for changes, if it does, we need to compile a new output file
Fuse.prototype.watchFile = function (inputFile) {
	
	var _this = this,
		inputFileName = path.basename(inputFile);
	
	fs.watchFile(inputFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			_this.emit('change', inputFileName);
			_this.fuseFile();
		}
		
	});

	_this.emit('watch', inputFile);
	
};

// watch a referenced file for changes, if it does, we need to compile a new output file
Fuse.prototype.watchSrcFile = function (srcFile) {
	
	var _this = this,
		srcFileName = path.basename(srcFile);
	
	fs.watchFile(srcFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			_this.emit('change', srcFileName);
			_this.fuseFile();
		}
		
	});

	_this.emit('watch', srcFile);
	
};

// unwatch a referenced file for changes
Fuse.prototype.unwatchSrcFile = function (srcFile) {
	
	var _this = this,
		srcFileName = path.basename(srcFile);

	fs.unwatchFile(srcFile);

	_this.emit('unwatch', srcFile);
	
};

// read the file and grab the content
// because it's the input file, simple output any errors and quit
Fuse.prototype.getFileContent = function (inputFile) {
	
	try {
		return fs.readFileSync(inputFile, 'utf-8');
	} catch (e) {
		this.emit('err', e);
	}
	
};

// get a list of the files to include, from the input file
Fuse.prototype.getReferencedFiles = function (content, regex) {
	
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
Fuse.prototype.getFileName = function (path) {
	return path.replace(/.*\/(.*)/i, '$1');
};

// export the class
exports.Fuse = Fuse;

// export a helper function to instantiate the Fuse class
exports.fuse = function (inputFile, outputFile) {

	if (inputFile === undefined) {
		throw new Error('You must define the input file.');
	}

	if (outputFile === undefined) {
		throw new Error('You must define the output file.');
	}

	// what mode are we running in, HTML or JS?
	// this needs to be improved, because it means it will only work if the file ext is 'html' || 'js'
	var mode = path.extname(inputFile).replace(/^\./, '');

	// do we need to compress (js only)?
	var compress = (arguments.length > 2) ? arguments[2] !== undefined && mode === 'js' : false;
	// do we need to mangle (js only)?
	var mangle = (arguments.length > 3) ? arguments[3] !== undefined && mode === 'js' : false;
	// do we need to run the files through JSHint (js only)?
	var lint = (arguments.length > 4) ? arguments[4] !== undefined && mode === 'js' : false;

	return new Fuse(inputFile, outputFile, compress, mangle, lint);

};

}());