import fs from 'fs';
import path from 'path';
import { pool } from './config/database';



// Utility function to run migrations
async function runMigrations() {
  const migrationDir = path.join(__dirname, '../migrations');

  try {
    // Get the list of migration files
    const migrationFiles = fs.readdirSync(migrationDir).sort(); // Sort to ensure migrations run in order

    // Loop through each migration file
    for (const file of migrationFiles) {
      const filePath = path.join(migrationDir, file);

      // Check if migration has already been applied
      const migrationName = file.split('.')[0]; // Use file name as migration identifier
      const { rowCount } = await pool.query('SELECT 1 FROM migrations WHERE name = $1', [migrationName]);

      if (rowCount === 0) {
        console.log(`Running migration: ${migrationName}`);

        // Read and execute the SQL script
        const sql = fs.readFileSync(filePath, 'utf-8');
        await pool.query(sql);

        // Mark the migration as applied
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [migrationName]);
        console.log(`Migration ${migrationName} applied successfully.`);
      } else {
        console.log(`Migration ${migrationName} has already been applied.`);
      }
    }

    console.log('All migrations have been applied.');
  } catch (error) {
    console.error('Error running migrations:', error);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Run the migrations
runMigrations();
