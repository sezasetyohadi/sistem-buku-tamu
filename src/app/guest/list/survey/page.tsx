"use client";


import SurveyForm from '../../../components/SurveyForm';

export default function Survey() {

  // No longer needed as SurveyForm handles its own submissions

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6" style={{backgroundColor: '#EBF4FF', color: '#3D5DC3'}}>
              <span className="mr-2">📊</span>
              Survey Kepuasan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📋 Survey Kepuasan Pelayanan
            </h1>
            <p className="text-xl text-gray-800 max-w-2xl mx-auto">
              Bantu kami meningkatkan kualitas pelayanan dengan memberikan penilaian dan masukan Anda.
            </p>
          </div>

          {/* Survey Form */}
          <div className="max-w-4xl mx-auto">
            <SurveyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
