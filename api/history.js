import { handleGasHistoryProxy } from '../server/gas-history-proxy.js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  await handleGasHistoryProxy(req, res);
}
