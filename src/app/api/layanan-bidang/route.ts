import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { createApiResponse } from '@/lib/api-response';

// GET - Retrieve layanan by bidang_id or all layanan
export async function GET(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const { searchParams } = new URL(request.url);
    const bidangId = searchParams.get('bidang_id');

    let query = `
      SELECT l.id, l.nama_layanan, l.bidang_id, b.bidang 
      FROM layanan_disnaker l
      JOIN bidang_tujuan b ON l.bidang_id = b.id
    `;
    const params: any[] = [];

    if (bidangId) {
      query += ' WHERE l.bidang_id = ?';
      params.push(bidangId);
    }

    query += ' ORDER BY l.bidang_id ASC, l.id ASC';

    const layanan = await executeQuery(query, params);

    return response.success(layanan, 'Layanan berhasil diambil');
  } catch (error) {
    console.error('Error fetching layanan:', error);
    return response.error('Gagal mengambil data layanan', 500);
  }
}

// POST - Create a new layanan
export async function POST(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const body = await request.json();
    const { nama_layanan, bidang_id } = body;

    // Validation
    if (!nama_layanan || typeof nama_layanan !== 'string' || nama_layanan.trim().length === 0) {
      return response.error('Nama layanan harus diisi', 400);
    }

    if (nama_layanan.trim().length > 255) {
      return response.error('Nama layanan maksimal 255 karakter', 400);
    }

    if (!bidang_id || !Number.isInteger(bidang_id) || bidang_id <= 0) {
      return response.error('Bidang harus dipilih', 400);
    }

    // Check if bidang exists
    const bidangExists = await executeQuery(
      'SELECT id FROM bidang_tujuan WHERE id = ?',
      [bidang_id]
    );

    if (!Array.isArray(bidangExists) || bidangExists.length === 0) {
      return response.error('Bidang tidak ditemukan', 404);
    }

    // Check if layanan already exists in the same bidang
    const existingLayanan = await executeQuery(
      'SELECT id FROM layanan_disnaker WHERE LOWER(nama_layanan) = LOWER(?) AND bidang_id = ?',
      [nama_layanan.trim(), bidang_id]
    );

    if (Array.isArray(existingLayanan) && existingLayanan.length > 0) {
      return response.error('Layanan dengan nama tersebut sudah ada di bidang ini', 409);
    }

    // Insert new layanan
    const result = await executeQuery(
      'INSERT INTO layanan_disnaker (nama_layanan, bidang_id) VALUES (?, ?)',
      [nama_layanan.trim(), bidang_id]
    );

    const insertId = (result as any).insertId;

    // Fetch the created layanan with bidang info
    const newLayanan = await executeQuery(
      `SELECT l.id, l.nama_layanan, l.bidang_id, b.bidang 
       FROM layanan_disnaker l
       JOIN bidang_tujuan b ON l.bidang_id = b.id
       WHERE l.id = ?`,
      [insertId]
    );

    return response.created(
      Array.isArray(newLayanan) && newLayanan.length > 0 ? newLayanan[0] : null,
      'Layanan berhasil ditambahkan'
    );
  } catch (error) {
    console.error('Error creating layanan:', error);
    return response.error('Gagal menambahkan layanan', 500);
  }
}

// PUT - Update a layanan
export async function PUT(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const body = await request.json();
    const { id, nama_layanan, bidang_id } = body;

    // Validation
    if (!id || !Number.isInteger(id) || id <= 0) {
      return response.error('ID layanan tidak valid', 400);
    }

    if (!nama_layanan || typeof nama_layanan !== 'string' || nama_layanan.trim().length === 0) {
      return response.error('Nama layanan harus diisi', 400);
    }

    if (nama_layanan.trim().length > 255) {
      return response.error('Nama layanan maksimal 255 karakter', 400);
    }

    if (!bidang_id || !Number.isInteger(bidang_id) || bidang_id <= 0) {
      return response.error('Bidang harus dipilih', 400);
    }

    // Check if layanan exists
    const layananExists = await executeQuery(
      'SELECT id FROM layanan_disnaker WHERE id = ?',
      [id]
    );

    if (!Array.isArray(layananExists) || layananExists.length === 0) {
      return response.error('Layanan tidak ditemukan', 404);
    }

    // Check if bidang exists
    const bidangExists = await executeQuery(
      'SELECT id FROM bidang_tujuan WHERE id = ?',
      [bidang_id]
    );

    if (!Array.isArray(bidangExists) || bidangExists.length === 0) {
      return response.error('Bidang tidak ditemukan', 404);
    }

    // Check if layanan already exists in the same bidang (excluding current id)
    const existingLayanan = await executeQuery(
      'SELECT id FROM layanan_disnaker WHERE LOWER(nama_layanan) = LOWER(?) AND bidang_id = ? AND id != ?',
      [nama_layanan.trim(), bidang_id, id]
    );

    if (Array.isArray(existingLayanan) && existingLayanan.length > 0) {
      return response.error('Layanan dengan nama tersebut sudah ada di bidang ini', 409);
    }

    // Update layanan
    await executeQuery(
      'UPDATE layanan_disnaker SET nama_layanan = ?, bidang_id = ? WHERE id = ?',
      [nama_layanan.trim(), bidang_id, id]
    );

    // Fetch updated layanan
    const updatedLayanan = await executeQuery(
      `SELECT l.id, l.nama_layanan, l.bidang_id, b.bidang 
       FROM layanan_disnaker l
       JOIN bidang_tujuan b ON l.bidang_id = b.id
       WHERE l.id = ?`,
      [id]
    );

    return response.success(
      Array.isArray(updatedLayanan) && updatedLayanan.length > 0 ? updatedLayanan[0] : null,
      'Layanan berhasil diperbarui'
    );
  } catch (error) {
    console.error('Error updating layanan:', error);
    return response.error('Gagal memperbarui layanan', 500);
  }
}

// DELETE - Delete a layanan
export async function DELETE(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      return response.error('ID layanan tidak valid', 400);
    }

    // Check if layanan exists
    const layananExists = await executeQuery(
      'SELECT id FROM layanan_disnaker WHERE id = ?',
      [id]
    );

    if (!Array.isArray(layananExists) || layananExists.length === 0) {
      return response.error('Layanan tidak ditemukan', 404);
    }

    // Check if layanan is being used
    const isUsed = await executeQuery(
      'SELECT id FROM daftar_tamu WHERE layanan_disnaker_id = ? LIMIT 1',
      [id]
    );

    if (Array.isArray(isUsed) && isUsed.length > 0) {
      return response.error('Layanan tidak dapat dihapus karena sedang digunakan', 409);
    }

    // Delete layanan
    await executeQuery(
      'DELETE FROM layanan_disnaker WHERE id = ?',
      [id]
    );

    return response.success(null, 'Layanan berhasil dihapus');
  } catch (error) {
    console.error('Error deleting layanan:', error);
    return response.error('Gagal menghapus layanan', 500);
  }
}
