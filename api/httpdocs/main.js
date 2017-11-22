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
							' ',
							'last request',
							'last trade price',
							'last trade amount',
							'ask price',
							'ask amount',
							'bid price',
							'bid amount'
						].forEach (spalte => {
							ret.push (elem ({
								tag: 'th',
								innerText: spalte
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
				innerText: name
			}),
			timr = elem ({
				tag: 'td',
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
		[
			'lastTradePrice',
			'lastTradeAmount',
			'askPrice',
			'askAmount',
			'bidPrice',
			'bidAmount'
		].forEach (spalte => {
			if (!elems[spalte]) elems[spalte] = elem ({ tag: 'td', appendTo: croot });
			elems[spalte].innerText = values[spalte];
		});
	};
}

function refresh () {
	ajax.get ('last-values', (err, result) => {
		if (err) console.log (err);
		else {
			SERVER_TIME = result.serverTime;
			for (var curr in result.values) {
				if (!currencies[curr]) currencies[curr] = new Currency (curr);
				currencies[curr].update (result.values[curr]);
			}
		}
		window.requestAnimationFrame (() => {
			timer = setTimeout (refresh, 300 + Math.random () * 400 | 0);
		});
	});
}
refresh ();