import fs from 'fs';
import path from 'path';
import { pool } from './pool';

export const runMigrations = async (): Promise<string[]> => {
  const client = await pool.connect();
  const executedMigrations: string[] = [];

  try {
    // 1. Create migrations tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch already executed migrations
    const res = await client.query('SELECT name FROM migrations ORDER BY id ASC;');
    const executedSet = new Set(res.rows.map((r: { name: string }) => r.name));

    // 3. Find migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[Migrator] No migrations directory found.');
      return [];
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      if (!executedSet.has(file)) {
        console.log(`[Migrator] Running migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1);', [file]);
          await client.query('COMMIT');
          console.log(`[Migrator] Successfully executed: ${file}`);
          executedMigrations.push(file);
        } catch (migrationErr) {
          await client.query('ROLLBACK');
          console.error(`[Migrator] Failed executing ${file}:`, migrationErr);
          throw migrationErr;
        }
      }
    }

    if (executedMigrations.length === 0) {
      console.log('[Migrator] Database is already up to date. No pending migrations.');
    }

    return executedMigrations;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('[Migrator] Migrations complete.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migrator] Migration process failed:', err);
      process.exit(1);
    });
}
