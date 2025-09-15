import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { createApiResponse } from '@/lib/api-response';

// GET - Retrieve all services
export async function GET() {
  const response = createApiResponse();
  
  try {
    const services = await executeQuery(
      'SELECT id, tujuan FROM tujuan_kunjungan WHERE id != 999 ORDER BY id ASC'
    );

    return response.success(services, 'Layanan berhasil diambil');
  } catch (error) {
    console.error('Error fetching services:', error);
    return response.error('Gagal mengambil data layanan', 500);
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const body = await request.json();
    const { tujuan } = body;

    // Validation
    if (!tujuan || typeof tujuan !== 'string' || tujuan.trim().length === 0) {
      return response.error('Nama layanan harus diisi', 400);
    }

    if (tujuan.trim().length > 100) {
      return response.error('Nama layanan maksimal 100 karakter', 400);
    }

    // Check if service already exists
    const existingService = await executeQuery(
      'SELECT id FROM tujuan_kunjungan WHERE LOWER(tujuan) = LOWER(?)',
      [tujuan.trim()]
    );

    if (Array.isArray(existingService) && existingService.length > 0) {
      return response.error('Layanan dengan nama tersebut sudah ada', 409);
    }

    // Insert new service
    const result = await executeQuery(
      'INSERT INTO tujuan_kunjungan (tujuan) VALUES (?)',
      [tujuan.trim()]
    );

    const insertId = (result as any).insertId;
    
    // Prevent creation of ID 999 (system reserved)
    if (insertId === 999) {
      // Delete the record that was just created
      await executeQuery('DELETE FROM tujuan_kunjungan WHERE id = ?', [insertId]);
      return response.error('ID 999 adalah sistem reserved. Silakan coba lagi.', 409);
    }

    const newService = {
      id: insertId,
      tujuan: tujuan.trim()
    };

    return response.created(newService, 'Layanan berhasil ditambahkan');
  } catch (error) {
    console.error('Error creating service:', error);
    return response.error('Gagal menambahkan layanan', 500);
  }
}

// PUT - Update a service
export async function PUT(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const body = await request.json();
    const { id, tujuan } = body;

    // Validation
    if (!id || !Number.isInteger(id) || id <= 0) {
      return response.error('ID layanan tidak valid', 400);
    }

    // Prevent editing system reserved service
    if (id === 999) {
      return response.error('ID layanan 999 adalah sistem reserved dan tidak dapat diubah', 403);
    }

    if (!tujuan || typeof tujuan !== 'string' || tujuan.trim().length === 0) {
      return response.error('Nama layanan harus diisi', 400);
    }

    if (tujuan.trim().length > 100) {
      return response.error('Nama layanan maksimal 100 karakter', 400);
    }

    // Check if service exists
    const serviceExists = await executeQuery(
      'SELECT id FROM tujuan_kunjungan WHERE id = ?',
      [id]
    );

    if (!Array.isArray(serviceExists) || serviceExists.length === 0) {
      return response.notFound('Layanan', 'Layanan tidak ditemukan');
    }

    // Check if service name already exists (excluding current service)
    const existingService = await executeQuery(
      'SELECT id FROM tujuan_kunjungan WHERE LOWER(tujuan) = LOWER(?) AND id != ?',
      [tujuan.trim(), id]
    );

    if (Array.isArray(existingService) && existingService.length > 0) {
      return response.error('Layanan dengan nama tersebut sudah ada', 409);
    }

    // Update service
    await executeQuery(
      'UPDATE tujuan_kunjungan SET tujuan = ? WHERE id = ?',
      [tujuan.trim(), id]
    );

    const updatedService = {
      id,
      tujuan: tujuan.trim()
    };

    return response.success(updatedService, 'Layanan berhasil diperbarui');
  } catch (error) {
    console.error('Error updating service:', error);
    return response.error('Gagal memperbarui layanan', 500);
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  const response = createApiResponse();
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id || !Number.isInteger(parseInt(id)) || parseInt(id) <= 0) {
      return response.error('ID layanan tidak valid', 400);
    }

    const serviceId = parseInt(id);

    // Prevent deleting system reserved service
    if (serviceId === 999) {
      return response.error('ID layanan 999 adalah sistem reserved dan tidak dapat dihapus', 403);
    }

    // Check if service exists
    const serviceExists = await executeQuery(
      'SELECT id FROM tujuan_kunjungan WHERE id = ?',
      [serviceId]
    );

    if (!Array.isArray(serviceExists) || serviceExists.length === 0) {
      return response.notFound('Layanan', 'Layanan tidak ditemukan');
    }

    // Check if service is being used by any guests
    const serviceUsage = await executeQuery(
      'SELECT COUNT(*) as count FROM daftar_tamu WHERE tujuan_kunjungan_id = ?',
      [serviceId]
    );

    if (Array.isArray(serviceUsage) && serviceUsage.length > 0 && (serviceUsage[0] as any).count > 0) {
      return response.error('Layanan tidak dapat dihapus karena sedang digunakan oleh tamu', 409);
    }

    // Delete service
    await executeQuery(
      'DELETE FROM tujuan_kunjungan WHERE id = ?',
      [serviceId]
    );

    return response.success(null, 'Layanan berhasil dihapus');
  } catch (error) {
    console.error('Error deleting service:', error);
    return response.error('Gagal menghapus layanan', 500);
  }
}
