var Clerobee = require('../lib/clerobee')
var clerobee = new Clerobee( 256 )

let source = clerobee.generate( 32 )
let malsource = clerobee.generate( 32 )
let id = clerobee.generateBySource( source, 32 )

console.log( id, source )
console.log( clerobee.isSourced( source, 32, id ) )
console.log( clerobee.isSourced( malsource, 32, id ) )
