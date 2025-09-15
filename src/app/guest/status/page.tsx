'use client';

import { format, parseISO } from 'date-fns';
import { useState } from 'react';

import { showToast } from '@/lib/toast';

// Tipe data untuk status kunjungan sesuai dengan database
type GuestStatusType = 'Menunggu' | 'Terjadwal' | 'Datang' | 'Selesai';

// Fungsi untuk memformat tanggal
const formatDate = (dateString: string | null | undefined): string => {
	if (!dateString) {return 'Tidak tersedia';}
	try {
		const date = parseISO(dateString);
		return format(date, 'dd MMMM yyyy, HH:mm');
	} catch (error) {
		console.error('Error formatting date:', error);
		return dateString;
	}
};

// Tipe data untuk detail tamu yang akan ditampilkan
type GuestDetail = {
	id: number;
	nama: string;
	email?: string;
	nomor_telp?: string;
	alamat?: string;
	jenis_kelamin: string;
	pendidikan_terakhir?: string;
	profesi?: string;
	asal_instansi?: string;
	keperluan?: string;
	bidang_tujuan?: string;
	asn_dituju?: string;
	status_kunjungan: GuestStatusType;
	jadwal_checkin?: string | null;
	waktu_checkin?: string | null;
	waktu_checkout?: string | null;
	waktu_dibuat?: string | null;
	jadwal_dibuat?: string | null;
	file_upload?: string | null;
	catatan_tambahan?: string;
};

// Mapping warna untuk status kunjungan
const statusColor: Record<GuestStatusType, string> = {
	Menunggu: 'bg-yellow-100 text-yellow-800',
	Terjadwal: 'bg-orange-100 text-orange-800',
	Datang: 'bg-blue-100 text-blue-800',
	Selesai: 'bg-green-100 text-green-800',
};

