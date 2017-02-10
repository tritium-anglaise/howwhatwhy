var api = require('../api/api'),
	aws = require('aws-sdk'),
	s3 = new aws.S3({ region: 'us-west-2' }),
	zlib = require('zlib');

function uploadToS3( jsonData ) {
	var params = {
		Bucket: 'howwhatwhy.france-chance.com',
		Body: zlib.gzipSync(`var todaysData = ${jsonData}`),
		ContentType: 'application/javascript',
		ContentEncoding: 'gzip',
		Key: 'todays-data.js'
	};

	return new Promise((resolve, reject) => {
		s3.putObject( params, function ( error ) {
			if( error ) {
				console.log( error );
				reject( error );
			} else {
				resolve( 'file successfully uploaded' );
			}
		});
	});
}

exports.uploadToS3 = uploadToS3;