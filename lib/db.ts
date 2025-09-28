import { Pool } from 'pg';

const pool = new Pool({
  user: 'finance',
  password: 'XOOZTmlWKSkH',
  host: '52.206.60.184',
  port: 5666,
  database: 'finance',
  ssl: false
});

export default pool;