'use client';

/**
 * Sign Up Page (Backend Clerk Integration)
 *
 * New registration page using backend Clerk integration
 */

import React from 'react';
import { SignUpForm, SocialSignInButtons } from '@/components/auth';

export default function SignUpBackendPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join us today</p>
        </div>

        {/* Sign Up Form */}
        <SignUpForm />

        {/* Social Sign-In Options */}
        <div className="mt-6">
          <SocialSignInButtons
            providers={['google', 'facebook', 'github']}
            onSuccess={() => console.log('Social sign-up successful')}
            onError={(error) => console.error('Social sign-up error:', error)}
          />
        </div>
      </div>
    </main>
  );
}


