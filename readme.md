# Fuse [![build status](https://secure.travis-ci.org/smebberson/fuse.png)][1]

> Fuse is a command line tool to fuse multiple JavaScript or HTML files into one. If you're fusing JavaScript you can optionally compress or mangle the JavaScript code.

## Introduction

Fuse is a simple cli tool to combine multiple JavaScript or HTML files into one. It also makes use of UglifyJS2 to either compress, or mangle or do both to the output of the JavaScript. It's designed to be simple, do less and be easy to use.

## Installation (via NPM)

	[sudo] npm install fuse -g

You need to install it globally, because it's not something that you can `require` in your nodejs code. It's only a command line program.

## Running tests (via NPM)

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


[1]:	https://travis-ci.org/smebberson/fuse
[2]:	http://visionmedia.github.com/mocha/
[3]:	http://www.jshint.com/about/

[image-1]:	https://travis-ci.org/smebberson/fuse.png?branch=master