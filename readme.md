[![build status](https://secure.travis-ci.org/smebberson/fuse.png)](http://travis-ci.org/smebberson/fuse)
# Fuse

> Fuse is a command line tool to fuse multiple JavaScript files into one.

## Introduction

Fuse is very, very new! At the moment all it does is combine multiple JavaScript files into one. It doesn't do anything else (yet) in terms of minification, etc.

## Installation (via NPM)

	[sudo] npm install fuse -g

You need to install it globally, because it's nothing something that you can `require` in your nodejs code. It's only a command line program.

## Usage

### In your JavaScript file

Fuse uses inline comment-based directives to determine which JavaScript files you'd like to determine. Use the following syntax in your main JavaScript file to inform Fuse about which JavaScript file you'd like to fuse and where.

	// @depends path/to/javascript/file.js

Passing a file with the line above to Fuse, will produce a file containing the original JavaScript and the content of *path/to/javascript/file.js* in the exact position of the depends statement.

### On the command line

To run just once:

	fuse.js -i path/to/main.js -o path/to/output.js

To watch a file for changes:

	fuse.js -i path/to/main.js -o path/to/output.js -w

Fuse will automatically watch any referenced files for changes too, and recompile the output file upon any changes.
