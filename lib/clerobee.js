var os = require('os');
var crypto = require('crypto');

var RANDOM_MAX_LENGTH = 64;

function isString(obj) {
	return "[object String]" == toString.call(obj);
}
function isNumber(obj) {
	return (toString.call(obj) == "[object " + Number + "]") || !isNaN(obj);
}
function isObject(obj) {
	return obj === Object(obj);
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
	return hex.length >= digits ? hex.substring(0, digits) : this.getRandom(digits - hex.length) + hex;
}

var Clerobee = function Clerobee( length ) {
	this.config = createConfig( length || 16 );
};

var ClerobeeProto = Clerobee.prototype;

ClerobeeProto.derive = function( config, masterID ) {
	var lengthP = config.timeLength + config.processLength + config.networkLength;
	var lengthR = lengthP + config.randomLength;

	var masterRandom = masterID.substring( lengthP, lengthR );
	var masterNano = masterID.substring( lengthR, lengthR+config.timeLength );

	return this.getRandom(config.randomLength, masterRandom, masterNano );
};

function innerGenerate( config, randomGenerator ) {
	var ts = this.getTimestamp( config.timeLength ),
		pid = this.getProcessId( config.processLength ),
		nid = this.getNetworkId( config.networkLength ),
		rid = randomGenerator( ),
		nnId = this.getNanoTime( config.timeLength );

	return ts + pid + nid + rid + nnId;
};

ClerobeeProto.cryptify = function( string, length ){
	return crypto.createHash('md5')
		.update( string, 'utf8')
		.digest('hex')
		.slice(-length );
};
ClerobeeProto.generateByLength = function( length ) {
	var self = this;
	var config = length ? createConfig( length ) : this.config;
	return innerGenerate.bind( self, config, function( ){ return self.getRandom( config.randomLength ); } )();
};
ClerobeeProto.generateByMasterID = function( masterID ) {
	var self = this;
	var config = createConfig( masterID.length );
	return innerGenerate.bind( self, config, function( ){ return self.derive( config, masterID ); } )();
};
ClerobeeProto.generateByReference = function( reference, length ) {
	var self = this;
	var config = length ? createConfig( length ) : this.config;
	var refString = this.cryptify( JSON.stringify( reference ), config.randomLength );
	return innerGenerate.bind( self, config, function( ){ return padHex.bind(self, refString, config.randomLength )(); } )();
};

ClerobeeProto.generate = function( basis, extra ) {
	return !basis || isNumber(basis) ? this.generateByLength(basis) : ( isString(basis) ? this.generateByMasterID(basis) : this.generateByReference(basis, extra) );
};

ClerobeeProto.isDerived = function( masterID, slaveID ) {
	if( !masterID || !slaveID || masterID.length !== slaveID.length )
		return false;

	var config = createConfig( masterID.length );

	var lengthP = config.timeLength + config.processLength + config.networkLength;
	var lengthR = lengthP + config.randomLength;

	var slaveRandom = slaveID.substring( lengthP, lengthR );

	return this.derive( config, masterID ) === slaveRandom;
}

ClerobeeProto.getRandom = function( randomLength, masterRandom, masterNano) {
	randomLength = randomLength || this.config.randomLength;

	var random = '';
	for( var i = 0; i<randomLength; i+= RANDOM_MAX_LENGTH ){
		var length = Math.min( randomLength-i, RANDOM_MAX_LENGTH );

		if( masterRandom && masterNano ){
			var sliceR = masterRandom.substring(i, i+length);

			random += padHex( Number( parseInt(sliceR, 36) + parseInt(masterNano, 36) ).toString(36), length );
		}
		else{
			random += this.toBase36String( Math.floor( Math.random() * 1e200 ), length );
		}
	}

	return random;
};
ClerobeeProto.getProcessId = function( processLength ) {
	processLength = processLength || this.config.processLength;

	return this.toBase36String( process.pid, processLength );
};
ClerobeeProto.getNetworkId = function( networkLength ) {
	networkLength = networkLength || this.config.networkLength;

	return this.cryptify( getNetworkAddress( os.networkInterfaces() ), networkLength );
};
ClerobeeProto.getTimestamp = function( timeLength ) {
	timeLength = timeLength || this.config-timeLength;

	return this.toBase36String( Date.now(), timeLength );
};
ClerobeeProto.getNanoTime = function( timeLength ) {
	timeLength = timeLength || this.config.timeLength;

	var time = process.hrtime();
	var nano = time[0] * 1e9 + time[1];

	// (nano + '').split('').reverse().join('')
	return this.toBase36String( nano, timeLength );
};

ClerobeeProto.toBase36String = function(value, length) {
	value = value || 0; length = length || 4;

	return padHex( Number( value ).toString(36), length);
};

module.exports = exports = Clerobee;