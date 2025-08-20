"use client";

import { useState } from "react";

type StatusType = "Diproses" | "Selesai" | "Ditolak";

type StatusItem = {
	id: number;
	nama: string;
	tanggal: string;
	status: StatusType;
	keterangan: string;
};

const dummyStatus: Record<string, StatusItem> = {
	ABC123: {
		id: 1,
		nama: "Permohonan Informasi",
		tanggal: "2025-08-20",
		status: "Diproses",
		keterangan: "Permohonan Anda sedang diproses oleh petugas.",
	},
	XYZ789: {
		id: 2,
		nama: "Permohonan Salinan",
		tanggal: "2025-08-18",
		status: "Selesai",
		keterangan: "Salinan informasi sudah dapat diambil.",
	},
};

const statusColor: Record<StatusType, string> = {
	Diproses: "bg-yellow-100 text-yellow-800",
	Selesai: "bg-green-100 text-green-800",
	Ditolak: "bg-red-100 text-red-800",
};

export default function StatusPengajuanPage() {
	const [token, setToken] = useState("");
	const [status, setStatus] = useState<StatusItem | null>(null);
	const [error, setError] = useState("");

	const handleCheck = () => {
		setError("");
		// Ganti dengan fetch ke API jika sudah ada backend
		const found = dummyStatus[token.trim()];
		if (found) {
			setStatus(found);
		} else {
			setStatus(null);
			setError("Token tidak ditemukan. Pastikan token sudah benar.");
		}
	};

	const handleReset = () => {
		setToken("");
		setStatus(null);
		setError("");
	};

	return (
		<div className="p-6 max-w-md mx-auto flex flex-col items-center">
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
					Masukkan token pengajuan Anda untuk melihat status.
				</p>
			</div>

			{!status && (
				<div className="w-full bg-white rounded-xl shadow p-6 flex flex-col items-center">
					<label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
						Token Pengajuan
					</label>
					<input
						type="text"
						className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg text-center text-lg tracking-widest"
						placeholder="Masukkan token di sini"
						value={token}
						onChange={(e) => setToken(e.target.value)}
						maxLength={16}
					/>
					<button
						onClick={handleCheck}
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
					>
						Cek Status
					</button>
					{error && (
						<div className="text-red-500 text-sm mt-3 text-center">
							{error}
						</div>
					)}
				</div>
			)}

			{status && (
				<div className="w-full bg-white rounded-xl shadow p-6 mt-6">
					<div className="flex items-center gap-3 mb-4">
						<img
							src="https://cdn-icons-png.flaticon.com/512/1827/1827349.png"
							alt="Status"
							className="w-8 h-8"
						/>
						<div>
							<div className="text-lg font-semibold text-gray-800">
								{status.nama}
							</div>
							<div className="text-sm text-gray-500">
								Tanggal: {status.tanggal}
							</div>
						</div>
					</div>
					<div
						className={`inline-block mb-4 px-3 py-1 rounded-full text-sm font-medium ${statusColor[status.status]}`}
					>
						{status.status}
					</div>
					<div className="text-gray-700 mb-4">{status.keterangan}</div>
					<button
						onClick={handleReset}
						className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
					>
						Kembali
					</button>
				</div>
			)}
		</div>
	);
}