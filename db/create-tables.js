'use strict';

var pgp = require('./db').pgp,
	db = require('./db').db;

db.any( pgp.QueryFile('./sql/tables.sql') )
	.then(function() {
		console.log( 'Tables were successfully created.' );
		process.exit(0);
	}).catch(function( error ) {
		console.log( error );
		process.exit(1);
	});