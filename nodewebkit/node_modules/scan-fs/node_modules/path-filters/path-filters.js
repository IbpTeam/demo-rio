var fs = require('fs');

var simpleRegExpReplacements = {
    '*': '.*?',
    '?': '.?'
};


function normalizePath(path) {
    return path.replace(/\\/g, '/');
}
var simpleRegExpTest = /[\?\*]/;

function startsWith(s, prefix) {
    return s.indexOf(prefix) === 0;
}

function RegExpFilter(regex, matchResult) {
    this._regex = regex;
    this._matchResult = matchResult;
}

RegExpFilter.prototype.test = function(path) {
    return this._regex.test(path) ? this._matchResult || true : false;
};

RegExpFilter.prototype.toString = function() {
    return this._regex.toString();
};

function StringFilter(str, recursive, matchResult) {
    this._str = str;
    this._recursive = recursive !== false;
    this._matchResult = matchResult;
}

StringFilter.prototype.test = function(path) {
    var match = this._recursive ? startsWith(path, this._str) : path === this._str;
    return match ? this._matchResult || true : false;
};

StringFilter.prototype.toString = function() {
    return this._str.toString() + '*';
};

function FunctionFilter(func, matchResult) {
    this._func = func;
    this._matchResult = matchResult;
}

FunctionFilter.prototype.test = function(path) {
    if (this._matchResult) {
        var result = this._func(path);
        return result ? this._matchResult : false;
    } else {
        return this._func(path);
    }
};

FunctionFilter.prototype.toString = function() {
    return this._func.toString();
};

function isSimpleRegExp(str) {
    return simpleRegExpTest.test(str);
}

function escapeRegExpStr(str) {
    return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
}

function createSimpleRegExp(str) {
    return new RegExp('^' + str.replace(/[\*\?]|[^\*\?]*/g, function(match) {
        return simpleRegExpReplacements[match] || escapeRegExpStr(match);
    }) + '$');
}

var allFilter = new FunctionFilter(function() {
    return true;
});

allFilter.toString = function() {
    return '*';
};

function PathFilters() {
    this._filters = [];
}

PathFilters.prototype.getFilters = function() {
    return this._filters;
};

PathFilters.prototype.isEmpty = function() {
    return this._filters.length === 0;
};

PathFilters.prototype.getMatch = function(path) {
    path = normalizePath(path);
    for (var i = 0, len = this._filters.length; i < len; i++) {
        var result = this._filters[i].test(path);
        if (result !== false) {
            return result;
        }
    }
    return undefined;
};

PathFilters.prototype.getMatches = function(path) {
    path = normalizePath(path);
    var matches = [];
    for (var i = 0, len = this._filters.length; i < len; i++) {
        var filter = this._filters[i];
        var result = filter.test(path);
        if (result !== false) {
            matches.push(filter);
        }
    }
    return matches;
};

PathFilters.prototype.hasMatch = function(path) {
    path = normalizePath(path);
    return this.getMatch(path) !== undefined ? true : false;
};

PathFilters.prototype.add = function(filter, recursive, matchResult) {

    if (Array.isArray(filter)) {
        var filters = filter;
        var result = new Array(filters.length);
        for (var i = 0, len = filters.length; i < len; i++) {
            result[i] = filter = this.createFilter(filters[i], recursive, matchResult);
            this._filters.push(filter);
        }
        return result;
    } else {
        filter = this.createFilter(filter, recursive, matchResult);
        this._filters.push(filter);
        return filter;
    }
};

PathFilters.prototype.createFilter = function(filter, recursive, matchResult) {
    if (typeof filter === 'string') {
        // filter is a simple String that represents a regular expression
        if (filter === '*') {
            return allFilter;
        } else if (isSimpleRegExp(filter)) {
            return new RegExpFilter(createSimpleRegExp(filter), matchResult);
        } else {
            return this.createSimpleFilter(filter, recursive, matchResult);
        }
    } else if (filter.constructor === RegExp) {
        return new RegExpFilter(filter, matchResult);
    } else if (typeof filter === 'function') {
        return new FunctionFilter(filter, matchResult);
    } else if (filter.filter) {
        if (filter.recursive !== undefined) {
            recursive = filter.recursive;
        }

        if (filter.matchResult !== undefined) {
            matchResult = filter.matchResult;
        }

        return this.createFilter(filter.filter, recursive, matchResult);
    } else {
        throw new Error('Invalid filter: ' + filter + ' (' + (typeof filter) + ')');
    }
};

PathFilters.prototype.createSimpleFilter = function(filter, recursive, matchResult) {
    try {
        var stat = fs.statSync(filter);
        if (stat.isFile()) {
            recursive = false;
        }
    } catch(e) {
        // ignore
    }

    return new StringFilter(filter, recursive, matchResult);
};

PathFilters.prototype.isEmpty = function() {
    return (this._filters.length === 0);
};

PathFilters.prototype.toString = function() {
    return require('util').inspect(this._filters);
};

module.exports = {
    PathFilters: PathFilters,
    create: function() {
        return new PathFilters();
    }
};
