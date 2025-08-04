import SurveyForm from "@/components/SurveyForm";

export const metadata = {
  title: 'Survei Kepuasan - Sistem Buku Tamu',
  description: 'Survei kepuasan masyarakat terhadap layanan',
};

export default function SurveyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Survei Kepuasan Masyarakat</h1>
        <SurveyForm />
      </div>
    </div>
  );
}
