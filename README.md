Clerobee - a featureful UID generator
========
[clerobee](https://github.com/imrefazekas/clerobee) is a very handy utility library allowing to generate UIDs considering actual time, network resources and process in a distributed environment.


## Use cases
Following use cases are supported:
- Normal UIDs:
	Identifiers for general usage with length between 4 and 256. Can be used as cryptographic keys, user IDs, session keys, etc.

- Derived UIDs:
	To express ownership-like relations between identifiers.

	If you have to identify devices and be able to link them to a user with verify the ownership against the userID, then simply generate a UID for the user and generate derived UIDs for the devices.

	Therethrough the ownership of the device where for example a REST request is coming, can be verified.

- Sourced UIDs:
	Using a JS object data as source for the generation process.

	For example to generate product/license keys based on user information and to check if they can be matched while a possible registration process later on.


## Usage
```javascript
var Cerobee = require('clerobee');

// optional default length for the IDS is passed.
// 16 would be used if nothing is given.
var cerobee = new Cerobee( 128 );

...

// generate a normal UID with length of 128
var nID = cerobee.generate();

// generate a normal UID with length of 16
var nID_2 = cerobee.generate( 16 );

// Generates derived UID using the 'nID' as basis.
// Its length will be the same: 128
var sID = cerobee.generate( nID );

// Tests if 'sID' is really derived from 'nID'.
// Test will fail will any other UIDs but 'sID'
var test_1 = cerobee.isDerived( nID, sID );


// Creates user data
var customer = { email:'test@provider.org' };

// Generates Sourced UID based on customer data with length of 128
var pID = cerobee.generate( customer, 128 );

// Tests if the given sourced UID relly carries the given user data.
// Test will fail with any other pair of user data and UID but this
var test_2 = cerobee.isSourced( reference, 128, pID );
```

And that's it!


## License
[MIT](http://www.opensource.org/licenses/mit-license.php)


## Changelog

- 0.0.1: Initial release...
