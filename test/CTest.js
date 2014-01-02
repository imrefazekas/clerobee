var os = require('os');
var should = require('should');

var Cerobee = require('../lib/clerobee');
var cerobee = new Cerobee( 256 );

exports.group = {

	testServices: function(test){
		console.log( '\n mID:', cerobee.generate(16) );
		console.log( '\n mID:', cerobee.generate(16) );

		var mID = cerobee.generate();
		console.log( '\n mID:', mID, mID.length );
		var sID = cerobee.generate( mID );
		console.log( '\n Derived:', sID, sID.length );

		console.log( '\n is new Derived:', cerobee.isDerived( mID, cerobee.generate() ) );
		console.log( '\n is sID derived:', cerobee.isDerived( mID, sID ) );

		var reference = { email:'test@provider.org' };
		var pID = cerobee.generate( reference, 128 );
		console.log( '\n pID:', pID, pID.length );

		console.log( '\n pID is referenced:', cerobee.isSourced( { email:'tests@provi.org' }, 128, pID ) );
		console.log( '\n pID is referenced:', cerobee.isSourced( reference, 128, pID ) );

		test.done( );
	}

};