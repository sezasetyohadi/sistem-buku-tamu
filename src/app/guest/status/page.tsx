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

// Dummy database untuk menyimpan token dan email
const tokenEmails: Record<string, string> = {
	ABC123: "user1@example.com",
	XYZ789: "user2@example.com",
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
	const [email, setEmail] = useState("");
	const [showForgotToken, setShowForgotToken] = useState(false);
	const [forgotTokenMessage, setForgotTokenMessage] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

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
		setShowForgotToken(false);
		setForgotTokenMessage("");
		setEmail("");
	};

	const handleForgotToken = async () => {
		if (!email.trim()) {
			setForgotTokenMessage("Silakan masukkan email Anda");
			return;
		}

		try {
			setIsSubmitting(true);
			setForgotTokenMessage("");

			// Kirim permintaan ke API untuk mendapatkan token
			const response = await fetch("/api/forgot-token", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (response.ok) {
				// Tampilkan alert bahwa token berhasil dikirim
				alert("Token berhasil dikirimkan");
				// Reset form dan kembali ke halaman input token
				handleReset();
			} else {
				// Tampilkan pesan error yang lebih informatif dari server
				setForgotTokenMessage(data.error || "Email tidak ditemukan");
			}
		} catch (err) {
			setForgotTokenMessage("Terjadi kesalahan saat mengirim token");
		} finally {
			setIsSubmitting(false);
		}
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
					Masukan token pengajuan Anda untuk melihat status.
				</p>
			</div>

			{!status && !showForgotToken && (
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
						className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
					>
						Cek Status
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

			{!status && showForgotToken && (
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
						{isSubmitting ? "Mengirim..." : "Kirim"}
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