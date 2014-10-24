var NodeRsa=require('node-rsa');
var fs=require('fs');
var option={b: 1024};

function initSelfRSAKeys(priKeyPath,pubKeyPath){
  console.log('no selfPubKey now!!!'); 
  var keyPair;
  var exists = fs.existsSync(priKeyPath);
  if (exists) {
    console.log('local private key exists');
    var prikey=fs.readFileSync(priKeyPath).toString('utf-8');	
    keyPair= new NodeRsa(prikey);
    console.log("private key load successful!");
  }else{
    console.log('local private key do not exist');
    keyPair= new NodeRsa(option);
    saveToDisk(keyPair,priKeyPath,pubKeyPath);   
  }
  return keyPair;
}
exports.initSelfRSAKeys=initSelfRSAKeys;

function loadServerKey(serverKeyPath){
  console.log('no serverPubKey now!!!'); 
  var serverKeyPair;
  var exists = fs.existsSync(serverKeyPath);
  if (exists) {
    console.log('local private key exists');
    var serverkey=fs.readFileSync(serverKeyPath).toString('utf-8');	
    serverKeyPair= new NodeRsa(serverkey);
    console.log("private key load successful!");
    return serverKeyPair;
  }else{
    console.log('local server public key do not exist');
    return;
  }
}
exports.loadServerKey=loadServerKey;

function saveToDisk(keyPair,priKeyPath,pubKeyPath){
  fs.writeFileSync(priKeyPath, keyPair.getPrivatePEM(), 'utf8',function(err){        
    if(err)         
      console.log("fail " + err);         
    else             
      console.log("写入文件ok");  		   
  });  		
  fs.writeFileSync(pubKeyPath, keyPair.getPublicPEM(), 'utf8',function(err){  		
    if(err)  				
      console.log("fail " + err);  			
    else            
      console.log("写入文件ok");    
  }); 
}