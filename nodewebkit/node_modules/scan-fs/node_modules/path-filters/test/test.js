var assert = require("assert");

var pathFilters = require('../index.js');
var path = require('path');

describe('path-filters', function() {
    describe('String path filters', function() {

        var projectDir = path.join(__dirname, '..');
        var testDir = __dirname;

        var filters = pathFilters.create().add([
                testDir,
                '/Users/philidem/Development/custserv-webclient/public/admin/packages'
            ])

        it('should not match project root dir', function() {
            assert(!filters.hasMatch(projectDir));
        });

        it('should match test directory', function() {
            assert(filters.hasMatch(testDir));
        });

        it('should match test subdirectory', function() {
            assert(filters.hasMatch(testDir + '/some/subdirectory'));
        });

        it('should match test subdirectory', function() {
            assert(filters.hasMatch('/Users/philidem/Development/custserv-webclient/public/admin/packages/ext-theme-access/build/resources/images/box'));
        });
    });
});