'use strict';

const pg = require('pg');

let db = new pg.Client( process.env.DATABASE_URL );

if( process.env.NODE_ENV !== undefined ){
	pg.defaults.ssl = true;
}

db.connect();

function createHowwhatwhyTable() {
	return db.query( 'CREATE TABLE public.howwhatwhy(id SERIAL PRIMARY KEY, timestamp TIMESTAMP DEFAULT LOCALTIMESTAMP, hows INTEGER[], whats INTEGER[], whys INTEGER[]);' );
}

function createLinksTable() {
	db.query( 'CREATE TABLE public.links( id INT PRIMARY KEY NOT NULL, href VARCHAR(255) NOT NULL, text VARCHAR(255) NOT NULL);' )
		.then(function() {
			db.query( 'CREATE UNIQUE INDEX links_id_uindex ON public.links (id);' );
		})
}

createHowwhatwhyTable()
	.then( createLinksTable )
	.then( function() {
		db.end();
		process.exit(0);
	});