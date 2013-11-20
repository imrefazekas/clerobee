var os = require('os');
var should = require('should');

var Cerobee = require('../lib/clerobee');
var cerobee = new Cerobee( 16 );

exports.group = {

	testServices: function(test){

		var mID = cerobee.generate();
		console.log( '\nmID:', mID );
		var sID = cerobee.generate( mID );
		console.log( '\nderived:', sID );
		console.log( '\nisDerived:', cerobee.isDerived( mID, cerobee.generate() ) );
		console.log( '\nisDerived:', cerobee.isDerived( mID, sID ) );

		test.done( );
	}

};