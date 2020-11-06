import KrakenClient from './kraken-api';
import { TickerEntry, TickerResponse, AssetPair } from './kraken-types';
import fs from 'fs';
import { convertTickerEntryToResponse } from './kraken-converter';

interface Credentials {
  key: string;
  secret: string;
  otp?: string;
}

interface WrappedResult<T> {
  error: Error[],
  result: T
}

class Kraken {
  private readonly krakenClient: KrakenClient;

  constructor(private readonly credentials: Credentials) {
    this.krakenClient = new KrakenClient(
      credentials.key,
      credentials.secret,
      credentials.otp ? { otp: credentials.otp } : {}
    );
  }

  public getAssetPairs() {
    return new Promise<{[assetPair: string]: AssetPair}>((resolve, reject) => {
      this.krakenClient.publicMethod('AssetPairs', {})
        .then(this.resultUnwrapper(resolve, reject))
        .catch(reject);
    });
  }

  public getTickerInfo(assetPairs: string[]) {
    return new Promise<{[pair: string]: TickerResponse}>((resolve, reject) => {
      this.krakenClient.publicMethod('Ticker', { pair: assetPairs.join(',') })
        .then(this.resultUnwrapper((result: {[pair: string]: TickerEntry}) => {
          const results : {
            [pair: string]: TickerResponse;
          } = {};
          for (var k in result) {
            results[k] = convertTickerEntryToResponse(result[k])
          }
          resolve(results);
        }, reject))
        .catch(reject);
    });
  }

  private resultUnwrapper<T>(resolve: (result: T) => void, reject: (error: Error) => void) {
    return (result: WrappedResult<T>) => {
      this.unwrapResult(result, resolve, reject);
    };
  }

  private unwrapResult<T>(result: WrappedResult<T>, resolve: (result: T) => void, reject: (error: Error) => void) {
    if (result.error && result.error.length > 0) {
      if (result.error.length === 1) {
        reject(result.error[0]);
      } else {
        reject(new Error(result.error.map(err => err.message).join('; ')));
      }
    }
    resolve(result.result);
  }

}

const kraken = new Kraken(
  process.env.KRAKENCREDS
  ? JSON.parse(decodeURIComponent(process.env.KRAKENCREDS))
  : JSON.parse(fs.readFileSync('credentials.json', 'utf8'))
);

export default kraken;
