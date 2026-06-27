'use client';

/**
 * Authentication Usage Examples Page
 *
 * Demonstrates how to use all authentication features
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { getErrorMessage, logAuthError } from '@/lib/auth/errorHandling';
import { addTenantToPayload, filterByTenant } from '@/lib/multiTenant';
import { ProtectedRoute, UserProfileCard } from '@/components/auth';

export default function AuthUsageExamplesPage() {
  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Usage Examples</h1>

        <div className="space-y-8">
          {/* Example 1: Basic Auth Usage */}
          <Example1BasicAuth />

          {/* Example 2: Error Handling */}
          <Example2ErrorHandling />

          {/* Example 3: Multi-Tenant Operations */}
          <Example3MultiTenant />

          {/* Example 4: User Profile */}
          <Example4UserProfile />
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Example 1: Basic Authentication Usage
function Example1BasicAuth() {
  const { user, loading, signOut } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Example 1: Basic Authentication
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Loading State:</label>
          <p className="mt-1 text-gray-900">{loading ? 'Loading...' : 'Loaded'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">User:</label>
          {user ? (
            <div className="mt-1 space-y-1">
              <p className="text-gray-900">Name: {user.firstName} {user.lastName}</p>
              <p className="text-gray-900">Email: {user.email}</p>
              <p className="text-gray-600 text-sm">ID: {user.id}</p>
            </div>
          ) : (
            <p className="mt-1 text-gray-500">Not authenticated</p>
          )}
        </div>

        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <code className="text-sm text-gray-800">
          {`const { user, loading, signOut } = useAuth();`}
        </code>
      </div>
    </div>
  );
}

// Example 2: Error Handling
function Example2ErrorHandling() {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSignInWithError = async () => {
    try {
      await signIn({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });
    } catch (err) {
      const message = getErrorMessage(err);
      logAuthError(err, 'Example Sign In');
      setError(message);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Example 2: Error Handling
      </h2>

      <button
        onClick={handleSignInWithError}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Trigger Error (Invalid Credentials)
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <code className="text-sm text-gray-800 whitespace-pre">
          {`try {
  await signIn(credentials);
} catch (error) {
  const message = getErrorMessage(error);
  logAuthError(error, 'Sign In');
  setError(message);
}`}
        </code>
      </div>
    </div>
  );
}

// Example 3: Multi-Tenant Operations
function Example3MultiTenant() {
  const [result, setResult] = useState<any>(null);

  const handleMultiTenantDemo = () => {
    // Example: Add tenant to payload
    const payload = addTenantToPayload({
      eventName: 'Annual Conference',
      date: '2025-12-01',
    });

    // Example: Filter by tenant
    const allEvents = [
      { id: 1, name: 'Event 1', tenantId: 'tenant_demo_001' },
      { id: 2, name: 'Event 2', tenantId: 'tenant_other' },
      { id: 3, name: 'Event 3', tenantId: 'tenant_demo_001' },
    ];
    const myEvents = filterByTenant(allEvents);

    setResult({
      payloadWithTenant: payload,
      filteredEvents: myEvents,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Example 3: Multi-Tenant Operations
      </h2>

      <button
        onClick={handleMultiTenantDemo}
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Run Multi-Tenant Demo
      </button>

      {result && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Payload with Tenant:</label>
            <pre className="mt-1 bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(result.payloadWithTenant, null, 2)}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Filtered Events:</label>
            <pre className="mt-1 bg-gray-50 p-3 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(result.filteredEvents, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <code className="text-sm text-gray-800 whitespace-pre">
          {`const payload = addTenantToPayload({ eventName: 'Conference' });
const myEvents = filterByTenant(allEvents);`}
        </code>
      </div>
    </div>
  );
}

// Example 4: User Profile Component
function Example4UserProfile() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Example 4: User Profile Component
      </h2>

      <UserProfileCard
        editable={true}
        onUpdate={() => console.log('Profile updated successfully')}
      />

      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <code className="text-sm text-gray-800">
          {`<UserProfileCard editable={true} onUpdate={() => {...}} />`}
        </code>
      </div>
    </div>
  );
}


