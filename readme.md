[![build status](https://secure.travis-ci.org/smebberson/fuse.png)](http://travis-ci.org/smebberson/fuse)
# Fuse

> Fuse is a command line tool to fuse multiple JavaScript files into one, and optionally compress or mangle the JavaScript code.

## Introduction

Fuse is a simple cli tool to combine multiple JavaScript files into one. It also makes use of UglifyJS2 to either compress, or mangle or do both to the output of the JavaScript. It's designed to be simple, do less and be easy to use.

## Installation (via NPM)

	[sudo] npm install fuse -g

You need to install it globally, because it's not something that you can `require` in your nodejs code. It's only a command line program.

## Usage

### In your JavaScript file

Fuse uses inline comment-based directives to determine which JavaScript files you'd like to determine. Use the following syntax in your main JavaScript file to inform Fuse about which JavaScript file you'd like to fuse and where.

	// @depends path/to/javascript/file.js

Passing a file with the line above to Fuse, will produce a file containing the original JavaScript and the content of *path/to/javascript/file.js* in the exact position of the depends statement.

### On the command line

To run just once:

	fuse -i path/to/main.js -o path/to/output.js

To watch a file for changes:

	fuse -i path/to/main.js -o path/to/output.js -w

When watching, Fuse will automatically watch any referenced files for changes too, and recompile the output file upon any changes to reference files.

To compress the output using UglifyJS2:

	fuse -i path/to/main.js -o path/to/output.js -c

To mangle the output using UglifyJS2:

	fuse -i path/to/main.js -o path/to/output.js -m

To compress and mangle, and watch:

	fuse -i path/to/main.js -o path/to/output.js -c -m -w
