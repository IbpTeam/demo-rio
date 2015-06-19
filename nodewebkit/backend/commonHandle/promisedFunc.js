var fs = require('fs');
var fs_extra = require('fs-extra');
var Q = require('q');

//some promised method

//fs
exports.read_dir = Q.nbind(fs.readdir);
exports.read_file = Q.nbind(fs.readFile);
exports.write_file = Q.nbind(fs.writeFile);
exports.open = Q.nbind(fs.open);
exports.close = Q.nbind(fs.close);


//fs-extra
exports.ensure_dir = Q.nbind(fs_extra.ensureDir);
exports.output_file = Q.nbind(fs_extra.outputFile);