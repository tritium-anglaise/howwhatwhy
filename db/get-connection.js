var pgp = require('pg-promise')(),
	db = pgp( process.env.DATABASE_URL );

exports.pgp = pgp;
exports.db = db;