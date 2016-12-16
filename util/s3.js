var aws = require('aws-sdk'),
	s3 = new aws.S3( {region: 'us-west-2'} ),
	params = {
		Bucket: 'howwhatwhy',
		Body: null,
		ContentType: 'text/json',
		Key: 'todays-data.json'
	};

function uploadToS3( jsonData ) {
	var siteData = {
		counts: {how: 0, what: 0, why: 0},
		headlines: []
	};

	// jsonData is of the form {how: [{href: ..., id: ..., text:....}, ...], what: [...], why: [...]}
	Object.keys(jsonData).map((type) => {
		siteData.counts[type] = jsonData[type].length;
		jsonData[type].map((headline) => {
			siteData.headlines.push({ href: headline.href, text: headline.text });
		});
	});

	params.Body = JSON.stringify( siteData );

	return new Promise((resolve, reject) => {
		s3.putObject( params, function ( error ) {
			if( error ) {
				reject( error );
			} else {
				resolve( 'file successfully uploaded' );
			}
		});
	});
}

exports.uploadToS3 = uploadToS3;