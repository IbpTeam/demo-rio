/**
 * @Copyright:
 *
 * @Description:
 *  RDF tiples of type define. For now, only 6 kinds of type ( base, contact, document, pic-
 *  ture, music, video) are presented.
 *
 * @author: Xiquan
 *
 * @Data:2015.5.4
 *
 * @version:0.0.1
 **/

var _base = [{
  subject: 'http://example.org/category#base',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Class'
}, {
  subject: 'http://example.org/property/base#URI',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#URI',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#category',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#category',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#createTime',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#createTime',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#lastModifyTime',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#lastModifyTime',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#lastAccessTime',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#lastAccessTime',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#createDev',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#createDev',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#lastModifyDev',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#lastModifyDev',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#lastAccessDev',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#lastAccessDev',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#filename',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#filename',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#postfix',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#postfix',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#size',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#size',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#path',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#path',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/base#tags',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/base#tags',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#base'
}];

var _contact = [{
  subject: 'http://example.org/category#contact',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/contact#lastname',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#lastname',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}, {
  subject: 'http://example.org/property/contact#firstname',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#firstname',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}, {
  subject: 'http://example.org/property/contact#email',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#email',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}, {
  subject: 'http://example.org/property/contact#phone',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#phone',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}, {
  subject: 'http://example.org/property/contact#sex',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#sex',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}, {
  subject: 'http://example.org/property/contact#age',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#age',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#contact'
}];

var _document = [{
  subject: 'http://example.org/category#document',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/contact#project',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#project',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#document'
}];

var _picture = [{
  subject: 'http://example.org/category#picture',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/contact#location',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#location',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#picture'
}];

var _music = [{
  subject: 'http://example.org/category#music',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/contact#bit_rate',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#bit_rate',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#frequency',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#frequency',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#track',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#track',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#TDRC',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#TDRC',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#APIC',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#APIC',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#TALB',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#TALB',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#TPE1',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#TPE1',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#TIT2',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#TIT2',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#TXXX',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#TXXX',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}, {
  subject: 'http://example.org/property/contact#COMM',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#COMM',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#music'
}];

var _video = [{
  subject: 'http://example.org/category#video',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  object: 'http://example.org/category#base'
}, {
  subject: 'http://example.org/property/contact#format_long_name',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#format_long_name',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#width',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#width',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#height',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#height',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#display_aspect_ratio',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#display_aspect_ratio',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#pix_fmt',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#pix_fmt',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#duration',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#duration',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#major_brand',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#major_brand',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#minor_version',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#minor_version',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}, {
  subject: 'http://example.org/property/contact#compatible_brands',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2000/01/rdf-schema#Property'
}, {
  subject: 'http://example.org/property/contact#compatible_brands',
  predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
  object: 'http://example.org/category#video'
}];

var _base_property = {
  URI: 'http://example.org/property/base#URI',
  filename: 'http://example.org/property/base#filename',
  postfix: 'http://example.org/property/base#postfix',
  category: 'http://example.org/property/base#category',
  size: 'http://example.org/property/base#size',
  path: 'http://example.org/property/base#path',
  tags: 'http://example.org/property/base#tags',
  createTime: 'http://example.org/property/base#createTime',
  lastModifyTime: 'http://example.org/property/base#lastModifyTime',
  lastAccessTime: 'http://example.org/property/base#lastAccessTime',
  createDev: 'http://example.org/property/base#createDev',
  lastModifyDev: 'http://example.org/property/base#lastModifyDev',
  lastAccessDev: 'http://example.org/property/base#lastAccessDev'
}

var _contact_property = {
  lastname: 'http://example.org/property/contact#lastname',
  firstname: 'http://example.org/property/contact#firstname',
  email: 'http://example.org/property/contact#email',
  phone: 'http://example.org/property/contact#phone',
  sex: 'http://example.org/property/contact#sex',
  age: 'http://example.org/property/contact#age'
}

var _document_property = {
  project: 'http://example.org/property/document#project'
}

var _picture_property = {
  location: 'http://example.org/property/picture#location',
}

var _music_property = {
  format: 'http://example.org/property/music#format',
  bit_rate: 'http://example.org/property/music#bit_rate',
  frequency: 'http://example.org/property/music#frequency',
  track: 'http://example.org/property/music#track',
  TDRC: 'http://example.org/property/music#TDRC',
  APIC: 'http://example.org/property/music#APIC',
  TALB: 'http://example.org/property/music#TALB',
  TPE1: 'http://example.org/property/music#TPE1',
  TIT2: 'http://example.org/property/music#TIT2',
  TXXX: 'http://example.org/property/music#TXXX',
  COMM: 'http://example.org/property/music#COMM'
}

var _video_property = {
  format_long_name: 'http://example.org/property/video#format_long_name',
  width: 'http://example.org/property/video#width',
  height: 'http://example.org/property/video#height',
  display_aspect_ratio: 'http://example.org/property/video#display_aspect_ratio',
  pix_fmt: 'http://example.org/property/video#pix_fmt',
  duration: 'http://example.org/property/video#duration',
  major_brand: 'http://example.org/property/video#major_brand',
  minor_version: 'http://example.org/property/video#minor_version',
  compatible_brands: 'http://example.org/property/video#compatible_brands'
}

exports.vocabulary = {
  base: _base,
  contact: _contact,
  document: _document,
  picture: _picture,
  music: _music,
  video: _video
};

exports.property = {
  base: _base_property,
  contact: _contact_property,
  "document": _document_property,
  picture: _picture_property,
  music: _music_property,
  video: _video_property
};