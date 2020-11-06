import kraken from './kraken/kraken';
import { Client } from '@elastic/elasticsearch';
import { readFileSync } from 'fs';

process.on('uncaughtException', err => {
  console.error(err);
});

const client = new Client({
  node: 'https://elasticsearch-es-default:9200',
  auth: process.env.ESCREDS
    ? JSON.parse(decodeURIComponent(process.env.ESCREDS))
    : JSON.parse(readFileSync('esauth.json', 'utf8'))
});

const assetPair = 'XXBTZUSD';

setInterval(() => {
  kraken.getTickerInfo([assetPair])
    .then(result => {
      client.index({
        index: assetPair,
        body: result[assetPair]
      })
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.error(err);
      })
    })
    .catch(err => {
      throw err;
    });
}, 20 * 1000);
