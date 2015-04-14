/**
 * @Copyright:
 *
 * @Description: test n3 for data type.
 *
 * @author: Xiquan
 *
 * @Data:2015.4.14
 *
 * @version:0.1
 **/

var N3 = require('n3');
var fs = require('fs');

function test_N3(callback) {

  var startTime = new Date();

  var fileWriteStream = fs.createWriteStream('./default.n3');
  var writer = N3.Writer(fileWriteStream, {

    //defien the prefixes
    prefixes: {
      'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
      'rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'contact': 'http://example.org/category/contact#',
      'property': 'http://example.org/property/contact#'
    }
  });

  //define the data type
  writer.addTriple({
    subject: 'http://example.org/category#Base',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Class'
  });
  writer.addTriple({
    subject: 'http://example.org/category#Contact',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Class'
  });
  writer.addTriple({
    subject: 'http://example.org/category#Contact',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
    object: 'http://example.org/category#Base'
  });

  //define the type property
  writer.addTriple({
    subject: 'http://example.org/property/contact#FN',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#FN',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Contact'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#name',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#name',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Contact'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#sex',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#sex',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Contact'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#Email',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#Email',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Contact'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#Phone',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#Phone',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Contact'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#createTime',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#createTime',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastModifyTime',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastModifyTime',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastAccessTime',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastAccessTime',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#createDev',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#createDev',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastModifyDev',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastModifyDev',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastAccessDev',
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: 'http://www.w3.org/2000/01/rdf-schema#Property'
  });
  writer.addTriple({
    subject: 'http://example.org/property/contact#lastAccessDev',
    predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
    object: 'http://example.org/category#Base'
  });

  //wrting tripples into file
  for (var i = 0; i < 30; i++) {
    var currentTime = (new Date());
    var fullName = "FullName" + i;
    var fullNameUrl = 'http://example.org/item/contact#' + fullName;

    writer.addTriple(fullNameUrl,
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      'http://example.org/category#Contact');
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#FN',
      object: '"' + 'FN' + i + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#name',
      object: '"' + 'Name' + i + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#sex',
      object: '"' + 'sex' + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#Email',
      object: '"' + 'EmailAddr' + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#Phone',
      object: '"' + 'phoneNum' + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#createTime',
      object: '"' + currentTime + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#lastModifyTime',
      object: '"' + currentTime + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#lastAccessTime',
      object: '"' + currentTime + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#createDev',
      object: '"' + 'deviceId' + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#lastModifyDev',
      object: '"' + 'deviceId' + '"'
    });
    writer.addTriple({
      subject: fullNameUrl,
      predicate: 'http://example.org/property/contact#lastAccessDev',
      object: '"' + 'deviceId' + '"'
    });
  }

  writer.end();

  fileWriteStream.on('error', function(err) {
    callback(err);
  })

  fileWriteStream.on('finish', function() {
    var endTime = new Date();
    var timeSpan = endTime.getTime() - startTime.getTime();
    callback(null, timeSpan);
  });
}
exports.test_N3 = test_N3;