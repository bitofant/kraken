const assets = require ('./assets');
const krakenApi = require ('kraken-api');
const client = new krakenApi ('', '');


/**
 * 
 * @param {'XBT'|'BCH'|'XRP'|'DASH'|'ZEC'|'LTC'|'ETC'} currency 
 */
function CurrencyRetriever (currency, interval, onupdate) {
	var pair = getCurrencyID (currency) + assets.reverseLookup.EUR;
	if (pair === 'BCH' + 'ZEUR') pair = 'BCH' + 'EUR';
	else if (pair === 'DASH' + 'ZEUR') pair = 'DASH' + 'EUR';

	var timer = setInterval (() => {
		var t1 = Date.now ();
		client.publicMethod ('Ticker', {
			pair: pair
		}, (err, res) => {
			var t2 = Date.now () - t1;
			if (err) return onupdate (err);
			var values = res.result[pair];
			onupdate (null, values);
		});
	}, interval);

	this.stop = () => {
		clearInterval (timer);
		console.log ('Stopped tracking ' + currency);
	};

}

function getCurrencyID (name) {
	if (assets.reverseLookup[name]) return assets.reverseLookup[name];
	if (assets[name]) return name;
	throw Error ('Unable to find asset id "' + name + '"');
}

const currencies = ['XBT', 'BCH', 'DASH', 'ZEC', 'LTC', 'ETC', 'XRP'];
CurrencyRetriever.currencies = currencies;
CurrencyRetriever.XBT = assets.reverseLookup.XBT;
CurrencyRetriever.BCH = assets.reverseLookup.BCH;
CurrencyRetriever.DASH = assets.reverseLookup.DASH;
CurrencyRetriever.ZEC = assets.reverseLookup.ZEC;
CurrencyRetriever.LTC = assets.reverseLookup.LTC;
CurrencyRetriever.ETC = assets.reverseLookup.ETC;
CurrencyRetriever.XRP = assets.reverseLookup.XRP;

module.exports = CurrencyRetriever;
