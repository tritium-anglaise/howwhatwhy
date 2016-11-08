var pgp = require('pg-promise')(),
	db = null,
	re = /^postgres:\/\/\//;

if( re.test( process.env.DATABASE_URL )) {
	db = pgp( process.env.DATABASE_URL );
} else {
/*
	Connecting to the production database requires that we enable to the ssl option in the config object,
	which, in turn, requires us to parse the provided connection string into said config object.

	The connection string is of the form postgres://user:pass@host:port/database
 */
	var parts = process.env.DATABASE_URL.split('postgres://')[1].split('@'),
		config = {
			database: '',
			host: '',
			password: parts[0].split(':')[1],
			ssl: true,
			username: parts[0].split(':')[0],
		};

		parts = parts[1].split('/');
		config.host = parts[0].substr(0, parts[0].indexOf(':'));
		config.database = parts[1];

	db = pgp(config);
}

exports.pgp = pgp;
exports.db = db;