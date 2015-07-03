var should = require("chai").should();

var Cerobee = require('../lib/clerobee');
var cerobee = new Cerobee( 256 );

describe("clerobee", function () {

	var mID, sID, reference;

	before(function(done){
		console.log( cerobee.generate(32) );

		mID = cerobee.generate();
		console.log( '\n mID:', mID, mID.length );
		sID = cerobee.generate( mID );
		console.log( '\n Derived:', sID, sID.length );

		reference = { email:'test@provider.org' };

		console.log( '\n Reference:', reference );

		done();
	});

	describe("ids", function () {
		it('should be generated with correct length', function(done){
			cerobee.generate(16).should.to.have.length(16);

			done();
		});
		it('should be derived correctly', function(done){
			cerobee.isDerived( mID, cerobee.generate() ).should.to.be.false;

			cerobee.isDerived( mID, sID ).should.to.be.true;

			done();
		});

		it('should be referred correctly', function(done){
			var pID = cerobee.generate( reference, 128 );

			pID.should.to.have.length(128);

			cerobee.isSourced( { email:'tests@provi.org' }, 128, pID ).should.to.be.false;

			cerobee.isSourced( reference, 128, pID ).should.to.be.true;

			done();
		});
	});

	after(function(done){
		done();
	});
});
