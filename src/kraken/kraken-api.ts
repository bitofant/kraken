import got from 'got';
import crypto2 from 'crypto';
import qs from 'qs';

// Public/Private method names
const methods = {
	public  : [ 'Time', 'Assets', 'AssetPairs', 'Ticker', 'Depth', 'Trades', 'Spread', 'OHLC' ],
	private : [ 'Balance', 'TradeBalance', 'OpenOrders', 'ClosedOrders', 'QueryOrders', 'TradesHistory', 'QueryTrades', 'OpenPositions', 'Ledgers', 'QueryLedgers', 'TradeVolume', 'AddOrder', 'CancelOrder', 'DepositMethods', 'DepositAddresses', 'DepositStatus', 'WithdrawInfo', 'Withdraw', 'WithdrawStatus', 'WithdrawCancel', 'GetWebSocketsToken' ],
};

// Default options
const defaults = {
	url     : 'https://api.kraken.com',
	version : 0,
	timeout : 5000,
};

// Create a signature for a request
function getMessageSignature (path: string, request: string, secret: string, nonce: string) {
	const message       = qs.stringify(request);
	const secret_buffer = new Buffer(secret, 'base64');
	const hash          = crypto2.createHash('sha256');
	const hmac          = crypto2.createHmac('sha512', secret_buffer);
	const hash_digest   = hash.update(nonce + message).digest('hex');
	const hmac_digest   = hmac.update(path + hash_digest).digest('base64');

	return hmac_digest;
};

// Send an API request
const rawRequest = async (url: string, headers: {[header:string]: string}, data: any, timeout: number) => {
	// Set custom User-Agent string
	headers['User-Agent'] = 'Kraken Javascript API Client';

	const options = { headers, timeout };

	Object.assign(options, {
		method : 'POST',
		body   : qs.stringify(data),
  });
  console.log(options);

	const { body } = await got(url, options);
	const response = JSON.parse(body);

	if(response.error && response.error.length) {
		const error = response.error
			.filter((e: string) => e.startsWith('E'))
			.map((e: string) => e.substr(1));

		if(!error.length) {
			throw new Error("Kraken API returned an unknown error");
		}

		throw new Error(error.join(', '));
	}

	return response;
};

interface KrakenClientSettings {
  key: string;
  secret: string;
  otp?: string;
  url: string;
  version: number;
  timeout: number;
}

class KrakenClient {
  private config: KrakenClientSettings;
	constructor(key: string, secret: string, options:{otp?:string,timeout?:number}) {
		this.config = Object.assign({ key, secret }, defaults, options);
	}

	api(method: string, params: any) {
		if(methods.public.includes(method)) {
			return this.publicMethod(method, params);
		}
		else if(methods.private.includes(method)) {
			return this.privateMethod(method, params);
		}
		else {
			throw new Error(method + ' is not a valid API method.');
		}
	}

	/**
	 * This method makes a public API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	publicMethod(method: string, params: any) {
		params = params || {};

		const path     = '/' + this.config.version + '/public/' + method;
		const url      = this.config.url + path;
		const response = rawRequest(url, {}, params, this.config.timeout);

		return response;
	}

	/**
	 * This method makes a private API request.
	 * @param  {String}   method   The API method (public or private)
	 * @param  {Object}   params   Arguments to pass to the api call
	 * @param  {Function} callback A callback function to be executed when the request is complete
	 * @return {Object}            The request object
	 */
	privateMethod(method: string, params: any) {
		params = params || {};

		const path = '/' + this.config.version + '/private/' + method;
		const url  = this.config.url + path;

		if(!params.nonce) {
			params.nonce = Date.now() * 1000; // spoof microsecond
		}

		if(this.config.otp !== undefined) {
			params.otp = this.config.otp;
		}

		const signature = getMessageSignature(
			path,
			params,
			this.config.secret,
			params.nonce
		);

		const headers = {
			'API-Key'  : this.config.key,
			'API-Sign' : signature,
		};

		const response = rawRequest(url, headers, params, this.config.timeout);

		return response;
	}
}

export default KrakenClient;