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
      CONSTRAINT fk_opsi_rating FOREIGN KEY (jawaban) REFERENCES opsi_rating (id) ON DELETE NO ACTION ON UPDATE CASCADE,
      CONSTRAINT fk_responden FOREIGN KEY (responden_id) REFERENCES jawaban_identitas_survei (id) ON DELETE CASCADE,
      CONSTRAINT jawaban_survei_ibfk_1 FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  
  console.log('Jawaban_survei table created successfully');
}

export async function down() {
  await executeQuery(`DROP TABLE IF EXISTS jawaban_survei;`);
  console.log('Jawaban_survei table dropped successfully');
}
