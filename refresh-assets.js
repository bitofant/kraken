/*
	meant to be run separately
*/
const https = require ('https');
const fs = require ('fs');

https.request ('https://api.kraken.com/0/public/Assets', res => {
	var result = '';
	res.on ('data', chunk => {
		result += chunk.toString ('utf8');
	});
	res.on ('end', () => {
		var assets = JSON.parse (result).result;
		var reverseLookup = {};
		var currencies = [];
		for (var k in assets) {
			currencies.push (k);
			reverseLookup[assets[k].altname] = k;
		}
		assets.currencies = currencies;
		assets.reverseLookup = reverseLookup;
		console.log ('Discovered ' + currencies.length + ' assets');
		fs.writeFile ('api/assets.js', 'module.exports = ' + JSON.stringify (assets, null, '\t'), 'utf8', err => {
			console.log ('Assets stored');
		});
	});
}).end ();