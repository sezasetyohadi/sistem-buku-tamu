import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating jawaban_survei table...');
  
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id int(11) NOT NULL AUTO_INCREMENT,
      responden_id int(11) NOT NULL,
      pertanyaan_id int(11) NOT NULL,
      jawaban int(11) NOT NULL,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      PRIMARY KEY (id),
      KEY pertanyaan_id (pertanyaan_id),
      KEY fk_responden (responden_id),
      KEY fk_opsi_rating (jawaban),
      FOREIGN KEY (jawaban) REFERENCES opsi_rating(id),
      FOREIGN KEY (responden_id) REFERENCES jawaban_identitas_survei(id),
      FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban survei table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_survei;`);
  console.log('Jawaban survei table dropped successfully');
}
