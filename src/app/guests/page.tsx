import GuestList from "@/components/GuestList";

export const metadata = {
  title: 'Guests - Guest Book System',
  description: 'View and manage all guests in the system',
};

export default function GuestsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Guest List</h1>
        <GuestList />
      </div>
    </div>
  );
}
