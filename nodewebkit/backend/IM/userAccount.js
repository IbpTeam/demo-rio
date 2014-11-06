var hashtable = require('hashtable');
var net = require('net');
var path = require('path');
var fs = require('fs');

/*
 * @method createAccountTable
 *  创建用户账户->IP的映射表
 * @param null
 *
 * @return accounttable
 *  返回新创建的映射表
 */
function createAccountTable() {
	var accounttable = new hashtable();
	return accounttable;
}

/*
 * @method insertAccount
 *  在当前账户中插入新的IP地址（包括同一账户多个用户在线情况），若帐号不存在，则创建新的帐号
 * @param TABLE
 *  用createAccountTable函数创建的映射表
 * @param ACCOUNT
 *  待插入IP的帐号
 * @param IP
 *  新增的IP地址
 * @param UID
 *  新增的IP的对应机器UID
 * @return TABLE
 *  返回新插入IP的映射表
 */
function insertAccount(TABLE, ACCOUNT, IP, UID) {

	if (!net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var ipset = TABLE.get(ACCOUNT);
	var IPtmp = {};
	IPtmp["IP"] = IP;
	IPtmp["UID"] = UID;

	if (typeof ipset == "undefined") {
		var tmp = [];
		tmp.push(IPtmp);
		TABLE.put(ACCOUNT, tmp);
	} else {
		ipset.push(IPtmp);
		TABLE.remove(ACCOUNT);
		TABLE.put(ACCOUNT, ipset);
	}

	return TABLE;
}

/*
 * @method removeAccountIP
 *  在当前账户中删除某一下线的IP，若当前IP为帐号对应的唯一IP，则删除该帐号
 * @param TABLE
 *  用createAccountTable函数创建的映射表
 * @param ACCOUNT
 *  待删除IP的帐号
 * @param IP
 *  要删除的IP地址
 * @return TABLE
 *  返回删除IP的映射表
 */
function removeAccountIP(TABLE, ACCOUNT, IP) {
	if (!net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var ipset = TABLE.get(ACCOUNT);

	if (typeof ipset == "undefined") {
		console.log("Input Account Error or Empty Account!");
		return;
	};

	TABLE.remove(ACCOUNT);

	if (ipset.length == 1) {
		return TABLE;
	};

	var orilength = ipset.length;
	for (var i = 0; i < ipset.length; i++) {
		if (ipset[i].IP == IP) {
			ipset.splice(i, 1);
			break;
		}
	};

	if (ipset.length == orilength) {
		console.log("No IP" + IP + "in Account " + Account);
	};

	TABLE.put(ACCOUNT, ipset);

	return TABLE;
}

/*
 * @method getIP
 *  返回某一账户下对应的所有IP，该返回值是一个包含一个或多个IP的字符串数组
 * @param TABLE
 *  用createAccountTable函数创建的映射表 ，该映射表包含N个账户
 * @param ACCOUNT
 *  想获得IP组的指定帐号
 * @return ip
 *  返回ACCOUNT账户下所对应的全部IP地址
 */
function getIP(TABLE, ACCOUNT) {
	var ip = TABLE.get(ACCOUNT);
	if (typeof ip == "undefined") {
		console.log('Get Account IP Error')
		return;
	};
	return ip;
}

/*
 * @method clearTable
 *  清空某一个映射表下的全部映射关系
 * @param TABLE
 *  用createAccountTable函数创建的映射表 ，待清空的表名
 * @return null
 *  返回清空了的映射表（为空）
 */
function clearTable(TABLE) {
	return TABLE.clear();
}

/*
 * @method removeAccount
 *  清空某一个映射表下的某个账户映射关系
 * @param TABLE
 *  用createAccountTable函数创建的映射表 ，待删除ACCOUNT的表名
 * @param ACCOUNT
 *  待删除的ACCOUNT名称
 * @return TABLE
 *  返回删除了ACCOUNT对应关系的映射表
 */
function removeAccount(TABLE, ACCOUNT) {
	return TABLE.remove(ACCOUNT);
}

exports.createAccountTable = createAccountTable;
exports.insertAccount = insertAccount;
exports.getIP = getIP;
exports.clearTable = clearTable;
exports.removeAccount = removeAccount;
exports.removeAccountIP = removeAccountIP;