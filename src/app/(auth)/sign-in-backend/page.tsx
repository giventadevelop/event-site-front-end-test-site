'use client';

/**
 * Sign In Page (Backend Clerk Integration)
 *
 * New authentication page using backend Clerk integration
 */

import React from 'react';
import { SignInForm, SocialSignInButtons } from '@/components/auth';

export default function SignInBackendPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <SignInForm />

        {/* Social Sign-In Options */}
        <div className="mt-6">
          <SocialSignInButtons
            providers={['google', 'facebook', 'github']}
            onSuccess={() => console.log('Social sign-in successful')}
            onError={(error) => console.error('Social sign-in error:', error)}
          />
        </div>
      </div>
    </main>
  );
}


