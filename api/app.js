const CurrencyRetriever = require ('./currency-retriever');
const currencies = CurrencyRetriever.currencies;

const MONGO_CONFIG = {
	host: process.env.MONGO_HOST || (process.platform === 'linux' ? 'mongodb' : 'localhost'),
	port: 27017,
	db: 'kraken'
};
const MONGO_URL = 'mongodb://' + MONGO_CONFIG.host + ':' + MONGO_CONFIG.port + '/' + MONGO_CONFIG.db;

const HTTP_PORT = process.env.HTTP_PORT || 8080;
const DO_PRINT = (process.env.QUIET ? false : true);

if (DO_PRINT) {
	console.log ('----+------------+------------+-------------+------------+-------------');
	console.log ('curr| last trade |           ask            |           bid');
	console.log ('----+------------+------------+-------------+------------+-------------');
}


var lastValues = {};


const MongoClient = require ('mongodb').MongoClient;
MongoClient.connect (MONGO_URL, (err, db) => {
	if (err) throw err;
	var to = 0;
	var coll = db.collection ('ticker');

	CurrencyRetriever.currencies.forEach (currency => {
		setTimeout (() => {
			var lastSuccessfulRequest = -1;

			var ticker = new CurrencyRetriever (currency, 10000, (err, values) => {
				if (err) {
					if (err.message === 'Query:Unknown asset pair') {
						if (DO_PRINT) console.log ('Unknown currency: ' + currency + ' (no long attempting to track it)');
						ticker.stop ();
					}
					return;
				}

				var deltaSinceLastRequest = (lastSuccessfulRequest === -1 ? -1 : (Date.now () - lastSuccessfulRequest));
				lastSuccessfulRequest = Date.now ();

				coll.insertOne (exportableValues (currency, values, deltaSinceLastRequest), err => {
					if (DO_PRINT) console.log (
						currency + ' | ' +
						fw (sn (values.c[0]), 10) +
						' | ' + fw (sn (values.a[0]), 10) + ' | ' + fw (eur (values.a[2] * values.a[0]), 11) +
						' | ' + fw (sn (values.b[0]), 10) + ' | ' + fw (eur (values.b[2] * values.b[0]), 11) );
					if (err && DO_PRINT) console.log ('err storing data to db');
				});
			});

		}), (to++) * 1000;
	});

});

function exportableValues (currency, values, delta) {
	return lastValues[currency] = {
		time: Date.now (),
		timeSinceLastRequest: delta,
		currency: currency,
		lastTradePrice: parseFloat (values.c[0]),
		lastTradeAmount: parseFloat (values.c[1]),
		askPrice: parseFloat (values.a[0]),
		askAmount: parseFloat (values.a[2]),
		bidPrice: parseFloat (values.b[0]),
		bidAmount: parseFloat (values.b[2]),
		rawData: values
	};
}


if (HTTP_PORT) {
	var express = require ('express');
	var app = express ();
	app.use (express.static ('httpdocs'));
	app.get ('/last-values', (req, res) => {
		res.json ({
			serverTime: Date.now (),
			values: lastValues
		});
	});
	app.listen (HTTP_PORT, () => {
		if (DO_PRINT) console.log ('Server listening on Port ' + HTTP_PORT);
	});
}



/*
	a = ask array(<price>, <whole lot volume>, <lot volume>),
	b = bid array(<price>, <whole lot volume>, <lot volume>),
	c = last trade closed array(<price>, <lot volume>),
	v = volume array(<today>, <last 24 hours>),
	p = volume weighted average price array(<today>, <last 24 hours>),
	t = number of trades array(<today>, <last 24 hours>),
	l = low array(<today>, <last 24 hours>),
	h = high array(<today>, <last 24 hours>),
	o = today's opening price
*/

function sn (n) {
	var ns = ('' + n).split ('.');
	if (ns.length > 1) {
		while (ns[1].charAt (ns[1].length - 1) === '0') {
			ns[1] = ns[1].substr (0, ns[1].length - 1);
		}
		if (ns[1].length === 0) ns.pop ();
	}
	return ns.join ('.');
}

function eur (n) {
	var sn = ('' + (Math.round (n * 100) / 100)).split ('.');
	if (sn.length === 1) sn.push ('00');
	else {
		while (sn[1].length < 2) sn[1] += '0';
	}
	return sn.join ('.') + '€';
}

function fw (str, len) {
	var s = '' + str;
	while (s.length < len - 1) s = ' ' + s + ' ';
	if (s.length < len) s += ' ';
	return s;
}
