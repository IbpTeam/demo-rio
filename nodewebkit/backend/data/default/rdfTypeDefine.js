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
var _rdf = {
  _type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  _domain: 'http://www.w3.org/2000/01/rdf-schema#domain',
  _property: 'http://www.w3.org/2000/01/rdf-schema#Property',
  _subClaseOf: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  _Class: 'http://www.w3.org/2000/01/rdf-schema#Class'
}

var _category = {
  base: 'http://example.org/category#base',
  contact: 'http://example.org/category#contact',
  document: 'http://example.org/category#document',
  music: 'http://example.org/category#music',
  video: 'http://example.org/category#video',
  picture: 'http://example.org/category#picture',
  other: 'http://example.org/category#other'
}

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
  project: 'http://example.org/property/document#project',
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

var _base = [{
  subject: _category.base,
  predicate: _rdf._type,
  object: _rdf._Class
}, {
  subject: _base_property.URI,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.URI,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.category,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.category,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.createTime,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.createTime,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.lastModifyTime,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.lastModifyTime,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.lastAccessTime,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.lastAccessTime,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.createDev,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.createDev,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.lastModifyDev,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.lastModifyDev,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.lastAccessDev,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.lastAccessDev,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.filename,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.filename,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.postfix,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.postfix,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.size,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.size,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.path,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.path,
  predicate: _rdf._domain,
  object: _category.base
}, {
  subject: _base_property.tags,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _base_property.tags,
  predicate: _rdf._domain,
  object: _category.base
}];

var _contact = [{
  subject: _category.contact,
  predicate: _rdf._subClaseOf,
  object: _category.base
}, {
  subject: _contact_property.lastname,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.lastname,
  predicate: _rdf._domain,
  object: _category.contact
}, {
  subject: _contact_property.firstname,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.firstname,
  predicate: _rdf._domain,
  object: _category.contact
}, {
  subject: _contact_property.email,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.email,
  predicate: _rdf._domain,
  object: _category.contact
}, {
  subject: _contact_property.phone,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.phone,
  predicate: _rdf._domain,
  object: _category.contact
}, {
  subject: _contact_property.sex,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.sex,
  predicate: _rdf._domain,
  object: _category.contact
}, {
  subject: _contact_property.age,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _contact_property.age,
  predicate: _rdf._domain,
  object: _category.contact
}];

var _document = [{
  subject: _category.document,
  predicate: _rdf._subClaseOf,
  object: _category.base
}, {
  subject: _document_property.project,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _document_property.project,
  predicate: _rdf._domain,
  object: _category.document
}];

var _picture = [{
  subject: _category.picture,
  predicate: _rdf._subClaseOf,
  object: _category.base
}, {
  subject: _picture_property.location,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _picture_property.location,
  predicate: _rdf._domain,
  object: _category.picture
}];

var _music = [{
  subject: _category.music,
  predicate: _rdf._subClaseOf,
  object: _category.base
}, {
  subject: _music_property.bit_rate,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.bit_rate,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.frequency,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.frequency,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.track,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.track,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.TDRC,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.TDRC,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.APIC,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.APIC,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.TALB,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.TALB,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.TPE1,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.TPE1,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.TIT2,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.TIT2,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.TXXX,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.TXXX,
  predicate: _rdf._domain,
  object: _category.music
}, {
  subject: _music_property.COMM,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _music_property.COMM,
  predicate: _rdf._domain,
  object: _category.music
}];

var _video = [{
  subject: _category.video,
  predicate: _rdf._subClaseOf,
  object: _category.base
}, {
  subject: _video_property.format_long_name,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.format_long_name,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.width,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.width,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.height,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.height,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.display_aspect_ratio,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.display_aspect_ratio,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.pix_fmt,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.pix_fmt,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.duration,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.duration,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.major_brand,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.major_brand,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.minor_version,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.minor_version,
  predicate: _rdf._domain,
  object: _category.video
}, {
  subject: _video_property.compatible_brands,
  predicate: _rdf._type,
  object: _rdf._property
}, {
  subject: _video_property.compatible_brands,
  predicate: _rdf._domain,
  object: _category.video
}];



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

exports.definition = {
  category: _category,
  rdf: _rdf
}