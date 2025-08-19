import { executeQuery } from '../config/db';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const count = await executeQuery<any[]>('SELECT COUNT(*) as count FROM section_survei');
  
  if (count[0].count === 0) {
    // Insert section data exactly as in the SQL dump
    const sections = [
      { id: 1, nama: 'Section 1', urutan: 1 },
      { id: 2, nama: 'Section 2', urutan: 2 },
      { id: 3, nama: 'Section 3', urutan: 3 },
      { id: 4, nama: 'Section 4', urutan: 4 },
      { id: 5, nama: 'Section 5', urutan: 5 }
    ];
    
    for (const section of sections) {
      await executeQuery(`
        INSERT INTO section_survei (id, nama_section, urutan)
        VALUES (?, ?, ?)
      `, [section.id, section.nama, section.urutan]);
    }
    
    console.log('Section Survei seed data inserted successfully');
  } else {
    console.log('Section Survei data already exists, skipping seed');
  }
}
