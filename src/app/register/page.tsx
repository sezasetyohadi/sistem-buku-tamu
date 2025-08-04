import GuestForm from "@/components/GuestForm";

export const metadata = {
  title: 'Register - Guest Book System',
  description: 'Register as a guest in our system',
};

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Formulir Tamu</h1>
        <GuestForm />
      </div>
    </div>
  );
}
