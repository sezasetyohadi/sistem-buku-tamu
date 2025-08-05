import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const jenisRatingCount = await executeQuery<any[]>('SELECT COUNT(*) as count FROM jenis_rating');
  
  if (jenisRatingCount[0].count === 0) {
    // Insert jenis_rating data
    await executeQuery(`INSERT INTO jenis_rating (nama_rating) VALUES ('Skala 5')`);
    await executeQuery(`INSERT INTO jenis_rating (nama_rating) VALUES ('Skala 3')`);
    
    console.log('Jenis Rating seed data inserted successfully');
    
    // Insert opsi_rating data
    const skala5Data = [
      { skala: 'Sangat Baik', urutan: 1 },
      { skala: 'Baik', urutan: 2 },
      { skala: 'Cukup', urutan: 3 },
      { skala: 'Kurang', urutan: 4 },
      { skala: 'Sangat Kurang', urutan: 5 }
    ];
    
    const skala3Data = [
      { skala: 'Memuaskan', urutan: 1 },
      { skala: 'Cukup', urutan: 2 },
      { skala: 'Kurang Memuaskan', urutan: 3 }
    ];
    
    // Insert for Skala 5
    for (const item of skala5Data) {
      await executeQuery(`
        INSERT INTO opsi_rating (jenis_rating_id, skala_rating, urutan_rating)
        VALUES (1, ?, ?)
      `, [item.skala, item.urutan]);
    }
    
    // Insert for Skala 3
    for (const item of skala3Data) {
      await executeQuery(`
        INSERT INTO opsi_rating (jenis_rating_id, skala_rating, urutan_rating)
        VALUES (2, ?, ?)
      `, [item.skala, item.urutan]);
    }
    
    console.log('Opsi Rating seed data inserted successfully');
  } else {
    console.log('Rating data already exists, skipping seed');
  }
}
