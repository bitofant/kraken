const krakenApi = require ('kraken-api');
const client = new krakenApi ('', '');


/**
 * 
 * @param {'XBT'|'BCH'|'XRP'|'DASH'|'ZEC'|'LTC'|'ETC'} currency 
 */
function CurrencyRetriever (currency, interval, onupdate) {
	var pair = 'X' + currency + 'ZEUR';

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

const currencies = ['XBT', 'BCH', 'DASH', 'ZEC', 'LTC', 'ETC', 'XRP'];
CurrencyRetriever.currencies = currencies;
CurrencyRetriever.XBT = 'XBT';
CurrencyRetriever.BCH = 'BCH';
CurrencyRetriever.DASH = 'DASH';
CurrencyRetriever.ZEC = 'ZEC';
CurrencyRetriever.LTC = 'LTC';
CurrencyRetriever.ETC = 'ETC';
CurrencyRetriever.XRP = 'XRP';

module.exports = CurrencyRetriever;
