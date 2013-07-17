var fuse = require('../../../lib'),
	path = require('path');

var content = "<p>html first</p><!-- @depends depends.html --><p>html end</p>";

fuse.fuseContent(content, __dirname, 'html', function (err, result) {

	if (err) return console.log('there was an error: ' + err);

	console.log('result: ' + result);

});