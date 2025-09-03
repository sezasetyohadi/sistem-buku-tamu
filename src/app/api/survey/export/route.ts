import { NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { SurveyExportService } from '@/backend/services/export/surveyExportService';
import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';

export async function GET() {
  try {
    // Query untuk mendapatkan data survei dengan format yang sesuai dengan gambar
    const query = `
    SELECT 
        ps.id AS pertanyaan_id, 
        ps.baris AS no, 
        ps.pertanyaan, 
        jr.id AS rating_id, 
        jr.nama_rating, 
        orp.urutan_rating, 
        orp.skala_rating AS opsi, 
        COUNT(js.id) AS jawaban_diperoleh 
    FROM pertanyaan_survei ps 
    JOIN pertanyaan_s_jenis_rating pjr 
        ON ps.id = pjr.pertanyaan_id 
    JOIN jenis_rating jr 
        ON pjr.jenis_rating_id = jr.id 
    JOIN opsi_rating orp 
        ON jr.id = orp.jenis_rating_id 
    LEFT JOIN jawaban_survei js 
        ON js.pertanyaan_id = ps.id 
       AND js.jawaban = orp.id 
    WHERE ps.is_aktif = 1
    GROUP BY ps.id, ps.baris, ps.pertanyaan, jr.id, jr.nama_rating, orp.urutan_rating, orp.skala_rating 
    ORDER BY ps.baris, pjr.urutan, orp.urutan_rating
    `;
    
    const rows = await executeQuery<any[]>(query);
    
    // Query untuk mendapatkan saran/masukan dari user
    const saranQuery = `
      SELECT 
        jis.id,
        jis.saran
      FROM jawaban_identitas_survei jis
      WHERE jis.saran IS NOT NULL AND jis.saran != ''
      ORDER BY jis.created_at DESC
    `;
    
    const saranData = await executeQuery<any[]>(saranQuery);
    
    // Ambil daftar semua rating yang ada di DB untuk kolom header
    const ratingSet = new Set<string>();
    for (const r of rows) {
      ratingSet.add(r.nama_rating);
    }
    const ratingList = Array.from(ratingSet); // contoh: ["Kinerja", "Tingkat Kepentingan"]

    // Membuat workbook baru
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Survey');
    
    // Hitung jumlah kolom berdasarkan jumlah rating
    const totalDataColumns = 2 + (ratingList.length * 2); // NO + Pertanyaan + (rating title + jawaban) per rating
    
    // Mengatur lebar kolom berdasarkan jumlah rating yang ditemukan
    const columns = [
      { width: 5 },  // A - NO
      { width: 40 }, // B - Pertanyaan
    ];
    
    // Tambahkan kolom untuk setiap rating dan jawaban
    ratingList.forEach(() => {
      columns.push(
        { width: 10 }, // Rating
        { width: 15 }  // Jawaban diperoleh
      );
    });
    
    sheet.columns = columns;
    
    // Judul dan subjudul
    const currentYear = new Date().getFullYear();
    const today = format(new Date(), 'dd-MM-yyyy');
    
    // Get column letters for merging cells based on actual data width
    const lastColLetter = String.fromCharCode(65 + totalDataColumns - 1); // Convert to column letter (A, B, C, etc.)
    
    // Set worksheet title
    sheet.mergeCells(`A1:${lastColLetter}1`);
    const titleCell = sheet.getCell('A1');
    titleCell.value = `KUESIONER SURVEY KEPUASAN MASYARAKAT DISNAKERTRANS TH.${currentYear}`;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { bold: true, size: 14 };
    
    // Set worksheet subtitle
    sheet.mergeCells(`A2:${lastColLetter}2`);
    const subtitleCell = sheet.getCell('A2');
    subtitleCell.value = 'SURVEY KEPUASAN MASYARAKAT TERHADAP PELAYANAN PUBLIK DI DINAS TENAGA KERJA DAN TRANSMIGRASI PROVINSI JAWA TENGAH';
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subtitleCell.font = { bold: true, size: 12 };
    
    // Add date outside the table
    const dateRow = sheet.addRow(['Tanggal Data:', today]);
    dateRow.getCell(1).font = { bold: true };
    dateRow.getCell(2).alignment = { horizontal: 'left' };
    
    // Add empty row after date
    sheet.addRow([]);
    
    // Buat header dinamis berdasarkan jenis rating yang ada
    const header = ['NO', 'Pertanyaan'];
    
    // Tambahkan nama rating sebagai header kolom
    for (const ratingName of ratingList) {
      header.push(ratingName, 'Jawaban');
    }
    
    const headerRow = sheet.addRow(header);
    
    // Format header - set style untuk semua kolom yang ada
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= totalDataColumns) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }  // Light gray background
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
    
    // Group data per pertanyaan
    const dataMap: Record<number, any> = {};
    for (const r of rows) {
      if (!dataMap[r.no]) {
        dataMap[r.no] = {
          pertanyaan: r.pertanyaan,
          ratings: {},
        };
      }
      if (!dataMap[r.no].ratings[r.nama_rating]) {
        dataMap[r.no].ratings[r.nama_rating] = [];
      }
      dataMap[r.no].ratings[r.nama_rating].push({
        opsi: r.opsi,
        jawaban: r.jawaban_diperoleh,
      });
    }
    
    // Isi data
    for (const no of Object.keys(dataMap)) {
      const item = dataMap[Number(no)];
      const maxOpsi = Math.max(
        ...Object.values(item.ratings).map((r: any) => r.length)
      );
      
      // Untuk pertanyaan dengan sub-pertanyaan (2a, 2b, dll)
      const isMainSection = no.includes('.');
      const questionNum = isMainSection ? no : no;
      
      for (let i = 0; i < maxOpsi; i++) {
        const row: any[] = [];
        if (i === 0) {
          row.push(questionNum, item.pertanyaan);
        } else {
          row.push('', '');
        }
        
        // Tambahkan data rating - tampilkan semua rating menyamping
        for (const ratingName of ratingList) {
          const opsi = item.ratings[ratingName]?.[i];
          if (opsi) {
            row.push(`${i + 1}. ${opsi.opsi}`, opsi.jawaban || '0');
          } else {
            row.push('', '0');
          }
        }
        
        const excelRow = sheet.addRow(row);
        
        // Apply styling - sesuaikan dengan jumlah kolom rating
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= totalDataColumns) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      }
    }
    
    // Tambahkan bagian saran/masukan
    const currentRow = sheet.rowCount + 1;
    
    // Header saran
    const feedbackHeaderRow = sheet.addRow([]);
    feedbackHeaderRow.getCell(1).value = 'Masukan / Saran untuk perbaikan pelayanan (Jika Terdapat jawaban yang kurang, isikan saran/masukan.)';
    sheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    
    const headerCell = feedbackHeaderRow.getCell(1);
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell.font = { bold: true };
    headerCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Tambahkan saran aktual dari pengguna
    if (saranData.length > 0) {
      saranData.forEach((saran, index) => {
        const saranRow = sheet.addRow([]);
        saranRow.getCell(1).value = index + 1;
        saranRow.getCell(2).value = saran.saran;
        sheet.mergeCells(`B${sheet.rowCount}:${lastColLetter}${sheet.rowCount}`);
        saranRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          if (colNumber <= totalDataColumns) {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          }
        });
      });
    } else {
      // Jika tidak ada saran, tambahkan baris kosong
      const emptySaranRow = sheet.addRow([]);
      emptySaranRow.getCell(1).value = '-';
      emptySaranRow.getCell(2).value = 'Tidak ada saran';
      sheet.mergeCells(`B${sheet.rowCount}:${lastColLetter}${sheet.rowCount}`);
      emptySaranRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= totalDataColumns) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });
    }
    
    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Get filename
    const fileName = SurveyExportService.getExcelFileName();
    
    // Return the Excel file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });
  } catch (error: any) {
    console.error('Error exporting survey data:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to export survey data',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
