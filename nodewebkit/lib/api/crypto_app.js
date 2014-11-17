var rsaKey = require('../../backend/IM/rsaKey');

function generateRsaKeypair(generateRsaKeypairCb, priKeyPath, pubKeyPath, pemKeyPath) {
  rsaKey.generateKeypair(priKeyPath, pubKeyPath, pemKeyPath, function(done) {
    generateRsaKeypairCb(done);
  });
}
exports.generateRsaKeypair = generateRsaKeypair;