import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating pendidikan_terakhir table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pendidikan_terakhir (
      id int(11) NOT NULL AUTO_INCREMENT,
      pendidikan_terakhir varchar(100) NOT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  // Insert default data
  await executeQuery(`
    INSERT IGNORE INTO pendidikan_terakhir (id, pendidikan_terakhir) VALUES
    (1, 'Tidak Sekolah'),
    (2, 'SD / Sederajat'),
    (3, 'SMP / Sederajat'),
    (4, 'SMA / Sederajat'),
    (5, 'Diploma'),
    (6, 'Sarjana'),
    (7, 'Pascasarjana');
  `);
  
  console.log('Pendidikan_terakhir table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pendidikan_terakhir;`);
  console.log('Pendidikan_terakhir table dropped successfully');
}
