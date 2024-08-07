var os = require('os')
var crypto = require('webcrypto')

var toString = Object.prototype.toString

let ABC = [
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

let ABC_WITH_NUM = [
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
].concat( ABC )

function isNumber (obj) {
	return (toString.call(obj) === '[object ' + Number + ']') || !isNaN(obj)
}

function minmax (value, min, max) {
	return value < min ? min : (value > max ? max : value)
}

function createConfig (length, useSystemRefs) {
	if ( length < 4 || length > 256 )
		throw new Error('Length must be a number between 4 and 256.')

	var config = {
		processLength: length > 16 && useSystemRefs ? 2 : 0,
		networkLength: length > 16 && useSystemRefs ? 2 : 0,
		timeLength: minmax( Math.floor( length / 8 ), 2, 8 ),
		useSystemRefs: !!useSystemRefs
	}
	config.randomLength = length - config.processLength - config.networkLength - 2 * config.timeLength

	return config
}

function getNetworkAddress (networkInterfaces) {
	for (var i in networkInterfaces) {
		for (var v in i) {
			if (networkInterfaces[i][v] && networkInterfaces[i][v].address && !networkInterfaces[i][v].internal) {
				return networkInterfaces[i][v].address
			}
		}
	}
	return os.hostname()
}

var DEFAULT_LENGTH = 32
var Clerobee = function Clerobee ( length, useSystemRefs ) {
	this.config = createConfig( length || DEFAULT_LENGTH, useSystemRefs )
}

var clerobee = Clerobee.prototype

clerobee.generateNumericString = function ( length ) {
	return (Math.random() + '').split('.')[1].substring(0, length)
}

clerobee.generateAbcString = function ( length, options = {} ) {
	let str = options.prefix || ''
	for (let i = 0; i < length; ++i)
		str += ABC[ Math.floor(Math.random() * ABC.length) ]
	return options.upperCaseOnly ? str.toUpperCase() : str
}
clerobee.generateAbcNumString = function ( length, options = {} ) {
	let str = options.prefix || ''
	for (let i = 0; i < length; ++i)
		str += ABC_WITH_NUM[ Math.floor(Math.random() * ABC.length) ]
	return options.upperCaseOnly ? str.toUpperCase() : str
}

clerobee.getRandom = function ( randomLength ) {
	return crypto.randomBytes( (randomLength || this.config.randomLength) / 2 ).toString('hex')
}

clerobee.padHex = function (hex, digits) {
	return hex.length >= digits ? hex.substring(0, digits) : this.getRandom(digits - hex.length) + hex
}

clerobee.getSliceRandom = function ( config, uuid ) {
	var lengthP = config.timeLength + config.processLength + config.networkLength
	var lengthR = lengthP + config.randomLength

	return uuid.substring( lengthP, lengthR )
}

clerobee.cryptify = function ( string, length ) {
	return crypto.createHash('md5')
		.update( string, 'utf8')
		.digest('hex')
		.slice( -length )
}

clerobee.generateByLength = function ( length ) {
	var config = length ? createConfig( length, this.config.useSystemRefs ) : this.config
	if ( !config.useSystemRefs )
		return this.getTimestamp( config.timeLength ) + this.getRandom( config.randomLength ) + this.getNanoTime( config.timeLength )
	else
		return this.getTimestamp( config.timeLength ) + this.getProcessId( config.processLength ) + this.getNetworkId( config.networkLength ) + this.getRandom( config.randomLength ) + this.getNanoTime( config.timeLength )
}

clerobee.generateBySource = function ( reference, length ) {
	var self = this
	var config = length ? createConfig( length, this.config.useSystemRefs ) : this.config
	var refString = this.cryptify( JSON.stringify( reference ), config.randomLength )

	if ( !config.useSystemRefs )
		return this.getTimestamp( config.timeLength ) + self.padHex(refString, config.randomLength) + this.getNanoTime( config.timeLength )
	else
		return this.getTimestamp( config.timeLength ) + this.getProcessId( config.processLength ) + this.getNetworkId( config.networkLength ) + self.padHex(refString, config.randomLength) + this.getNanoTime( config.timeLength )
}

clerobee.generate = function ( basis, extra ) {
	return !basis || isNumber(basis) ? this.generateByLength(basis) : this.generateBySource(basis, extra)
}

clerobee.isSourced = function ( reference, length, uuid ) {
	if ( !reference || !length || !uuid )
		return false

	var config = createConfig( length, this.config.useSystemRefs )

	var refString = this.cryptify( JSON.stringify( reference ), config.randomLength )

	var refRandom = this.getSliceRandom(config, uuid)

	return refRandom.substring(refRandom.length - refString.length) === refString
}

clerobee.getProcessId = function ( processLength ) {
	processLength = processLength || this.config.processLength

	var pid = (process && process.pid) ? process.pid : Date.now()

	return this.toBase36String( pid, processLength )
}

clerobee.getNetworkId = function ( networkLength ) {
	networkLength = networkLength || this.config.networkLength

	return this.cryptify( getNetworkAddress( os.networkInterfaces() ), networkLength )
}

clerobee.getTimestamp = function ( timeLength ) {
	timeLength = timeLength || this.config - timeLength

	return this.toBase36String( Date.now(), timeLength )
}

clerobee.getNanoTime = function ( timeLength ) {
	timeLength = timeLength || this.config.timeLength

	var time = (process && process.hrtime) ? process.hrtime() : [1, Date.now()]
	var nano = time[0] * 1e9 + time[1]

	// return this.toBase36String( nano, timeLength )
	return this.toBase36String( (nano + '').split('').reverse().join(''), timeLength )
}

clerobee.toBase36String = function (value, length) {
	value = value || 0
	length = length || 4
	return this.padHex( Number( value ).toString(16), length)
}

module.exports = exports = Clerobee
