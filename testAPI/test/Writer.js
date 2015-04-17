// ## Constructor
function Writer(outputStream, options) {
	if (!(this instanceof Writer))
		return new Writer(outputStream, options);

	if (outputStream && typeof outputStream.write !== 'function')
		options = outputStream, outputStream = null;

	if (!outputStream) {
		outputStream = this;
		this._output = '';
		this.write = function (chunk, encoding, callback) {
			this._output += chunk;
			callback && callback();
		};
	}
	this._outputStream = outputStream;
// Initialize writer, depending on the format
	this._subject = null;
	options = options || {};
	if (!(/triple|quad/i).test(options.format)) {
		this._graph = '';
		this._prefixIRIs = Object.create(null);
		options.prefixes && this.addPrefixes(options.prefixes);
	}
	else {
		this._writeTriple = this._writeTripleLine;
	}
}
Writer.prototype = {

	_write: function (string, callback) {
		this._outputStream.write(string, 'utf8', callback);
	},

	_writeTriple: function (subject, predicate, object, graph, done) {
		try {

			if (this._graph !== graph) {

				this._write((this._subject === null ? '' : (this._graph ? '\n}\n' : '.\n')) +
					(graph ? this._encodeIriOrBlankNode(graph) + ' {\n' : ''));
				this._graph = graph, this._subject = null;
			}

			if (this._subject === subject) {
				if (this._predicate === predicate)
					this._write(', ' + this._encodeObject(object), done);

				else
					this._write(';\n ' +
						this._encodePredicate(this._predicate = predicate) + ' ' +
						this._encodeObject(object), done);
			}

			else
				this._write((this._subject === null ? '' : '.\n') +
					this._encodeSubject(this._subject = subject) + ' ' +
					this._encodePredicate(this._predicate = predicate) + ' ' +
					this._encodeObject(object), done);
		}
		catch (error) { done && done(error); }
	},

	_writeTripleLine: function (subject, predicate, object, graph, done) {

		delete this._prefixMatch;

		try {
			this._write(this._encodeIriOrBlankNode(subject) + ' ' +
				this._encodeIriOrBlankNode(predicate) + ' ' +
				this._encodeObject(object) +
				(graph ? ' ' + this._encodeIriOrBlankNode(graph) + '.\n' : '.\n'), done);
		}
		catch (error) { done && done(error); }
	},

	_encodeIriOrBlankNode: function (iri) {

		if (iri[0] === '_' && iri[1] === ':') return iri;

		if (escape.test(iri))
			iri = iri.replace(escapeAll, characterReplacer);

		var prefixMatch = this._prefixRegex.exec(iri);
		return !prefixMatch ? '<' + iri + '>' :
		(!prefixMatch[1] ? iri : this._prefixIRIs[prefixMatch[1]] + prefixMatch[2]);
	},

	_encodeLiteral: function (value, type, language) {

		if (escape.test(value))
			value = value.replace(escapeAll, characterReplacer);

		if (language)
			return '"' + value + '"@' + language;
		else if (type)
			return '"' + value + '"^^' + this._encodeIriOrBlankNode(type);
		else
			return '"' + value + '"';
	},

	_encodeSubject: function (subject) {
		if (subject[0] === '"')
			throw new Error('A literal as subject is not allowed: ' + subject);
		return this._encodeIriOrBlankNode(subject);
	},

	_encodePredicate: function (predicate) {
		if (predicate[0] === '"')
			throw new Error('A literal as predicate is not allowed: ' + predicate);
		return predicate === RDF_TYPE ? 'a' : this._encodeIriOrBlankNode(predicate);
	},

	_encodeObject: function (object) {

		if (object[0] !== '"')
			return this._encodeIriOrBlankNode(object);

		var match = N3LiteralMatcher.exec(object);
		if (!match) throw new Error('Invalid literal: ' + object);
		return this._encodeLiteral(match[1], match[2], match[3]);
	},

	_blockedWrite: function () {
		throw new Error('Cannot write because the writer has been closed.');
	},

	addTriple: function (subject, predicate, object, graph, done) {

		if (typeof object !== 'string')
			this._writeTriple(subject.subject, subject.predicate, subject.object,
				subject.graph || '', predicate);

		else if (typeof graph !== 'string')
			this._writeTriple(subject, predicate, object, '', graph);

		else
			this._writeTriple(subject, predicate, object, graph, done);
	},

	addTriples: function (triples) {
		for (var i = 0; i < triples.length; i++)
			this.addTriple(triples[i]);
	},

	addPrefix: function (prefix, iri, done) {
		var prefixes = {};
		prefixes[prefix] = iri;
		this.addPrefixes(prefixes, done);
	},

	addPrefixes: function (prefixes, done) {

		var prefixIRIs = this._prefixIRIs, hasPrefixes = false;
		for (var prefix in prefixes) {

			var iri = prefixes[prefix];
			if (/[#\/]$/.test(iri) && prefixIRIs[iri] !== (prefix += ':')) {
				hasPrefixes = true;
				prefixIRIs[iri] = prefix;

				if (this._subject !== null) {
					this._write(this._graph ? '\n}\n' : '.\n');
					this._subject = null, this._graph = '';
				}

				this._write('@prefix ' + prefix + ' <' + iri + '>.\n');
			}
		}

		if (hasPrefixes) {
			var IRIlist = '', prefixList = '';
			for (var prefixIRI in prefixIRIs) {
				IRIlist += IRIlist ? '|' + prefixIRI : prefixIRI;
				prefixList += (prefixList ? '|' : '') + prefixIRIs[prefixIRI];
			}
			IRIlist = IRIlist.replace(/[\]\/\(\)\*\+\?\.\\\$]/g, '\\$&');
			this._prefixRegex = new RegExp('^(?:' + prefixList + ')[^\/]*$|' +
				'^(' + IRIlist + ')([a-zA-Z][\\-_a-zA-Z0-9]*)$');
		}

		this._write(hasPrefixes ? '\n' : '', done);
	},

	_prefixRegex: /$0^/,

	end: function (done) {

		if (this._subject !== null) {
			this._write(this._graph ? '\n}\n' : '.\n');
			this._subject = null;
		}

		this._write = this._blockedWrite;

		if (this === this._outputStream)
			return done && done(null, this._output);

		var singleDone = done && function () { singleDone = null, done(); };

		try { this._outputStream.end(singleDone); }

		catch (error) { singleDone && singleDone(); }
	},
};

// ## Exports
// Export the `Writer` class as a whole.
module.exports = N3Writer;
