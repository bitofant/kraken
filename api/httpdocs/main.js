var timer;
var SERVER_TIME = Date.now ();

var wrapper = null;
elem ({
	tag: 'table',
	children: [
		wrapper = elem ({
			tag: 'tbody',
			children: [
				elem ({
					tag: 'tr',
					children: (() => {
						var ret = [];
						[
							'&nbsp;',
							'last request',
							'last trade price',
							'last trade amount',
							'price &times; amount',
							'ask price',
							'ask amount',
							'price &times; amount',
							'bid price',
							'bid amount',
							'price &times; amount'
						].forEach ((spalte, n) => {
							ret.push (elem ({
								tag: 'th',
								className: 'column-' + n,
								innerHTML: spalte
							}));
						});
						return ret;
					}) ()
				})
			]
		})
	],
	appendTo: document.body
});

var currencies = {};

function Currency (name) {
	var currentValues = '';
	var elems = {}, timr = null;
	var croot = elem ({
		tag: 'tr',
		children: [
			elem ({
				tag: 'td',
				className: 'column-0',
				innerText: name
			}),
			timr = elem ({
				tag: 'td',
				className: 'column-1',
				innerText: '0'
			})
		],
		appendTo: wrapper
	})
	this.update = values => {
		var delta = ('' + Math.round ((SERVER_TIME - values.time) / 100) / 10).split ('.');
		if (delta.length === 1) delta.push ('0');
		timr.innerText = delta.join ('.') + ' seconds';
		if (JSON.stringify (values) === currentValues) return;
		currentValues = JSON.stringify (values);
		values.lastTradeVolume = eur (values.lastTradePrice * values.lastTradeAmount);
		values.askVolume = eur (values.askPrice * values.askAmount);
		values.bidVolume = eur (values.bidPrice * values.bidAmount);
		[
			'lastTradePrice',
			'lastTradeAmount',
			'lastTradeVolume',
			'askPrice',
			'askAmount',
			'askVolume',
			'bidPrice',
			'bidAmount',
			'bidVolume'
		].forEach ((spalte, n) => {
			if (!elems[spalte]) elems[spalte] = elem ({ tag: 'td', className: 'column-' + (n+2), appendTo: croot });
			elems[spalte].innerText = values[spalte];
		});
	};
}

var SORTED_CURRENCIES = ['XBT', 'BCH', 'DASH', 'ZEC', 'LTC', 'ETC', 'XRP'];

function refresh () {
	ajax.get ('last-values', (err, result) => {
		if (err) console.log (err);
		else {
			SERVER_TIME = result.serverTime;
			SORTED_CURRENCIES.forEach (curr => {
				if (!result.values[curr]) return;
				if (!currencies[curr]) currencies[curr] = new Currency (curr);
				currencies[curr].update (result.values[curr]);
			});
		}
		window.requestAnimationFrame (() => {
			timer = setTimeout (refresh, 300 + Math.random () * 400 | 0);
		});
	});
}
refresh ();


function eur (n) {
	var sn = ('' + (Math.round (n * 100) / 100)).split ('.');
	if (sn.length === 1) sn.push ('00');
	else {
		while (sn[1].length < 2) sn[1] += '0';
	}
	return sn.join ('.') + '€';
}
