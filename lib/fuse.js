var colors = require('colors');
var fs = require('fs');
var _ = require('underscore');

var fuse = exports;

// regular expression to find referenced files
var re = fuse.re = /\/\/ ?@depends (.+)\b/gi;

fuse.formatTime = function () {

	var d = new Date();

	return [
		d.getHours(),
		':',
		d.getSeconds(),
		'.',
		d.getSeconds()
	].join('');

}

// core function for parsing and outputing a fused file
fuse.fuseFile = function (inputFile, outputFile, exit) {
	
	// reference argument variables, so we can referrer to them in anonymous functions
	var inputFile = inputFile;
	var outputFile = outputFile;
	// exit will be true, if we're not watching files
	var exit = (arguments.length == 3) ? arguments[2] : true;
	// grab the content of the input file
	var content = fuse.getFileContent(inputFile);
	// grab a list of the referenced files
	var matches = fuse.getReferencedFiles(content);
	// determine the relative path we need to work from
	var relativePath = fuse.getFilePath(inputFile);
	// output is a version of the content that we'll update
	var output = content;

	// do we have anything to combine?
	if (!matches.length) {
		console.log('All done, there was nothing to combine (output file was not generated).'.blue);
		if (exit) process.exit(0);
	}

	// loop through each match, grab the file content
	_.each(matches, function (match) {

		// ok, determine the file name
		var fileContent;
		var filename = match.path.replace(fuse.re, '$1');
		var filepath = relativePath + filename;
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
	
	fs.writeFile(outputFile, output, function (err) {
		if (err) {
			console.log('Failed to write to file.'.red);
			process.exit(1);
		} else {
			console.log('Updated ' + colors.green(outputFile) + ', fusing ' + (matches.length+1) + ' files @ ' + colors.green(fuse.formatTime()) + '.\n');
			if (exit) process.exit();
		}
	});

}

// watch the input file for changes, if it does, we need to compile a new output file
fuse.watchFile = function (inputFile, outputFile) {
	
	var inputFile = inputFile;
	var inputFileName = fuse.getFileName(inputFile);
	var outputFile = outputFile;
	
	fs.watchFile(inputFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(( inputFileName ) + ' changed.'));
			fuse.fuseFile(inputFile, outputFile, false);
		}
		
	});
	
}

// watch a referenced file for changes, if it does, we need to compile a new output file
fuse.watchSrcFile = function (srcFile, inputFile, outputFile) {
	
	var inputFile = inputFile;
	var outputFile = outputFile;
	var srcFile = srcFile;
	var srcFileName = fuse.getFileName(srcFile);
	
	fs.watchFile(srcFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			console.log(colors.blue(srcFileName + ' changed.'));
			fuse.fuseFile(inputFile, outputFile, false);
		}
		
	});
	
}

// read the file and grab the content
// because it's the input file, simple output any errors and quit
fuse.getFileContent = function (inputFile) {
	
	try {
		return fs.readFileSync(inputFile, 'utf-8')
	} catch (e) {
		console.log('Unable to read input file %s'.red, inputFile);
		process.exit(1);
	}
	
}

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
	
}

// return only the filename, removing the actual file path
fuse.getFileName = function (path) {
	return path.replace(/.*\/(.*)/i, '$1')
}

// return only the path, removing the actual file name
fuse.getFilePath = function (path) {
	return fs.realpathSync(path).replace(/(.+)?\/(.+)/i, '$1/');
}
