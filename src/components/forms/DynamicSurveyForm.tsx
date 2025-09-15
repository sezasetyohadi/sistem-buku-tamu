'use client';

import dynamic from 'next/dynamic';

import LoadingState from '../guest/LoadingState';

// Dynamically import the SurveyForm component with loading state
const DynamicSurveyForm = dynamic(
  () => import('./SurveyForm'),
  {
    loading: () => <LoadingState />,
    ssr: false // Disable server-side rendering for this component
  }
);

export default DynamicSurveyForm;
