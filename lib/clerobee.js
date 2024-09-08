const os = require('os')
const crypto = require('crypto')

const toString = Object.prototype.toString

const ABC_CLEAN = [
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
]

const ABC = [
	'a',
	'b',
	'c',
	'd',
	'e',
	'f',
	'g',
	'h',
	'i',
	'j',
	'k',
	'l',
	'm',
	'n',
	'o',
	'p',
	'q',
	'r',
	's',
	't',
	'u',
	'v',
	'w',
	'x',
	'y',
	'z',
	'A',
	'B',
	'C',
	'D',
	'E',
	'F',
	'G',
	'H',
	'I',
	'J',
	'K',
	'L',
	'M',
	'N',
	'O',
	'P',
	'Q',
	'R',
	'S',
	'T',
	'U',
	'V',
	'W',
	'X',
	'Y',
	'Z',
]

const NUMS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const ABC_WITH_NUM = [].concat(NUMS).concat(ABC)

function isNumber(obj) {
	return toString.call(obj) === '[object ' + Number + ']' || !isNaN(obj)
}

function minmax(value, min, max) {
	return value < min ? min : value > max ? max : value
}

function createConfig(length, useSystemRefs) {
	if (length < 4 || length > 256) throw new Error('Length must be a number between 4 and 256.')

	var config = {
		processLength: length > 16 && useSystemRefs ? 2 : 0,
		networkLength: length > 16 && useSystemRefs ? 2 : 0,
		timeLength: minmax(Math.floor(length / 8), 2, 8),
		useSystemRefs: !!useSystemRefs,
	}
	config.randomLength =
		length - config.processLength - config.networkLength - 2 * config.timeLength

	return config
}

function getNetworkAddress(networkInterfaces) {
	for (var i in networkInterfaces) {
		for (var v in i) {
			if (
				networkInterfaces[i][v] &&
				networkInterfaces[i][v].address &&
				!networkInterfaces[i][v].internal
			) {
				return networkInterfaces[i][v].address
			}
		}
	}
	return os.hostname()
}

var DEFAULT_LENGTH = 32
var Clerobee = function Clerobee(length, useSystemRefs) {
	this.config = createConfig(length || DEFAULT_LENGTH, useSystemRefs)
}

function pushIfNotIncluded(array, ...elements) {
	for (let element of elements) {
		if (!array.includes(element)) array.push(element)
	}
	return array
}

Object.assign(Clerobee.prototype, {
	ABC_CLEAN,
	ABC,
	NUMS,
	ABC_WITH_NUM,

	rand(limit) {
		return Math.floor(Math.random() * limit)
	},

	randomElement(array) {
		if (!array || !Array.isArray(array)) throw Error(`Invalid array argument: ${array}`)

		return array[this.rand(array.length)]
	},

	randomElements(array, minNumber, maxNumber) {
		const elements = []
		const count = this.rand(Math.abs(Math.floor(maxNumber - minNumber)) + 1)

		let maxTry = 1000
		while (maxTry-- > 0 && elements.length < count) {
			pushIfNotIncluded(elements, this.randomElement(array))
		}

		return elements
	},

	generateNumericString(length) {
		return (Math.random() + '').split('.')[1].substring(0, length)
	},

	generateAbcString(length, options = {}) {
		let str = options.prefix || ''
		for (let i = 0; i < length; ++i) str += this.randomElement(ABC)
		return options.upperCaseOnly ? str.toUpperCase() : str
	},
	generateAbcNumString(length, options = {}) {
		let str = options.prefix || ''
		for (let i = 0; i < length; ++i) str += this.randomElement(ABC_WITH_NUM)
		return options.upperCaseOnly ? str.toUpperCase() : str
	},

	getRandom(randomLength) {
		return crypto.randomBytes((randomLength || this.config.randomLength) / 2).toString('hex')
	},

	padHex(hex, digits) {
		return hex.length >= digits
			? hex.substring(0, digits)
			: this.getRandom(digits - hex.length) + hex
	},

	getSliceRandom(config, uuid) {
		var lengthP = config.timeLength + config.processLength + config.networkLength
		var lengthR = lengthP + config.randomLength

		return uuid.substring(lengthP, lengthR)
	},

	cryptify(string, length) {
		return crypto.createHash('md5').update(string, 'utf8').digest('hex').slice(-length)
	},

	generateByLength(length) {
		var config = length ? createConfig(length, this.config.useSystemRefs) : this.config
		if (!config.useSystemRefs)
			return (
				this.getTimestamp(config.timeLength) +
				this.getRandom(config.randomLength) +
				this.getNanoTime(config.timeLength)
			)
		else
			return (
				this.getTimestamp(config.timeLength) +
				this.getProcessId(config.processLength) +
				this.getNetworkId(config.networkLength) +
				this.getRandom(config.randomLength) +
				this.getNanoTime(config.timeLength)
			)
	},

	generateBySource(reference, length) {
		var self = this
		var config = length ? createConfig(length, this.config.useSystemRefs) : this.config
		var refString = this.cryptify(JSON.stringify(reference), config.randomLength)

		if (!config.useSystemRefs)
			return (
				this.getTimestamp(config.timeLength) +
				self.padHex(refString, config.randomLength) +
				this.getNanoTime(config.timeLength)
			)
		else
			return (
				this.getTimestamp(config.timeLength) +
				this.getProcessId(config.processLength) +
				this.getNetworkId(config.networkLength) +
				self.padHex(refString, config.randomLength) +
				this.getNanoTime(config.timeLength)
			)
	},

	generate(basis, extra) {
		return !basis || isNumber(basis)
			? this.generateByLength(basis)
			: this.generateBySource(basis, extra)
	},

	isSourced(reference, length, uuid) {
		if (!reference || !length || !uuid) return false

		var config = createConfig(length, this.config.useSystemRefs)

		var refString = this.cryptify(JSON.stringify(reference), config.randomLength)

		var refRandom = this.getSliceRandom(config, uuid)

		return refRandom.substring(refRandom.length - refString.length) === refString
	},

	getProcessId(processLength) {
		processLength = processLength || this.config.processLength

		var pid = process && process.pid ? process.pid : Date.now()

		return this.toBase36String(pid, processLength)
	},

	getNetworkId(networkLength) {
		networkLength = networkLength || this.config.networkLength

		return this.cryptify(getNetworkAddress(os.networkInterfaces()), networkLength)
	},

	getTimestamp(timeLength) {
		timeLength = timeLength || this.config - timeLength

		return this.toBase36String(Date.now(), timeLength)
	},

	getNanoTime(timeLength) {
		timeLength = timeLength || this.config.timeLength

		var time = process && process.hrtime ? process.hrtime() : [1, Date.now()]
		var nano = time[0] * 1e9 + time[1]

		// return this.toBase36String( nano, timeLength )
		return this.toBase36String((nano + '').split('').reverse().join(''), timeLength)
	},

	toBase36String(value, length) {
		value = value || 0
		length = length || 4
		return this.padHex(Number(value).toString(16), length)
	},
})

module.exports = exports = Clerobee
