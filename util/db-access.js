const db = require('../db/get-connection').db;

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