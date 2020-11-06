import { TickerEntry, TickerResponse, AssetPair } from './kraken-types';

export function convertTickerEntryToResponse(response: TickerEntry): TickerResponse {
  return {
    ask: {
      price: parseFloat(response.a[0]),
      wholeLogVolume: parseFloat(response.a[1]),
      lotVolume: parseFloat(response.a[2])
    },
    bid: {
      price: parseFloat(response.b[0]),
      wholeLogVolume: parseFloat(response.b[1]),
      lotVolume: parseFloat(response.b[2])
    },
    lastTrade: {
      price: parseFloat(response.c[0]),
      volume: parseFloat(response.c[1])
    },
    volume: {
      today: parseFloat(response.v[0]),
      last24h: parseFloat(response.v[1])
    },
    volumeWeightedAveragePrice: {
      today: parseFloat(response.p[0]),
      last24h: parseFloat(response.p[1])
    },
    numberOfTrades: {
      today: response.t[0],
      last24h: response.t[1]
    },
    low: {
      today: parseFloat(response.l[0]),
      last24h: parseFloat(response.l[1])
    },
    high: {
      today: parseFloat(response.h[0]),
      last24h: parseFloat(response.h[1])
    },
    todaysOpeningPrice: parseFloat(response.o)
  };
}


