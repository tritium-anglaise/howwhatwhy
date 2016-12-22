var api = require('../api/api'),
	aws = require('aws-sdk'),
	s3 = new aws.S3( {region: 'us-west-2'} );

function uploadToS3( jsonData ) {
	var params = {
		Bucket: 'howwhatwhy',
		Body: `var todaysData = ${jsonData}`,
		ContentType: 'text/json',
		Key: 'todays-data.json'
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