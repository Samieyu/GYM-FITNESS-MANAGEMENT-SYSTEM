import app from './app';
import { config } from './config';
import { pool } from './db/pool';

const startServer = async () => {
  try {
    // Verify PostgreSQL connection
    const client = await pool.connect();
    const res = await client.query('SELECT NOW()');
    client.release();
    console.log(`[Database] PostgreSQL connected successfully at ${res.rows[0].now}`);

    app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`);
      console.log(`[Server] Healthcheck: http://localhost:${config.port}/health`);
      console.log(`[Server] Environment: ${config.env}`);
    });
  } catch (err) {
    console.error('[Server] Failed to initialize server or database connection:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
// Hot-reloaded with configured Chapa live test keys
