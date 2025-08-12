import Link from "next/link";

export default function GuestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header untuk guests */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo dan brand */}
            <div className="flex items-center">
              <Link href="/guests" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                  T
                </div>
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  Sistem Buku Tamu
                </span>
              </Link>
            </div>

            {/* Navigation untuk guests */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/guests"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/register"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Pendaftaran Tamu
              </Link>
              <Link
                href="/survey"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Survey
              </Link>
            </nav>

            {/* Tombol kembali ke beranda */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 px-3 py-2 text-sm font-medium transition-colors"
              >
                ← Beranda
              </Link>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/guests"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/register"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium"
              >
                Pendaftaran Tamu
              </Link>
              <Link
                href="/survey"
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium"
              >
                Survey
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © 2025 DISNAKERTRANS Jawa Tengah. Sistem Buku Tamu Digital.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
