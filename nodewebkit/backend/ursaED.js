var ursa = require('./newUrsa');
function encrypt(keyPair,clearText, keySizeBytes){
  var buffer = new Buffer(clearText);
  var maxBufferSize = keySizeBytes - 42; //according to ursa documentation
  var bytesDecrypted = 0;
  var encryptedBuffersList = [];

  //loops through all data buffer encrypting piece by piece
  while(bytesDecrypted < buffer.length){
    //calculates next maximun length for temporary buffer and creates it
    var amountToCopy = Math.min(maxBufferSize, buffer.length - bytesDecrypted);
    var tempBuffer = new Buffer(amountToCopy);

    //copies next chunk of data to the temporary buffer
    buffer.copy(tempBuffer, 0, bytesDecrypted, bytesDecrypted + amountToCopy);

    //encrypts and stores current chunk
    var encryptedBuffer = keyPair.encrypt(tempBuffer);
    encryptedBuffersList.push(encryptedBuffer);

    bytesDecrypted += amountToCopy;
  }

  //concatenates all encrypted buffers and returns the corresponding String
  return Buffer.concat(encryptedBuffersList).toString('base64');
}

function decrypt(keyPair,encryptedString, keySizeBytes){

  var encryptedBuffer = new Buffer(encryptedString, 'base64');
  var decryptedBuffers = [];

  //if the clear text was encrypted with a key of size N, the encrypted 
  //result is a string formed by the concatenation of strings of N bytes long, 
  //so we can find out how many substrings there are by diving the final result
  //size per N
  var totalBuffers = encryptedBuffer.length / keySizeBytes;

  //decrypts each buffer and stores result buffer in an array
  for(var i = 0 ; i < totalBuffers; i++){
    //copies next buffer chunk to be decrypted in a temp buffer
    var tempBuffer = new Buffer(keySizeBytes);
    encryptedBuffer.copy(tempBuffer, 0, i*keySizeBytes, (i+1)*keySizeBytes);
    //decrypts and stores current chunk
    var decryptedBuffer = keyPair.decrypt(tempBuffer);
    decryptedBuffers.push(decryptedBuffer);
  }

  //concatenates all decrypted buffers and returns the corresponding String
  return Buffer.concat(decryptedBuffers).toString();
}
function test(){
	console.log('test');
}
exports.encrypt = encrypt;
exports.decrypt = decrypt;
