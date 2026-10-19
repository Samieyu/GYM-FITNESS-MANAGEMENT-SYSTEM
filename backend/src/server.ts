import app from './app';
import { config } from './config';
import { pool } from './db/pool';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const startServer = async () => {
  let connected = false;
  let retries = 30;

  while (!connected && retries > 0) {
    try {
      const client = await pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();
      console.log(`[Database] PostgreSQL connected successfully at ${res.rows[0].now}`);
      connected = true;
    } catch (err: any) {
      retries--;
      console.warn(`[Database] Connection attempt failed: ${err.message}. Retries remaining: ${retries}`);
      if (retries === 0) {
        console.error('[Server] Exhausted database connection retries. Exiting.');
        process.exit(1);
      }
      await sleep(3000);
    }
  }

  try {
    app.listen(config.port, () => {
      console.log(`[Server] Running on http://localhost:${config.port}`);
      console.log(`[Server] Healthcheck: http://localhost:${config.port}/health`);
      console.log(`[Server] Environment: ${config.env}`);
    });
  } catch (err) {
    console.error('[Server] Failed to initialize express listener:', err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
// Hot-reloaded with configured Chapa live test keys
