import GuestList from "@/components/GuestList";

export const metadata = {
  title: 'Admin - Guest Book System',
  description: 'Admin dashboard for the guest book system',
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome to the admin dashboard. Here you can manage all guests and system settings.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg shadow border border-blue-100">
            <h3 className="font-bold text-xl mb-2">Total Guests</h3>
            <p className="text-4xl font-bold text-blue-600">--</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg shadow border border-green-100">
            <h3 className="font-bold text-xl mb-2">Checked In</h3>
            <p className="text-4xl font-bold text-green-600">--</p>
          </div>
          
          <div className="bg-orange-50 p-6 rounded-lg shadow border border-orange-100">
            <h3 className="font-bold text-xl mb-2">Checked Out</h3>
            <p className="text-4xl font-bold text-orange-600">--</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Guest Management</h2>
          <GuestList />
        </div>
      </div>
    </div>
  );
}
