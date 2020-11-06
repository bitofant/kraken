export interface AssetPair {
  "altname": string;
  "wsname": string;
  "aclass_base": "currency";
  "base": string;
  "aclass_quote": "currency";
  "quote": string;
  "lot": "unit";
  "pair_decimals": number;
  "lot_decimals": number;
  "lot_multiplier": number;
  "leverage_buy": number[];
  "leverage_sell": number[];
  "fees": Array<number[]>;
  "fees_maker": Array<number[]>;
  "fee_volume_currency": string;
  "margin_call": number;
  "margin_stop": number;
  "ordermin": string;
}

export interface TickerEntry {
  a: string[];
  b: string[];
  c: string[];
  v: string[];
  p: string[];
  t: number[];
  l: string[];
  h: string[];
  o: string;
}

export interface TickerResponse {
  ask: {
    price: number;
    wholeLogVolume: number;
    lotVolume: number;
  };
  bid: {
    price: number;
    wholeLogVolume: number;
    lotVolume: number;
  };
  lastTrade: {
    price: number;
    volume: number;
  };
  volume: {
    today: number;
    last24h: number;
  };
  volumeWeightedAveragePrice: {
    today: number;
    last24h: number;
  };
  numberOfTrades: {
    today: number;
    last24h: number;
  };
  low: {
    today: number;
    last24h: number;
  };
  high: {
    today: number;
    last24h: number;
  };
  todaysOpeningPrice: number;
}
