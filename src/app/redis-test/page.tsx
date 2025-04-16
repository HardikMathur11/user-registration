'use client';

import { useState } from 'react';

interface RedisTestResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  env?: {
    hasUrl: boolean;
    hasToken: boolean;
    nodeEnv: string;
  };
}

export default function RedisTestPage() {
  const [result, setResult] = useState<RedisTestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testRedis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Testing Redis connection...');
      const response = await fetch('/api/redis-test');
      console.log('Response status:', response.status);
      
      const text = await response.text();
      console.log('Response text:', text);
      
      try {
        const data = JSON.parse(text) as RedisTestResult;
        console.log('Parsed data:', data);
        setResult(data);
      } catch (parseError: unknown) {
        console.error('JSON parse error:', parseError);
        setError(`Failed to parse JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Redis Connection Test
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Click the button below to test the Redis connection.</p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={testRedis}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Redis Connection'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {result && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Result:</h4>
                <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 