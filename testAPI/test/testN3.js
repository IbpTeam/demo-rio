/**
 * @Copyright:
 * 
 * @Description: test n3.
 *
 * @author: Yuanzhe
 *
 * @Data:2015.4.09
 *
 * @version:0.1
 **/

var N3 = require('n3');
var fs = require('fs');

console.log("\ndefault::");
var writer = N3.Writer(process.stdout, { prefixes: { 'contact': 'http://example.org/category/contact#' } });
writer.addTriple('http://example.org/category#Contact',
                 'http://www.w3.org/category#type',
                 'http://example.org/contact#Contact');
writer.addTriple('http://example.org/category#Contact',
                 'http://example.org/category/contact#Person',
                 'http://example.org/category/contact#Yuanzhe');
writer.addTriple('http://example.org/category/contact#Yuanzhe',
                 'http://www.w3.org/contact#type',
                 'http://example.org/category/contact#Person');
writer.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#name',
  object:    '"Yuanzhe"'
});
writer.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Email',
  object:    '"yuanzhe@iscas.ac.cn"'
});
writer.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Phone',
  object:    '"134xxxxxxx"'
});
writer.end();

console.log("\nN-Triples::");
var writer1 = N3.Writer(process.stdout, { prefixes: { 'c': 'http://example.org/category/contact#' } ,format:'N-Triples'});
writer1.addTriple('http://example.org/category#Contact',
                 'http://www.w3.org/category#type',
                 'Contact');
writer1.addTriple('http://example.org/category#Contact',
                 'http://example.org/category/contact#Person',
                 'http://example.org/category/contact#Yuanzhe');
writer1.addTriple('http://example.org/category/contact#Yuanzhe',
                 'http://www.w3.org/contact#type',
                 'http://example.org/category/contact#Person');
writer1.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#name',
  object:    '"Yuanzhe"'
});
writer1.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Email',
  object:    '"yuanzhe@iscas.ac.cn"'
});
writer1.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Phone',
  object:    '"134xxxxxxx"'
});
writer1.end();

console.log("\napplication/trig::");
var writer2 = N3.Writer(process.stdout, { prefixes: { 'c': 'http://example.org/category/contact#' } ,format:'application/trig'});
writer2.addTriple('http://example.org/category#Contact',
                 'http://www.w3.org/category#type',
                 'Contact');
writer2.addTriple('http://example.org/category#Contact',
                 'http://example.org/category/contact#Person',
                 'http://example.org/category/contact#Yuanzhe');
writer2.addTriple('http://example.org/category/contact#Yuanzhe',
                 'http://www.w3.org/contact#type',
                 'http://example.org/category/contact#Person');
writer2.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#name',
  object:    '"Yuanzhe"'
});
writer2.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Email',
  object:    '"yuanzhe@iscas.ac.cn"'
});
writer2.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Phone',
  object:    '"134xxxxxxx"'
});
writer2.end();

var fileWriteStream = fs.createWriteStream('./default.xml');
var writer3 = N3.Writer(fileWriteStream, { prefixes: { 'c': 'http://example.org/category/contact#' } ,format:'N-Triples'});
writer3.addTriple('http://example.org/category#Contact',
                 'http://www.w3.org/category#type',
                 'Contact');
writer3.addTriple('http://example.org/category#Contact',
                 'http://example.org/category/contact#Person',
                 'http://example.org/category/contact#Yuanzhe');
writer3.addTriple('http://example.org/category/contact#Yuanzhe',
                 'http://www.w3.org/contact#type',
                 'http://example.org/category/contact#Person');
writer3.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#name',
  object:    '"Yuanzhe"'
});
writer3.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Email',
  object:    '"yuanzhe@iscas.ac.cn"'
});
writer3.addTriple({
  subject:   'http://example.org/category/contact#Yuanzhe',
  predicate: 'http://example.org/category/contact#Phone',
  object:    '"134xxxxxxx"'
});
writer3.end();
