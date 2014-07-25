var uniqueID=require('./uniqueID');


function A(ex,buf)
{
	token = buf.toString('hex');
	console.log(token);
}

uniqueID. SetSysUid();

uniqueID.getFileUid(A);