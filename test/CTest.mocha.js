'use strict'

var Cerobee = require('../lib/clerobee')
var cerobee = new Cerobee( 256 )

let chai = require('chai')
let should = chai.should()

describe('clerobee', function () {

	var reference

	before(function (done) {
		console.log( '64::', cerobee.generate(64) )
		console.log( '48::', cerobee.generate(48) )
		console.log( '32::', cerobee.generate(32) )

		reference = { email: 'test@provider.org' }

		console.log( '\n Reference:', reference )

		done()
	})

	describe('ids', function () {
		it('should be generated with correct length', function (done) {
			cerobee.generate(16).should.to.have.length(16)

			done()
		})

		it('should be referred correctly', function (done) {
			var pID = cerobee.generate( reference, 128 )

			pID.should.to.have.length(128)

			cerobee.isSourced( { email: 'tests@provi.org' }, 128, pID ).should.to.be.false

			cerobee.isSourced( reference, 128, pID ).should.to.be.true

			done()
		})
	})

	after(function (done) {
		done()
	})
})
