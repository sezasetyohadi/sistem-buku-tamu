import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating pertanyaan_s_jenis_rating table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS pertanyaan_s_jenis_rating (
      id int(11) NOT NULL AUTO_INCREMENT,
      pertanyaan_id int(11) NOT NULL,
      jenis_rating_id int(11) NOT NULL,
      urutan int(11) NULL DEFAULT 1,
      is_required tinyint(1) NULL DEFAULT 1,
      PRIMARY KEY (id),
      KEY fk_pjr_pertanyaan (pertanyaan_id),
      KEY fk_pjr_jenis (jenis_rating_id),
      FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating(id),
      FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Pertanyaan-jenis rating table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS pertanyaan_s_jenis_rating;`);
  console.log('Pertanyaan-jenis rating table dropped successfully');
}
