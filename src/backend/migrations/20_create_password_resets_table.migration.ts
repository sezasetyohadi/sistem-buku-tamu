import { PoolConnection } from 'mysql2/promise';

export interface Migration {
  up(connection: PoolConnection): Promise<void>;
  down(connection: PoolConnection): Promise<void>;
}

export class CreatePasswordResetsTableMigration implements Migration {
  async up(connection: PoolConnection): Promise<void> {
    console.log('Creating password_resets table...');
    
    const createTableQuery = `
      CREATE TABLE password_resets (
        id INT(11) NOT NULL AUTO_INCREMENT,
        admin_id INT(11) NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_admin_id (admin_id),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;
    
    await connection.execute(createTableQuery);
    console.log('password_resets table created successfully');
  }

  async down(connection: PoolConnection): Promise<void> {
    console.log('Dropping password_resets table...');
    
    await connection.execute('DROP TABLE IF EXISTS password_resets');
    
    console.log('password_resets table dropped successfully');
  }
}

export default new CreatePasswordResetsTableMigration();
