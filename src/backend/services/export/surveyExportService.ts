import * as ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { SurveyQuestion, SurveyResponse } from '@/types/survey-types';

/**
 * Service for generating Excel exports for survey data
 */
export class SurveyExportService {
  /**
   * Generates an Excel workbook containing survey data
   * @param questions - Survey questions data
   * @param responses - Survey responses data
   * @param answers - Map of answers by respondent ID
   * @returns ExcelJS.Workbook
   */
  static async generateSurveyExcel(
    questions: SurveyQuestion[],
    responses: SurveyResponse[],
    answersByRespondent: Map<number, Map<number, SurveyResponse>>
  ): Promise<ExcelJS.Workbook> {
    // Get the current year for title
    const currentYear = new Date().getFullYear();
    const dateRange = `tanggal data (rentang kapan sampai kapan)`;
    
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hasil Survey');

    // Add worksheet columns with appropriate widths (A to Q columns)
    worksheet.columns = [
      { width: 5 },  // A
      { width: 40 }, // B 
      { width: 10 }, // C
      { width: 15 }, // D
      { width: 10 }, // E
      { width: 15 }, // F
      { width: 10 }, // G
      { width: 15 }, // H
      { width: 10 }, // I
      { width: 15 }, // J
      { width: 10 }, // K
      { width: 15 }, // L
      { width: 10 }, // M
      { width: 15 }, // N
      { width: 10 }, // O
      { width: 15 }, // P
      { width: 15 }  // Q
    ];

    // Set worksheet title
    worksheet.mergeCells('A1:Q1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `KUESIONER SURVEY KEPUASAN MASYARAKAT DISNAKERTRANS TH.${currentYear}`;
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.font = { bold: true, size: 14 };
    
    // Set worksheet subtitle
    worksheet.mergeCells('A2:Q2');
    const subtitleCell = worksheet.getCell('A2');
    subtitleCell.value = 'SURVEY KEPUASAN MASYARAKAT TERHADAP PELAYANAN PUBLIK DI DINAS TENAGA KERJA DAN TRANSMIGRASI PROVINSI JAWA TENGAH';
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subtitleCell.font = { bold: true, size: 12 };
    
    // Create the column headers on row 3
    const headerRow = worksheet.getRow(3);
    
    headerRow.getCell(1).value = 'NO';
    headerRow.getCell(2).value = 'Pertanyaan';
    headerRow.getCell(3).value = 'Rating 1';
    headerRow.getCell(4).value = 'Jawaban diperoleh';
    headerRow.getCell(5).value = 'Rating 2';
    headerRow.getCell(6).value = 'Jawaban diperoleh';
    headerRow.getCell(7).value = 'Rating 3';
    headerRow.getCell(8).value = 'Jawaban diperoleh';
    headerRow.getCell(9).value = 'Rating n';
    headerRow.getCell(10).value = 'Jawaban diperoleh';
    headerRow.getCell(17).value = dateRange;
    
    // Format the header row
    headerRow.eachCell({ includeEmpty: true }, (cell) => {
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
    });

    
    // Group questions by their section ID
    const questionGroups = questions.reduce<Record<number, SurveyQuestion[]>>((acc, q) => {
      const key = q.section_id || 0;
      if (!acc[key]) acc[key] = [];
      acc[key].push(q);
      return acc;
    }, {});
    
    // Track the row to add data to
    let currentRow = 4;
    
    // Get sorted section IDs to ensure correct ordering
    const sortedSections = Object.keys(questionGroups)
      .map(key => parseInt(key))
      .sort((a, b) => a - b);
    
    // Process each question group
    sortedSections.forEach((sectionId) => {
      const groupQuestions = questionGroups[sectionId];
      const isMainSection = sectionId !== 0 && groupQuestions.length > 0;
      let questionCounter = 1;
      
      // For multi-part questions, generate proper numbering
      if (isMainSection) {
        groupQuestions.forEach((question, idx) => {
          // Generate question numbering (1, 2.a, 2.b, etc.)
          const questionNum = idx === 0 ? sectionId.toString() : `${sectionId}${String.fromCharCode(97 + idx)}`; // a, b, c, ...
          
          const row = worksheet.addRow([]);
          row.getCell(1).value = questionNum;
          row.getCell(2).value = question.pertanyaan;
          
          // For rating questions, add all possible options
          if (question.tipe_jawaban === 'rating') {
            // Add rating options with their counts
            // Rating 1
            row.getCell(3).value = '1. opsi 1';
            row.getCell(4).value = 'n';
            
            // Rating 2
            row.getCell(5).value = '2. opsi 2';
            row.getCell(6).value = 'n';
            
            // Rating 3
            row.getCell(7).value = '3. opsi 3';
            row.getCell(8).value = 'n';
            
            // Rating n
            row.getCell(9).value = '4. opsi n';
            row.getCell(10).value = 'n';
          } else {
            // For text questions
            row.getCell(3).value = '*Jika tidak ada rating kosongkan';
          }
          
          // Apply styling to row cells
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= 10) { // Only add borders to content columns
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          });
          
          currentRow++;
          questionCounter++;
        });
      } else {
        // For standalone questions without baris grouping
        groupQuestions.forEach((question) => {
          const row = worksheet.addRow([]);
          row.getCell(1).value = `${questionCounter}`;
          row.getCell(2).value = question.pertanyaan;
          
          // Same rating options handling as above
          if (question.tipe_jawaban === 'rating') {
            // Rating 1
            row.getCell(3).value = '1. opsi 1';
            row.getCell(4).value = 'n';
            
            // Rating 2
            row.getCell(5).value = '2. opsi 2';
            row.getCell(6).value = 'n';
            
            // Rating 3
            row.getCell(7).value = '3. opsi 3';
            row.getCell(8).value = 'n';
            
            // Rating n
            row.getCell(9).value = '4. opsi n';
            row.getCell(10).value = 'n';
          } else {
            row.getCell(3).value = '*Jika tidak ada rating kosongkan';
          }
          
          // Apply styling to row cells
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber <= 10) {
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          });
          
          currentRow++;
          questionCounter++;
        });
      }
    });
    
    // Add feedback section
    this.addFeedbackSection(worksheet, currentRow, responses);
    
    return workbook;
  }
  
  /**
   * Adds the feedback section to the Excel worksheet
   */
  private static addFeedbackSection(worksheet: ExcelJS.Worksheet, startRow: number, responses: any[]): void {
    let currentRow = startRow;
    
    // Add the comments/feedback section header
    const feedbackHeaderRow = worksheet.addRow([]);
    feedbackHeaderRow.getCell(1).value = 'Masukan / Saran untuk perbaikan pelayanan (Jika Terdapat jawaban yang kurang, isikan saran/masukan.)';
    worksheet.mergeCells(`A${currentRow}:Q${currentRow}`);
    
    const headerCell = feedbackHeaderRow.getCell(1);
    headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
    headerCell.font = { bold: true };
    headerCell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    currentRow++;
    
    // Add placeholder rows for feedback
    // First row
    const placeholderRow1 = worksheet.addRow([]);
    placeholderRow1.getCell(1).value = '1';
    placeholderRow1.getCell(2).value = 'saran 1';
    worksheet.mergeCells(`B${currentRow}:Q${currentRow}`);
    placeholderRow1.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 2 || colNumber === 17) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
    currentRow++;
    
    // Second row
    const placeholderRow2 = worksheet.addRow([]);
    placeholderRow2.getCell(1).value = '2';
    placeholderRow2.getCell(2).value = 'saran 2';
    worksheet.mergeCells(`B${currentRow}:Q${currentRow}`);
    placeholderRow2.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 2 || colNumber === 17) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
    currentRow++;
    
    // Row n
    const placeholderRowN = worksheet.addRow([]);
    placeholderRowN.getCell(1).value = 'n';
    placeholderRowN.getCell(2).value = 'saran n';
    worksheet.mergeCells(`B${currentRow}:Q${currentRow}`);
    placeholderRowN.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= 2 || colNumber === 17) {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      }
    });
  }
  
  /**
   * Generates the Excel file name with date
   */
  static getExcelFileName(): string {
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'dd-MM-yyyy');
    return `Survey_Kepuasan_${formattedDate}.xlsx`;
  }
}
