'use strict';

var pgp = require('./get-connection').pgp,
	db = require('./get-connection').db;

db.any( pgp.QueryFile('./sql/stored-procedures.sql') )
	.then(function() {
	    console.log( 'Stored procedures were successfully created.' );
		process.exit(0);
	}).catch(function( error ) {
	    console.log( error );
		process.exit(1);
	});