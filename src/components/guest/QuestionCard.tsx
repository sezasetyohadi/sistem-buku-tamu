"use client";

import { SurveyQuestion } from '@/types/survey-types';

interface QuestionCardProps {
  question: SurveyQuestion;
  onRatingChange: (questionId: number, optionId: number, ratingTypeId?: number) => void;
  onTextChange: (questionId: number, text: string, ratingTypeId?: number) => void;
  focusedDropdowns: {[key: string]: boolean};
  handleDropdownMouseDown: (key: string) => void;
  handleDropdownBlur: (key: string) => void;
  handleDropdownChange: (key: string) => void;
}

export default function QuestionCard({
  question,
  onRatingChange,
  onTextChange,
  focusedDropdowns,
  handleDropdownMouseDown,
  handleDropdownBlur,
  handleDropdownChange
}: QuestionCardProps) {
  const isTextQuestion = question.tipe_jawaban === 'teks' || question.tipe_pertanyaan === 'text';
  const hasMultipleRatingTypes = question.ratingOptions && Array.isArray(question.ratingOptions) && 
    question.ratingOptions.length > 0 && question.ratingOptions[0].rating_type_id;
  
  // Map rating type IDs to their display names
  const getRatingTypeName = (typeId: number | undefined): string => {
    if (!typeId) return 'Rating';
    
    switch(typeId) {
      case 1: return 'Skala 5';
      case 2: return 'Skala 3';
      case 3: return 'Text';
      case 4: return 'Kinerja';
      case 5: return 'Tingkat Kepentingan';
      default: return 'Rating';
    }
  };
  
  // Debug output
  console.log(`Rendering question ${question.id}:`, {
    question,
    isTextQuestion,
    hasMultipleRatingTypes,
    ratingTypeName: getRatingTypeName(question.jenis_rating_id)
  });

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <p className="text-gray-900 font-medium mb-4">
        {question.pertanyaan}
        {(question.is_required === true || question.is_required === 1) ? (
          <span className="text-red-500 ml-1">*</span>
        ) : (
          <span className="text-gray-500 ml-2 text-sm">(Opsional)</span>
        )}
      </p>
      
      {isTextQuestion ? (
        // Text Input for text-type questions
        <div className="relative">
          <textarea
            name={`question-${question.id}`}
            onChange={(e) => {
              onTextChange(question.id, e.target.value);
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white text-gray-900 hover:bg-gray-50 focus:bg-white resize-none"
            rows={4}
            placeholder="Ketikkan jawaban Anda..."
            required={question.is_required === true || question.is_required === 1}
          />
        </div>
      ) : hasMultipleRatingTypes ? (
        // Multiple Rating Types in one card
        <div className="space-y-4">
          {question.ratingOptions?.map((ratingGroup: any, groupIndex: number) => {
            // Debug each rating group structure
            console.log(`Rating group for question ${question.id}:`, ratingGroup);
            
            return (
              <div key={`${question.id}-rating-${ratingGroup.rating_type_id}`} className="border border-gray-200 rounded-lg p-4 bg-white">
                {/* Display the rating type name (e.g. "Kinerja" or "Tingkat Kepentingan") */}
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {getRatingTypeName(ratingGroup.rating_type_id)}
                </h4>
                <div className="relative">
                  <select
                    name={`question-${question.id}-rating-${ratingGroup.rating_type_id}`}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        onRatingChange(question.id, parseInt(value), ratingGroup.rating_type_id);
                        handleDropdownChange(`question-${question.id}-rating-${ratingGroup.rating_type_id}`);
                      }
                    }}
                    onMouseDown={() => handleDropdownMouseDown(`question-${question.id}-rating-${ratingGroup.rating_type_id}`)}
                    onBlur={() => handleDropdownBlur(`question-${question.id}-rating-${ratingGroup.rating_type_id}`)}
                    className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white text-gray-900 appearance-none hover:bg-gray-50 focus:bg-white"
                    required={question.is_required === true || question.is_required === 1}
                  >
                    <option value="">Pilih {getRatingTypeName(ratingGroup.rating_type_id)}...</option>
                    {ratingGroup.options?.map((option: any) => {
                      // Debug each option
                      console.log(`Option for rating group ${ratingGroup.rating_type_id}:`, option);
                      
                      const optionId = option.id;
                      // For multiple rating types, the skala_rating should contain the values we want
                      const ratingLabel = option.skala_rating || 'Unknown option';
                      
                      return (
                        <option key={`${ratingGroup.rating_type_id}-${option.id}`} value={optionId}>
                          {ratingLabel}
                        </option>
                      );
                    })}
                  </select>
                  {/* Dropdown arrow with animation */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns[`question-${question.id}-rating-${ratingGroup.rating_type_id}`] ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Single Rating Type (fallback for legacy questions)
        <div className="relative">
          {/* Display the appropriate rating type name based on jenis_rating_id */}
          {question.jenis_rating_id && (
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {getRatingTypeName(question.jenis_rating_id)}
            </h4>
          )}
          
          {/* Fallback to known rating types */}
          {!question.jenis_rating_id && question.multiple_rating_types && question.multiple_rating_types[0] && (
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {getRatingTypeName(question.multiple_rating_types[0].jenis_rating_id)}
            </h4>
          )}
          
          <select
            name={`question-${question.id}`}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                onRatingChange(question.id, parseInt(value));
                handleDropdownChange(`question-${question.id}`);
              }
            }}
            onMouseDown={() => handleDropdownMouseDown(`question-${question.id}`)}
            onBlur={() => handleDropdownBlur(`question-${question.id}`)}
            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white text-gray-900 appearance-none hover:bg-gray-50 focus:bg-white"
            required={question.is_required === true || question.is_required === 1}
          >
            <option value="">
              Pilih {
                question.jenis_rating_id ? 
                  getRatingTypeName(question.jenis_rating_id) : 
                  (question.multiple_rating_types && question.multiple_rating_types[0] ? 
                    getRatingTypeName(question.multiple_rating_types[0].jenis_rating_id) : 
                    'rating')
              }...
            </option>
            {question.ratingOptions?.map((option: any) => {
              console.log('Single rating option:', option);
              
              const optionId = option.id;
              // Use skala_rating directly which contains values like "Sangat Sesuai"
              const ratingLabel = option.skala_rating || option.label || 'Unknown option';
              
              return (
                <option key={option.id} value={optionId}>
                  {ratingLabel}
                </option>
              );
            })}
          </select>
          {/* Dropdown arrow with animation */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns[`question-${question.id}`] ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
