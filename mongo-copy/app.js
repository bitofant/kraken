const t1 = Date.now ();

const MONGO_ORIGIN = 'mongodb://localhost:27017/kraken';
const MONGO_DESTINATION = 'mongodb://localhost:27018/kraken';

const MongoClient = require ('mongodb').MongoClient;

MongoClient.connect (MONGO_ORIGIN, (err, origin_db) => {
	if (err) throw err;
	MongoClient.connect (MONGO_DESTINATION, (err, dest_db) => {
		if (err) throw err;

		var ticker = {
			origin: origin_db.collection ('ticker'),
			dest:     dest_db.collection ('ticker')
		};

		var count = 0;
		function doNext () {
			ticker.origin.findOne ({
				copied: {
					"$exists": false
				}
			}, (err, doc) => {
				if (err) throw err;
				if (doc === null) return done ();
				count++;
				var objID = doc._id;
				delete (doc._id);
				ticker.dest.insertOne (doc, (err ,res) => {
					if (err) throw err;
					ticker.origin.updateOne ({
						_id: objID
					}, {
						$set: {
							copied: true
						}
					}, (err, res) => {
						if (err) throw err;
						process.nextTick (doNext);
					});
				});
			});
		}
		doNext ();

		function done () {
			var timeTaken = Date.now () - t1;
			if (timeTaken > 1500) {
				timeTaken = (Math.round (timeTaken / 100) / 10) + ' s';
			} else {
				timeTaken = timeTaken + ' ms';
			}
			console.log ('copied ' + count + ' documents in ' + timeTaken);
			origin_db.close ();
			dest_db.close ();
		}

	});
});