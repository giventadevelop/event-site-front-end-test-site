'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import { testAllCRUDOperations, testOrganizationCRUD, testSettingsCRUD } from '../test-crud-operations';

export default function TenantManagementTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    all: boolean | null;
    organizations: boolean | null;
    settings: boolean | null;
  }>({
    all: null,
    organizations: null,
    settings: null
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Starting comprehensive CRUD operations test...');

    try {
      const result = await testAllCRUDOperations();
      setResults(prev => ({ ...prev, all: result }));
      addLog(result ? 'All tests passed!' : 'Some tests failed');
    } catch (error) {
      addLog(`Error running tests: ${error}`);
      setResults(prev => ({ ...prev, all: false }));
    } finally {
      setIsRunning(false);
    }
  };

  const runOrganizationTests = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Starting organization CRUD tests...');

    try {
      const result = await testOrganizationCRUD();
      setResults(prev => ({ ...prev, organizations: result }));
      addLog(result ? 'Organization tests passed!' : 'Organization tests failed');
    } catch (error) {
      addLog(`Error running organization tests: ${error}`);
      setResults(prev => ({ ...prev, organizations: false }));
    } finally {
      setIsRunning(false);
    }
  };

  const runSettingsTests = async () => {
    setIsRunning(true);
    setLogs([]);
    addLog('Starting settings CRUD tests...');

    try {
      const result = await testSettingsCRUD();
      setResults(prev => ({ ...prev, settings: result }));
      addLog(result ? 'Settings tests passed!' : 'Settings tests failed');
    } catch (error) {
      addLog(`Error running settings tests: ${error}`);
      setResults(prev => ({ ...prev, settings: false }));
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setResults({ all: null, organizations: null, settings: null });
    setLogs([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href="/admin/tenant-management"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
              >
                Tenant Management
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Test CRUD Operations
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Test CRUD Operations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Test all Create, Read, Update, Delete operations for tenant management
        </p>
      </div>

      {/* Test Controls */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Test Controls</h2>
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Run All Tests"
              aria-label="Run All Tests"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <FaPlay className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-700">Run All Tests</span>
            </button>
            <button
              onClick={runOrganizationTests}
              disabled={isRunning}
              className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Test Organizations Only"
              aria-label="Test Organizations Only"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                <FaPlay className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-semibold text-green-700">Test Organizations Only</span>
            </button>
            <button
              onClick={runSettingsTests}
              disabled={isRunning}
              className="flex-shrink-0 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Test Settings Only"
              aria-label="Test Settings Only"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
                <FaPlay className="w-6 h-6 text-purple-600" />
              </div>
              <span className="font-semibold text-purple-700">Test Settings Only</span>
            </button>
            <button
              onClick={clearResults}
              disabled={isRunning}
              className="flex-shrink-0 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Clear Results"
              aria-label="Clear Results"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Clear Results</span>
            </button>
          </div>

          {isRunning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 animate-spin" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Running tests...
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Please wait while the tests are running. Check the logs below for progress.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Test Results</h2>
        </div>
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">All Tests</div>
              <div className="text-4xl">
                {results.all === null ? '⏳' : results.all ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {results.all === null ? 'Not run' : results.all ? 'Passed' : 'Failed'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Organizations</div>
              <div className="text-4xl">
                {results.organizations === null ? '⏳' : results.organizations ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {results.organizations === null ? 'Not run' : results.organizations ? 'Passed' : 'Failed'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Settings</div>
              <div className="text-4xl">
                {results.settings === null ? '⏳' : results.settings ? '✅' : '❌'}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {results.settings === null ? 'Not run' : results.settings ? 'Passed' : 'Failed'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Logs */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Test Logs</h2>
        </div>
        <div className="px-6 py-6">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No logs yet. Run a test to see the output.</p>
          ) : (
            <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

