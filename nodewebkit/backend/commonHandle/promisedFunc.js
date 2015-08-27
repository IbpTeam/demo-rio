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
exports.stat = Q.nbind(fs.stat);
exports.symlink = Q.nbind(fs.symlink);
exports.unlink = Q.nbind(fs.unlink);
exports.rename = Q.nfbind(fs.rename);
exports.mkdir = Q.denodeify(fs.mkdir);
exports.readdir = Q.denodeify(fs.readdir);
exports.exists = Q.denodeify(fs.exists);


//fs-extra
exports.ensure_dir = Q.nbind(fs_extra.ensureDir);
exports.output_file = Q.nbind(fs_extra.outputFile);
exports.copy = Q.denodeify(fs_extra.copy);
exports.ensureFile = Q.denodeify(fs_extra.ensureFile);
exports.remove = Q.denodeify(fs_extra.remove);
exports.mkdirs = Q.denodeify(fs_extra.mkdirs);
exports.emptyDir = Q.denodeify(fs_extra.emptyDir);
exports.lstat = Q.denodeify(fs_extra.lstat);
