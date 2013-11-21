var os = require('os');
var crypto = require('crypto');

function isString(obj) {
	return "[object String]" == toString.call(obj);
}
function createConfig(length){
	if( length<4 || length > 256  )
		throw new Error('Length must be a number between 4 and 256.');

	var config = {
		processLength : length >= 8 ? 2 : 0,
		networkLength: length >= 8 ? 2 : 0,
		timeLength : length < 16 ? 2 : (length >= 36 ? 8 : 4)
	}

	config.randomLength = length - config.processLength - config.networkLength - 2*config.timeLength;

	return config;
}
function getNetworkAddress(networkInterfaces){
	for (i in networkInterfaces) {
		for (v in i) {
			if (networkInterfaces[i][v] && networkInterfaces[i][v].address && !networkInterfaces[i][v].internal) {
				return networkInterfaces[i][v].address;
			}
		}
	}
	return os.hostname();
}
function padHex(hex, digits) {
	return Array(Math.max(digits - hex.length + 1, 0)).join(0) + hex;
};

var Clerobee = function Clerobee( length ) {
	this.config = createConfig( length || 16 );
};

var ClerobeeProto = Clerobee.prototype;

ClerobeeProto.derive = function(config, masterID ) {
	var lengthP = config.timeLength + config.processLength + config.networkLength;
	var lengthR = lengthP + config.randomLength;

	var masterRandom = masterID.substring(lengthP, lengthR);
	var masterNano = masterID.substring(lengthR, lengthR+config.timeLength );

	return padHex( Number( parseInt(masterRandom, 36) + parseInt(masterNano, 36) ).toString(36), config.randomLength ).substr( 0, config.randomLength );
};

ClerobeeProto.generate = function( basis ) {
	var length = basis ? (isString(basis) ? basis.length : basis) : null, masterID = basis && isString(basis) ? basis : null;

	var config = length ? createConfig(length) : this.config;

	var ts = this.getTimestamp(config), pid = this.getProcessId(config), nid = this.getNetworkId(config), rid = (masterID ? this.derive(config, masterID) : this.getRandom(config)), nnId = this.getNanoTime(config);

	return ts + pid + nid + rid + nnId;
};

ClerobeeProto.isDerived = function(masterID, slaveID) {
	if( !masterID || !slaveID || masterID.length !== slaveID.length )
		return false;

	var config = createConfig(masterID.length);

	var lengthP = config.timeLength + config.processLength + config.networkLength;
	var lengthR = lengthP + config.randomLength;

	var slaveRandom = slaveID.substring(lengthP, lengthR);

	return this.derive( config, masterID ) === slaveRandom;
}

ClerobeeProto.getRandom = function(config) {
	config = config || this.config;

	var random = '';
	for( var i = 0; i<config.randomLength; i+=128 ){
		var length = (config.randomLength-i)>=128 ? 128 : (config.randomLength-i);
		random += this.toBase36String( Math.floor( Math.random() * 1e200 ), length );
	}

	return random;
};
ClerobeeProto.getProcessId = function(config) {
	config = config || this.config;

	return this.toBase36String( process.pid, config.processLength );
};
ClerobeeProto.getNetworkId = function(config) {
	config = config || this.config;

	var networkAddress = getNetworkAddress( os.networkInterfaces() );

	return crypto.createHash('md5')
		.update( networkAddress, 'utf8')
		.digest('hex')
		.slice(-config.networkLength );
};
ClerobeeProto.getTimestamp = function(config) {
	config = config || this.config;

	return this.toBase36String( Date.now(), config.timeLength );
};
ClerobeeProto.getNanoTime = function(config) {
	config = config || this.config;

	var time = process.hrtime();
	var nano = time[0] * 1e9 + time[1];

	// (nano + '').split('').reverse().join('')
	return this.toBase36String( nano, config.timeLength );
};

ClerobeeProto.toBase36String = function(value, length) {
	value = value || 0; length = length || 4;

	var res = padHex( Number( value ).toString(36), length);

	return res.substr( res.length - length );
};

module.exports = exports = Clerobee;