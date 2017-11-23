const MONGO_CONFIG = {
	host: process.env.MONGO_HOST || (process.platform === 'linux' ? 'mongodb' : 'localhost'),
	port: 27017,
	db: 'kraken'
};
const MONGO_URL = 'mongodb://' + MONGO_CONFIG.host + ':' + MONGO_CONFIG.port + '/' + MONGO_CONFIG.db;

const MONGO_ORIGIN = 'mongodb://localhost:27017/kraken';
const MONGO_DESTINATION = 'mongodb://localhost:27018/kraken';

const MongoClient = require ('mongodb').MongoClient;

MongoClient.connect (MONGO_ORIGIN, (err, origin_db) => {
	if (err) throw err;
	MongoClient.connect (MONGO_DESTINATION, (err, dest_db) => {
		if (err) throw err;

		origin_db.collection ('ticker').count ({}, n => {
			console.log ('Entries: ' + n);
		});

	});
});