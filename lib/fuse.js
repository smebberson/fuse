var fs = require('fs');
var _ = require('underscore');

var fuse = exports;

var re = fuse.re = /\/\/ ?@depends (.+)\b/gi;

fuse.readFile = function (inputFile, outputFile, exit) {
	
	var inputFile = inputFile;
	var outputFile = outputFile;
	var exit = (arguments.length == 3) ? arguments[2] : true;
	
	// first thing, let's parse the input file
	fs.readFile(inputFile, 'ascii', function (err, data) {

		var matches = [];
		var output = data;
		var relativePath;;

		if (err) {
			console.log('Unable to read input file %s', inputFile);
			process.exit(1);
		}

		relativePath = fs.realpathSync(inputFile).replace(/(.+)?\/(.+)/i, '$1/');
		matches = data.match(fuse.re);

		// do we have anything to combine?
		if (!matches) {
			console.log('All done, there was nothing to combine.');
			if (exit) process.exit(0);
		}

		// loop through each match, grab the contents
		_.each(matches, function (match) {

			// ok, determine the file name
			var fileContent;
			var filename = match.replace(fuse.re, '$1');
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
		
		fs.writeFile(outputFile, output, function (err) {
			if (err) {
				console.log('Failed to write to file.');
				process.exit(1);
			} else {
				console.log('Updated ' + outputFile + ', fusing ' + (matches.length+1) + ' files.\n');
				if (exit) process.exit();
			}
		});

	});

}

fuse.watchFile = function (inputFile, outputFile) {
	
	var inputFile = inputFile;
	var outputFile = outputFile;
	
	fs.watchFile(inputFile, {'persistent': true, 'interval': 1000}, function (curr, prev) {
		
		if (curr.mtime.getTime() !== prev.mtime.getTime()) {
			fuse.readFile(inputFile, outputFile, false);
		}
		
	});
	
	console.log('Watching ' + inputFile + ' for changes.\nPush CTRL + C to stop.');
	
}