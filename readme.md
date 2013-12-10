# Fuse [![build status](https://secure.travis-ci.org/smebberson/fuse.png?branch=moduleintegration)][1]

> Fuse is a tool to fuse multiple JavaScript or HTML files into one. If you're fusing JavaScript you can optionally compress or mangle the JavaScript code.

You can use Fuse in three ways:

- on the command line
- as a Node.js module via require
- in express as middleware

## Introduction

Fuse is a simple tool to combine multiple JavaScript or HTML files into one. It also makes use of UglifyJS2 to either compress, or mangle or do both to the output of the JavaScript. It's designed to be simple, do less and be easy to use.

Compressing and mangling is only available to the commandline tool.

## Installation

There are two ways to install Fuse, depending on usage.

### Install as a command line tool

	[sudo] npm install fuse -g

You need to install it globally, so that NPM will add it your bin path.

### Install as a module

	[sudo] npm install fuse --save

`--save` will insert Fuse as a dependency in your package.json. Once you've installed it as a module, you can then use it via require in the following methods.

### Install for express

To use fuse within Express, you must install fuse-connect. fuse-connect is a connect middlware wrapper for Fuse.

	[sudo] npm install fuse-connect --save

## Running tests (via NPM)

Make sure you're in the test directory within Fuse, then...

	npm test

Tests are run using [Mocha][2]. You can also run `make test` to run the tests.

## Usage

Fuse uses inline comment-based directives to determine which files you'd like to fuse. You can use `@depends`, `@import` or `@include` as the directive.

### In your JavaScript file

Use the following syntax in your main JavaScript file to inform Fuse about which JavaScript files you'd like to fuse and where.

	// @depends path/to/javascript/file.js

Passing a file with the line above to Fuse, will produce a file containing the original JavaScript and the content of *path/to/javascript/file.js* in the exact position of the fuse directive.

### In your HTML file

Fuse uses HTML comment-based directives to determine which HTML files you'd like to fuse. Use the following syntax in your main HTML file to inform Fuse about which HTML files you'd like to fuse and where.

	<!-- @depends path/to/html/file.html -->

Passing a file with the line above to Fuse, will produce a file containing the original HTML and the content of *path/to/html/file.html* in the exact position of the fuse directive.

### On the command line

To run just once and combine JavaScript:

	fuse -i path/to/main.js -o path/to/output.js

To watch a file for changes and combine HTML:

	fuse -i path/to/main.html -o path/to/main-combined.html -w

When watching, Fuse will automatically watch any referenced files for changes too, and recompile the output file upon any changes to reference files. Fuse will also rescan the input file for new reference files, or referenced files that have been removed and either watch or unwatch those respectively.

To compress the output using UglifyJS2 (JavaScript only):

	fuse -i path/to/main.js -o path/to/output.js -c

To mangle the output using UglifyJS2 (JavaScript only):

	fuse -i path/to/main.js -o path/to/output.js -m

To compress and mangle, and watch (JavaScript only):

	fuse -i path/to/main.js -o path/to/output.js -c -m -w

To lint with [jshint][3] before combining (JavaScript only):

	fuse -i path/to/main.js -o path/to/output.js -l

### As a node.js module

To fuse a file:

	var fuse = require('fuse');
	fuse.fuseFile(inputFile, outputFile, function (err, results) {
		// do something with the results
		// in this case a file has been generated, results.updated
	});

To fuse some content:

	var fuse = require('fuse');
	fuse.fileContent(content, relativePath, mode, function (err, results) {
		// do something with the results
		// in this case, no file has been generated, but contents stored within results.updated
	});

`content` is a string with some Fuse directives within it.
`relativePath` is a directory from which to load the directive referenced files.
`mode` tells Fuse if you're fusing HTML or JavaScript.

### With express

Make sure you've installed fuse-connect. You can then include fuse-connect to bind requests to particular files to fuse, so that they're automatically updated upon request.

	var fuse = require('fuse-connect');
	var filesToFuse = [
		{src: '/path/to/src-file.js', dest: '/path/to/dest-file.js'},
		{src: '/path/to/src-file.html', dest: '/path/to/dest-file.html'}
	];

	// add fuse-connect to the middleware
	app.use(fuse.middleware(filesToFuse));


[1]:	https://travis-ci.org/smebberson/fuse
[2]:	http://visionmedia.github.com/mocha/
[3]:	http://www.jshint.com/about/

[image-1]:	https://travis-ci.org/smebberson/fuse.png?branch=master