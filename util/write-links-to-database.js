'use strict';

const pg = require('pg');
const linkLoader = require('./get-links-from-site');

if( process.env.NODE_ENV !== undefined ){
	pg.defaults.ssl = true;
}

let db = new pg.Client( process.env.DATABASE_URL );
db.connect();

let insertLinkIntoDatabase = ( link ) => {
	db.query('INSERT INTO links(id, href, text) VALUES($1, $2, $3)', [link.id, link.href, link.text])
		.catch((error)=> {
			//meh
		});
};

let writeSummaryToDatabase = ( ids )=> {
	return db.query(
		`INSERT INTO howwhatwhy(hows, whats, whys) VALUES('{${ids.how.join( ',' )}}', '{${ids.what.join( ',' )}}', '{${ids.why.join( ',' )}}')`
	);
};

linkLoader.getLinks()
	.then( ( links )=> {
		let linkIds = {};

		for( let type in links ) {
			let ids = [];

			if( links[type].length !== 0 ) {
				for( let link of links[type] ) {
					insertLinkIntoDatabase( link );
					ids.push( link.id );
				}
			}

			linkIds[ type ] = ids;
		}

		writeSummaryToDatabase( linkIds ).catch((err)=> {
			console.log( err );
			db.end();
			process.exit(1);
		}).then(()=>{
			db.end();
			process.exit(0);
		});
	});