var redis = require('redis'),
	client = redis.createClient({ host: process.env.REDIS_URL }),
	createWrappedRedisFunction = ( funcName ) => {
		return ( argsArray ) => {
			return new Promise((resolve, reject) => {
				client[ funcName ]( argsArray, (error, response) => {
					if( error !== null ) {
						reject( error );
					} else {
						resolve( response );
					}
				});
			});
		};
	};

module.exports = {
	expire: createWrappedRedisFunction('expire'),
	get: createWrappedRedisFunction('get'),
	set: createWrappedRedisFunction('set'),
	setKeyAndExpiry: ( key, value, expiresIn ) => {
		client.set( key, value, () => {
			client.expire( key, expiresIn );
		});
	}
};