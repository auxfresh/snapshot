
import { createServer } from '../../dist/index.js';

const app = createServer();

export default async (req, res) => {
  return new Promise((resolve, reject) => {
    app(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
