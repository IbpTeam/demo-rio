var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var config = require('config');
var fullPath = config.BASEPATH;

if (!fs.existsSync(fullPath)) {
	cp.exec('bash /usr/share/webde/init/init_rio.sh && bash /usr/share/webde/init/init_database.sh');
}
