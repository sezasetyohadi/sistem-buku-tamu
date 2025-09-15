/**
 * Error Boundary Test Components
 * For testing error handling in development
 */

'use client';

import React, { useState } from 'react';

import { ComponentErrorBoundary, SectionErrorBoundary, PageErrorBoundary } from './ErrorBoundary';
import { withFormErrorBoundary, withDataErrorBoundary, AsyncErrorBoundary } from './ErrorBoundaryWrappers';

// Component that throws an error on demand
const ErrorProneComponent: React.FC<{ shouldError: boolean; errorType: string }> = ({ 
  shouldError, 
  errorType 
}) => {
  if (shouldError) {
    switch (errorType) {
      case 'render':
        throw new Error('Render error test');
      case 'async':
        Promise.reject(new Error('Async error test'));
        break;
      case 'network':
        throw new Error('Network connection failed');
      case 'validation':
        throw new Error('Form validation failed');
      default:
        throw new Error('Generic error test');
    }
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-800">✅ Component is working correctly!</p>
    </div>
  );
};

// Wrapped test components
const FormTestComponent = withFormErrorBoundary(
  ({ shouldError }: { shouldError: boolean }) => (
    <ErrorProneComponent shouldError={shouldError} errorType="validation" />
  ),
  'TestForm'
);

const DataTestComponent = withDataErrorBoundary(
  ({ shouldError }: { shouldError: boolean }) => (
    <ErrorProneComponent shouldError={shouldError} errorType="network" />
  ),
  'TestData'
);

// Main test component
export const ErrorBoundaryTest: React.FC = () => {
  const [componentError, setComponentError] = useState(false);
  const [sectionError, setSectionError] = useState(false);
  const [formError, setFormError] = useState(false);
  const [dataError, setDataError] = useState(false);
  const [asyncError, setAsyncError] = useState(false);

  const resetAll = () => {
    setComponentError(false);
    setSectionError(false);
    setFormError(false);
    setDataError(false);
    setAsyncError(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Error Boundary Test Suite</h2>
        <p className="text-gray-600 mb-6">
          Test different types of error boundaries and error handling mechanisms.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setComponentError(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Component Error
          </button>
          <button
            onClick={() => setSectionError(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Section Error
          </button>
          <button
            onClick={() => setFormError(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Test Form Error
          </button>
          <button
            onClick={() => setDataError(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Test Data Error
          </button>
          <button
            onClick={() => setAsyncError(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Async Error
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset All
          </button>
        </div>

        {/* Component Level Error Boundary Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Component Error Boundary</h3>
          <ComponentErrorBoundary>
            <ErrorProneComponent shouldError={componentError} errorType="render" />
          </ComponentErrorBoundary>
        </div>

        {/* Section Level Error Boundary Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Section Error Boundary</h3>
          <SectionErrorBoundary>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ErrorProneComponent shouldError={sectionError} errorType="network" />
              <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                <p className="text-blue-800">This component should remain functional</p>
              </div>
            </div>
          </SectionErrorBoundary>
        </div>

        {/* Form Error Boundary Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Form Error Boundary (HOC)</h3>
          <FormTestComponent shouldError={formError} />
        </div>

        {/* Data Error Boundary Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Data Error Boundary (HOC)</h3>
          <DataTestComponent shouldError={dataError} />
        </div>

        {/* Async Error Boundary Test */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Async Error Boundary</h3>
          <AsyncErrorBoundary>
            <ErrorProneComponent shouldError={asyncError} errorType="async" />
          </AsyncErrorBoundary>
        </div>

        {/* Error Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Test Status:</h4>
          <ul className="space-y-1 text-sm">
            <li>Component Error: {componentError ? '🔴 Active' : '🟢 Normal'}</li>
            <li>Section Error: {sectionError ? '🔴 Active' : '🟢 Normal'}</li>
            <li>Form Error: {formError ? '🔴 Active' : '🟢 Normal'}</li>
            <li>Data Error: {dataError ? '🔴 Active' : '🟢 Normal'}</li>
            <li>Async Error: {asyncError ? '🔴 Active' : '🟢 Normal'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;
