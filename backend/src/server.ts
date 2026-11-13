import app from './app';
import { config } from './config';
import { pool } from './db/pool';
import { CronService } from './modules/cron/cron.service';
import { runMigrations } from './db/migrator';
import { seedDatabase } from './db/seed';
import { verifySmtpConnection } from './shared/services/emailService';

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

      // Automatically run schema migrations and fresh database seeding
      try {
        console.log('[Server] Checking and applying database schema migrations...');
        await runMigrations();

        const userCheck = await pool.query('SELECT COUNT(*) FROM users;');
        if (parseInt(userCheck.rows[0].count, 10) === 0) {
          console.log('[Server] Fresh database detected. Auto-seeding admin account, plans, and exercises...');
          await seedDatabase();
          console.log('[Server] Auto-seeding completed successfully.');
        }

        // Verify SMTP / Gmail email dispatch connection
        await verifySmtpConnection().catch(() => {});
      } catch (dbInitErr) {
        console.error('[Server] Automatic database migration/seed warning:', dbInitErr);
      }
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

      // Initialize automated daily expiration and reminder cron jobs
      const cronService = new CronService();
      cronService.startCronJobs();
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
