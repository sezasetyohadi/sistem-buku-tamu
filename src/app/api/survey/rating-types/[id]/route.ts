import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ratingTypeId = parseInt(id);

    // Validate rating type ID
    if (isNaN(ratingTypeId)) {
      return NextResponse.json(
        { success: false, message: 'ID rating tidak valid' },
        { status: 400 }
      );
    }

    // Check if rating type exists
    const existingRating = await executeQuery(
      'SELECT id, nama_rating FROM jenis_rating WHERE id = ?',
      [ratingTypeId]
    ) as any[];

    if (existingRating.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Rating tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if rating type is being used in any questions
    const usageCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM pertanyaan_s_jenis_rating WHERE jenis_rating_id = ?',
      [ratingTypeId]
    ) as any[];

    if (usageCheck[0]?.count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Rating "${existingRating[0].nama_rating}" sedang digunakan dalam ${usageCheck[0].count} pertanyaan survei dan tidak dapat dihapus` 
        },
        { status: 409 }
      );
    }

    // Start transaction
    await executeQuery('START TRANSACTION');

    try {
      // Delete rating options first (foreign key constraint)
      await executeQuery(
        'DELETE FROM opsi_rating WHERE jenis_rating_id = ?',
        [ratingTypeId]
      );

      // Delete the rating type
      const deleteResult = await executeQuery(
        'DELETE FROM jenis_rating WHERE id = ?',
        [ratingTypeId]
      ) as any;

      if (deleteResult.affectedRows === 0) {
        throw new Error('Failed to delete rating type');
      }

      // Commit transaction
      await executeQuery('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Rating "${existingRating[0].nama_rating}" berhasil dihapus`
      });

    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error deleting rating type:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus rating' 
      },
      { status: 500 }
    );
  }
}