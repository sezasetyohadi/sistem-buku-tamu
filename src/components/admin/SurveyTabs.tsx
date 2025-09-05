'use client';

import React from 'react';

interface SurveyTabsProps {
  activeTab: 'questions' | 'responses';
  onTabChange: (tab: 'questions' | 'responses') => void;
  responseCount: number;
  filteredResponsesLength: number;
}

export default function SurveyTabs({ 
  activeTab, 
  onTabChange, 
  responseCount, 
  filteredResponsesLength 
}: SurveyTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        <button
          onClick={() => onTabChange('questions')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === 'questions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Kelola Pertanyaan
        </button>
        <button
          onClick={() => onTabChange('responses')}
          className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
            activeTab === 'responses'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Lihat Respon Survei ({filteredResponsesLength || responseCount})
        </button>
      </nav>
    </div>
  );
}
