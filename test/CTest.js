var os = require('os');
var should = require('should');

var Cerobee = require('../lib/clerobee');
var cerobee = new Cerobee( 256 );

exports.group = {

	testServices: function(test){

		var mID = cerobee.generate();
		console.log( '\nmID:', mID, mID.length );
		var sID = cerobee.generate( mID );
		console.log( '\nderived:', sID, sID.length );

		console.log( '\nisDerived:', cerobee.isDerived( mID, cerobee.generate() ) );
		console.log( '\nisDerived:', cerobee.isDerived( mID, sID ) );

		test.done( );
	}

};