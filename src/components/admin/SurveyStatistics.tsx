'use client';

import React from 'react';

interface SurveyStatistics {
  totalQuestions: number;
  activeQuestions: number;
  totalResponses: number;
  averageRating: number;
  completionRate: number;
  statistics: any[];
}

interface SurveyStatisticsProps {
  statistics: SurveyStatistics;
  responseCount: number;
}

export default function SurveyStatistics({ statistics, responseCount }: SurveyStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Total Responden</p>
            <p className="text-2xl font-bold">{responseCount}</p>
          </div>
          <div className="bg-blue-400 rounded-full p-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm">Rata-rata Rating</p>
            <p className="text-2xl font-bold">{statistics.averageRating.toFixed(1)}</p>
          </div>
          <div className="bg-green-400 rounded-full p-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Pertanyaan Aktif</p>
            <p className="text-2xl font-bold">{statistics.activeQuestions}/{statistics.totalQuestions}</p>
          </div>
          <div className="bg-orange-400 rounded-full p-3">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V6H6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
