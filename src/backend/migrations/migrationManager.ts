import { executeQuery } from '../config/db';
import path from 'path';
import fs from 'fs/promises';

// Migration manager to handle database migrations
export class MigrationManager {
  private migrationsTableName = 'migrations';
  private seedsTableName = 'seeds';
  
  constructor() {}

  // Initialize migrations table if it doesn't exist
  async initMigrationTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(query);
    console.log('Migrations table initialized');
    
    const seedsQuery = `
      CREATE TABLE IF NOT EXISTS ${this.seedsTableName} (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await executeQuery(seedsQuery);
    console.log('Seeds table initialized');
  }

  // Get list of executed migrations
  async getExecutedMigrations(): Promise<string[]> {
    const query = `SELECT name FROM ${this.migrationsTableName}`;
    const results = await executeQuery<{name: string}[]>(query);
    return results.map(row => row.name);
  }
  
  // Get list of executed seeds
  async getExecutedSeeds(): Promise<string[]> {
    const query = `SELECT name FROM ${this.seedsTableName}`;
    const results = await executeQuery<{name: string}[]>(query);
    return results.map(row => row.name);
  }

  // Record that a migration has been executed
  async recordMigration(name: string): Promise<void> {
    const query = `INSERT INTO ${this.migrationsTableName} (name) VALUES (?)`;
    await executeQuery(query, [name]);
  }
  
  // Record that a seed has been executed
  async recordSeed(name: string): Promise<void> {
    const query = `INSERT INTO ${this.seedsTableName} (name) VALUES (?)`;
    await executeQuery(query, [name]);
  }

  // Run all pending migrations
  async runMigrations(): Promise<void> {
    await this.initMigrationTable();
    const executedMigrations = await this.getExecutedMigrations();
    
    // Get all migration files
    const migrationsDir = path.join(__dirname);
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.migration.ts') || file.endsWith('.migration.js'))
      .sort(); // Sort to ensure migrations run in order based on numeric prefix
    
    console.log('Found migration files:', migrationFiles);
    console.log('Migration files will execute in the order shown above to respect dependencies');
    
    // Execute migrations that haven't been run yet
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        try {
          const migration = require(path.join(migrationsDir, file));
          if (typeof migration.up === 'function') {
            await migration.up();
            await this.recordMigration(file);
            console.log(`Migration ${file} completed successfully`);
          } else {
            console.error(`Migration ${file} has no up() function`);
          }
        } catch (error) {
          console.error(`ERROR executing migration ${file}:`, error);
          console.error('This error might be due to a foreign key constraint. Check migration dependencies.');
          throw error; // Rethrow to stop the migration process
        }
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }
  }
  
  // Run all pending seeds
  async runSeeds(): Promise<void> {
    await this.initMigrationTable(); // Ensure tables are created
    const executedSeeds = await this.getExecutedSeeds();
    
    // Get all seed files
    const seedsDir = path.join(__dirname, '../seeds');
    const files = await fs.readdir(seedsDir);
    const seedFiles = files
      .filter(file => file.endsWith('.seed.ts') || file.endsWith('.seed.js'))
      .sort(); // Sort to ensure seeds run in order based on numeric prefix
    
    console.log('Found seed files:', seedFiles);
    console.log('Seed files will execute in the order shown above to respect dependencies');
    
    // Execute seeds that haven't been run yet
    for (const file of seedFiles) {
      if (!executedSeeds.includes(file)) {
        console.log(`Running seed: ${file}`);
        try {
          const seed = require(path.join(seedsDir, file));
          if (typeof seed.seed === 'function') {
            await seed.seed();
            await this.recordSeed(file);
            console.log(`Seed ${file} completed successfully`);
          } else {
            console.error(`Seed ${file} has no seed() function`);
          }
        } catch (error) {
          console.error(`ERROR executing seed ${file}:`, error);
          console.error('This error might be due to missing referenced data. Check seed dependencies.');
          throw error; // Rethrow to stop the seeding process
        }
      } else {
        console.log(`Skipping already executed seed: ${file}`);
      }
    }
  }

  // Run specific migration
  async runSingleMigration(fileName: string): Promise<void> {
    await this.initMigrationTable();
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.includes(fileName)) {
      console.log(`Migration ${fileName} already executed, skipping`);
      return;
    }
    
    const migrationPath = path.join(__dirname, fileName);
    try {
      console.log(`Running migration: ${fileName}`);
      const migration = require(migrationPath);
      if (typeof migration.up === 'function') {
        await migration.up();
        await this.recordMigration(fileName);
        console.log(`Migration ${fileName} completed`);
      } else {
        console.error(`Migration ${fileName} has no up() function`);
      }
    } catch (error) {
      console.error(`Failed to run migration ${fileName}:`, error);
      throw error;
    }
  }
  
  // Run specific seed
  async runSingleSeed(fileName: string): Promise<void> {
    await this.initMigrationTable();
    const executedSeeds = await this.getExecutedSeeds();
    
    if (executedSeeds.includes(fileName)) {
      console.log(`Seed ${fileName} already executed, skipping`);
      return;
    }
    
    const seedPath = path.join(__dirname, '../seeds', fileName);
    try {
      console.log(`Running seed: ${fileName}`);
      const seed = require(seedPath);
      if (typeof seed.seed === 'function') {
        await seed.seed();
        await this.recordSeed(fileName);
        console.log(`Seed ${fileName} completed`);
      } else {
        console.error(`Seed ${fileName} has no seed() function`);
      }
    } catch (error) {
      console.error(`Failed to run seed ${fileName}:`, error);
      throw error;
    }
  }
}

export default new MigrationManager();
