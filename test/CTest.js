var os = require('os');
var should = require('should');

var Cerobee = require('../lib/clerobee');
var cerobee = new Cerobee( 256 );

exports.group = {

	testServices: function(test){
		var mID = cerobee.generate();
		console.log( '\n mID:', mID, mID.length );
		var sID = cerobee.generate( mID );
		console.log( '\n Derived:', sID, sID.length );

		console.log( '\n is new Derived:', cerobee.isDerived( mID, cerobee.generate() ) );
		console.log( '\n is sID derived:', cerobee.isDerived( mID, sID ) );


		var pID = cerobee.generate( { email:'test@provider.org' }, 128 );
		console.log( '\n pID:', pID, pID.length );

		test.done( );
	}

};