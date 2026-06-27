'use client';

/**
 * Social Sign-In Buttons Component
 *
 * Container component for all social login providers
 */

import React from 'react';
import GoogleSignInButton from './GoogleSignInButton';
import FacebookSignInButton from './FacebookSignInButton';
import GitHubSignInButton from './GitHubSignInButton';

interface SocialSignInButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  providers?: Array<'google' | 'facebook' | 'github'>;
}

export function SocialSignInButtons({
  onSuccess,
  onError,
  providers = ['google', 'facebook', 'github']
}: SocialSignInButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        {providers.includes('google') && (
          <GoogleSignInButton onSuccess={onSuccess} onError={onError} />
        )}

        {providers.includes('facebook') && (
          <FacebookSignInButton onSuccess={onSuccess} onError={onError} />
        )}

        {providers.includes('github') && (
          <GitHubSignInButton onSuccess={onSuccess} onError={onError} />
        )}
      </div>
    </div>
  );
}

export default SocialSignInButtons;


