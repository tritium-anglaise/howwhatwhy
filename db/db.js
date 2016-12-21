var pgp = require('pg-promise')(),
	db = pgp( process.env.DATABASE_URL );

var insertLinkIntoDatabase = ( link ) => {
	db.one('INSERT INTO links(id, href, text) VALUES($1, $2, $3)', [link.id, link.href, link.text])
		.catch((error)=> {
			//meh
		});
};

var writeSummaryToDatabase = ( ids )=> {
	return db.none(
		`INSERT INTO howwhatwhy(hows, whats, whys) VALUES('{${ids.how.join( ',' )}}', '{${ids.what.join( ',' )}}', '{${ids.why.join( ',' )}}')`
	);
};

exports.insertLinkIntoDatabase = insertLinkIntoDatabase;
exports.writeSummaryToDatabase = writeSummaryToDatabase;
exports.pgp = pgp;
exports.db = db;