export default function StatusPengajuanPage() {
	const [token, setToken] = useState('');
	const [guestDetail, setGuestDetail] = useState<GuestDetail | null>(null);
	const [error, setError] = useState('');
	const [email, setEmail] = useState('');
	const [showForgotToken, setShowForgotToken] = useState(false);
	const [forgotTokenMessage, setForgotTokenMessage] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Format tanggal untuk tampilan yang konsisten
	const formatDate = (dateString?: string | null) => {
		if (!dateString) {return 'Belum tersedia';}
		
		try {
			const date = new Date(dateString);
			return new Intl.DateTimeFormat('id-ID', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			}).format(date);
		} catch (error) {
			return 'Format tanggal tidak valid';
		}
	};

	const handleCheck = async () => {
		if (!token.trim()) {
			setError('Silakan masukkan token terlebih dahulu');
			return;
		}

		setError('');
		setIsLoading(true);
		
		try {
			// Fetch data tamu berdasarkan token menggunakan endpoint yang benar
			const response = await fetch(`/api/tokens?token=${token.trim()}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			
			const data = await response.json();
			
			if (response.ok && data.success && data.data.details) {
				// Mapping status dari API ke GuestStatusType
				const statusMapping: Record<string, GuestStatusType> = {
					registered: 'Menunggu',
					scheduled: 'Terjadwal',
					checked_in: 'Datang',
					completed: 'Selesai'
				};
				
				// Mengambil detail tamu dari respons API
				const details = data.data.details;
				const apiStatus = data.data.status;
				
				// Membuat objek GuestDetail dari data API
				const guestData: GuestDetail = {
					id: details.id,
					nama: details.nama,
					email: details.email,
					nomor_telp: details.nomor_telp,
					alamat: details.alamat,
					jenis_kelamin: details.jenis_kelamin,
					pendidikan_terakhir: details.pendidikan_terakhir,
					profesi: details.profesi,
					asal_instansi: details.asal_instansi,
					keperluan: details.keperluan,
					bidang_tujuan: details.bidang_tujuan || details.bidang,
					asn_dituju: details.asn_dituju,
					status_kunjungan: statusMapping[apiStatus] || details.status_kunjungan,
					jadwal_checkin: details.jadwal_checkin,
					waktu_checkin: details.waktu_checkin,
					waktu_checkout: details.waktu_checkout,
					waktu_dibuat: details.waktu_dibuat,
					jadwal_dibuat: details.jadwal_dibuat,
					file_upload: details.file_upload,
					catatan_tambahan: details.catatan_tambahan
				};
				
				setGuestDetail(guestData);
			} else {
				setGuestDetail(null);
				setError(data.message || 'Token tidak ditemukan. Pastikan token sudah benar.');
			}
		} catch (err) {
			console.error('Error fetching guest data:', err);
			setGuestDetail(null);
			setError('Terjadi kesalahan saat mengambil data. Silakan coba lagi.');
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		setToken('');
		setGuestDetail(null);
		setError('');
		setShowForgotToken(false);
		setForgotTokenMessage('');
		setEmail('');
	};

	const handleForgotToken = async () => {
		if (!email.trim()) {
			setForgotTokenMessage('Silakan masukkan email Anda');
			return;
		}

		try {
			setIsSubmitting(true);
			setForgotTokenMessage('');

			// Kirim permintaan ke API untuk mendapatkan token
			const response = await fetch('/api/forgot-token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				// Tampilkan notifikasi bahwa token berhasil dikirim
				showToast.success('Token berhasil dikirimkan');
				// Reset form dan kembali ke halaman input token
				handleReset();
			} else {
				// Tampilkan pesan error yang lebih informatif dari server
				setForgotTokenMessage(data.error || 'Email tidak ditemukan');
			}
		} catch (err) {
			setForgotTokenMessage('Terjadi kesalahan saat mengirim token');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-4 sm:p-6 max-w-2xl mx-auto flex flex-col items-center relative">
			<div className="flex flex-col items-center mb-8">
				<img
					src="https://cdn-icons-png.flaticon.com/512/1827/1827349.png"
					alt="Status"
					className="w-16 h-16 mb-2"
				/>
				<h1 className="text-2xl font-bold text-gray-900 mb-1">
					Status Pengajuan
				</h1>
				<p className="text-gray-700 text-center">
					Masukan token pengajuan Anda untuk melihat status.
				</p>
			</div>

			{!guestDetail && !showForgotToken && (
			<div className="w-full bg-white rounded-xl shadow p-6 flex flex-col items-center">
				<label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
					Token Pengajuan
				</label>
				<input
					type="text"
					className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg text-center text-lg tracking-widest"
					placeholder="Masukan token di sini"
					value={token}
					onChange={(e) => setToken(e.target.value)}
					maxLength={16}
				/>
				<button
					onClick={handleCheck}
					disabled={isLoading}
					className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
				>
					{isLoading ? 'Mencari...' : 'Cek Status'}
				</button>
				<button
					onClick={() => setShowForgotToken(true)}
					className="w-full mt-3 text-blue-600 text-sm hover:underline"
				>
					Lupa token?
				</button>
				{error && (
					<div className="text-red-500 text-sm mt-3 text-center">
						{error}
					</div>
				)}
			</div>
		)}

			{!guestDetail && showForgotToken && (
				<div className="w-full bg-white rounded-xl shadow p-6 flex flex-col items-center">
					<h2 className="text-lg font-semibold text-gray-800 mb-4">Lupa Token?</h2>
					<p className="text-gray-600 text-sm text-center mb-4">
						Masukkan email yang terdaftar untuk menerima token Anda.
					</p>
					<input
						type="email"
						className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg"
						placeholder="Email Anda"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
					<button
						onClick={handleForgotToken}
						disabled={isSubmitting}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
					>
						{isSubmitting ? 'Mengirim...' : 'Kirim'}
					</button>
					<button
						onClick={() => setShowForgotToken(false)}
						className="w-full mt-3 text-gray-600 text-sm hover:underline"
					>
						Kembali
					</button>
					{forgotTokenMessage && (
					<div className={`text-sm mt-3 text-center p-3 rounded-lg ${forgotTokenMessage.includes('berhasil') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
						{forgotTokenMessage}
					</div>
				)}
				</div>
			)}

			{guestDetail && (
				<div className="w-full bg-white rounded-xl shadow p-6 mt-6">
					{/* Header dengan avatar dan info dasar */}
					<div className="flex items-center pb-4 border-b border-gray-200">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
							<span className="text-lg font-bold text-red-600">
								{guestDetail.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
							</span>
						</div>
						<div className="ml-4 flex-grow">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-xl font-semibold text-gray-900">{guestDetail.nama}</h3>
									<div className="flex items-center mt-1">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor[guestDetail.status_kunjungan]}`}>
											{guestDetail.status_kunjungan === 'Datang' ? 'Proses' : guestDetail.status_kunjungan}
										</span>
										<span className="ml-2 text-sm text-gray-500">ID: {guestDetail.id}</span>
									</div>
								</div>
								{/* Tampilkan jadwal kunjungan */}
								{guestDetail.jadwal_checkin && (
									<div className="text-right hidden sm:block">
										<h4 className="text-sm font-medium text-gray-500">Jadwal Kunjungan</h4>
										<p className="text-base font-medium text-blue-600">{formatDate(guestDetail.jadwal_checkin)}</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Container for scheduled visit information */}
					{(guestDetail.status_kunjungan === 'Terjadwal' || guestDetail.status_kunjungan === 'Datang' || guestDetail.status_kunjungan === 'Selesai') && (
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 mt-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
								<div>
									<h4 className="text-sm font-medium text-gray-500">Jadwal Kunjungan</h4>
									<p className="text-base font-medium text-blue-700">{formatDate(guestDetail.jadwal_checkin)}</p>
								</div>
								
								<div>
									<h4 className="text-sm font-medium text-gray-500">Bidang Dituju</h4>
									<p className="text-base font-medium text-blue-700">{guestDetail.bidang_tujuan || 'Belum ditetapkan'}</p>
								</div>

								{guestDetail.asn_dituju && (
									<div className="md:col-span-2">
										<h4 className="text-sm font-medium text-gray-500">Menemui (ASN)</h4>
										<p className="text-base font-medium text-blue-700">{guestDetail.asn_dituju}</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Grid informasi dua kolom */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
						{/* Kolom kiri */}
						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-gray-500">Email</h4>
								<p className="mt-1 text-gray-900 break-words">{guestDetail.email || 'Tidak tersedia'}</p>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-gray-500">Nomor Telepon</h4>
								<p className="mt-1 text-gray-900">{guestDetail.nomor_telp || 'Tidak tersedia'}</p>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-gray-500">Jenis Kelamin</h4>
								<p className="mt-1 text-gray-900">{guestDetail.jenis_kelamin}</p>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-gray-500">Pendidikan Terakhir</h4>
								<p className="mt-1 text-gray-900">{guestDetail.pendidikan_terakhir || 'Tidak tersedia'}</p>
							</div>
						</div>
						
						{/* Kolom kanan */}
						<div className="space-y-4">
							<div>
								<h4 className="text-sm font-medium text-gray-500">Profesi</h4>
								<p className="mt-1 text-gray-900">{guestDetail.profesi || 'Tidak tersedia'}</p>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-gray-500">Asal Instansi</h4>
								<p className="mt-1 text-gray-900">{guestDetail.asal_instansi || 'Tidak tersedia'}</p>
							</div>
							
							<div>
								<h4 className="text-sm font-medium text-gray-500">Alamat</h4>
								<p className="mt-1 text-gray-900 whitespace-pre-wrap">{guestDetail.alamat || 'Tidak tersedia'}</p>
							</div>
						</div>
					</div>
					
					{/* Bagian lebar penuh */}
					<div className="pt-4 border-t border-gray-200 mt-4">
						<div className="flex items-center">
							<h4 className="text-sm font-medium text-gray-500">Keperluan</h4>
						</div>
						<div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
							<p className="text-gray-900 whitespace-pre-wrap">{guestDetail.keperluan || 'Tidak tersedia'}</p>
						</div>
						
						{/* Catatan Tambahan */}
						{guestDetail.catatan_tambahan && (
							<div className="mt-4">
								<div className="flex items-center">
									<h4 className="text-sm font-medium text-gray-500">Catatan Tambahan</h4>
								</div>
								<div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
									<p className="text-gray-900 whitespace-pre-wrap">{guestDetail.catatan_tambahan}</p>
								</div>
							</div>
						)}
						
						{/* Bidang Dituju information is shown in the blue container for scheduled visits */}

						{/* Informasi Waktu */}
						<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<h4 className="text-sm font-medium text-gray-500">Waktu Pendaftaran</h4>
								<p className="mt-1 text-gray-900">{formatDate(guestDetail.waktu_dibuat)}</p>
							</div>
							
							{guestDetail.waktu_checkin && (
								<div>
									<h4 className="text-sm font-medium text-gray-500">Waktu Kedatangan</h4>
									<p className="mt-1 text-gray-900">{formatDate(guestDetail.waktu_checkin)}</p>
								</div>
							)}
							
							{guestDetail.waktu_checkout && (
								<div>
									<h4 className="text-sm font-medium text-gray-500">Waktu Selesai</h4>
									<p className="mt-1 text-gray-900">{formatDate(guestDetail.waktu_checkout)}</p>
								</div>
							)}
						</div>
					</div>

					<button
						onClick={handleReset}
						className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition mt-6"
					>
						Kembali
					</button>
				</div>
			)}
		</div>
	);
}