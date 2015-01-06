var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var fullPath = path.join("/home", process.env['USER'], ".demo-rio");

if (!fs.existsSync(fullPath)) {
	cp.exec('bash /usr/share/webde/init/init_rio.sh && bash /usr/share/webde/init/init_database.sh');
}