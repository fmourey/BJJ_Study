import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  development: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../videos.db'),
    logging: false,
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../videos.db'),
    logging: false,
  },
};
