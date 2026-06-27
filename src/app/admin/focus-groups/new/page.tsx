'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { getAppUrl } from '@/lib/env';
import AdminNavigation from '@/components/AdminNavigation';

interface FormData {
  name: string;
  slug: string;
  description: string;
  coverImageUrl: string;
  isActive: boolean;
}

interface ValidationErrors {
  name?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
}

export default function NewFocusGroupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    coverImageUrl: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);

  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});

  const scrollToFirstError = (errorObj?: ValidationErrors) => {
    const errorsToUse = errorObj || errors;
    const firstErrorField = Object.keys(errorsToUse)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      const field = fieldRefs.current[firstErrorField];
      field.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      setTimeout(() => {
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField]?.focus();
        }
      }, 100);
    }
  };

  const getErrorCount = () => Object.keys(errors).length;

  function validate(): boolean {
    const errs: ValidationErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      errs.name = 'Name is required';
    }

    if (!formData.slug || formData.slug.trim() === '') {
      errs.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      errs.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
    }

    const hasErrors = Object.keys(errs).length > 0;

    if (hasErrors) {
      flushSync(() => {
        setErrors(errs);
        setShowErrors(true);
      });
      scrollToFirstError(errs);
    } else {
      setErrors({});
      setShowErrors(false);
    }

    return !hasErrors;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof ValidationErrors];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value || ''),
    }));
  };

  const validateField = (fieldName: keyof ValidationErrors) => {
    const newErrors: ValidationErrors = { ...errors };

    switch (fieldName) {
      case 'name': {
        if (!formData.name?.trim()) {
          newErrors.name = 'Name is required.';
        } else {
          delete newErrors.name;
        }
        break;
      }

      case 'slug': {
        if (!formData.slug?.trim()) {
          newErrors.slug = 'Slug is required.';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
          newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens.';
        } else {
          delete newErrors.slug;
        }
        break;
      }

      case 'description': {
        // Description is optional, so no validation needed
        delete newErrors.description;
        break;
      }

      case 'coverImageUrl': {
        // Cover image URL is optional, but validate format if provided
        if (formData.coverImageUrl && formData.coverImageUrl.trim() !== '') {
          try {
            new URL(formData.coverImageUrl);
            delete newErrors.coverImageUrl;
          } catch {
            newErrors.coverImageUrl = 'Please enter a valid URL.';
          }
        } else {
          delete newErrors.coverImageUrl;
        }
        break;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isValid = validate();
    if (!isValid) {
      console.log('[NewFocusGroupPage handleSubmit] Validation failed - preventing submission');
      return;
    }

    console.log('[NewFocusGroupPage handleSubmit] Validation passed - proceeding with submission');

    setErrors({});
    setShowErrors(false);
    setLoading(true);

    try {
      const baseUrl = getAppUrl();
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || '',
        coverImageUrl: formData.coverImageUrl || '',
        isActive: formData.isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${baseUrl}/api/proxy/focus-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to create focus group:', response.status, errorText);
        throw new Error(`Failed to create focus group: ${response.status} ${errorText}`);
      }

      // Success - redirect to list page
      router.push('/admin/focus-groups');
    } catch (error) {
      console.error('Error creating focus group:', error);
      setLoading(false);
      // Show error to user
      alert(`Error creating focus group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>

      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            Create Focus Group
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            Slug must be URL-safe; active groups appear publicly.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                ref={(el) => { if (el) fieldRefs.current.name = el; }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => validateField('name')}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="Enter focus group name"
              />
              {errors.name && (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              )}
            </div>

            {/* Slug Field */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                ref={(el) => { if (el) fieldRefs.current.slug = el; }}
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                onBlur={() => validateField('slug')}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  errors.slug
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="e.g., career-guidance"
                pattern="[a-z0-9-]+"
                title="lowercase letters, numbers, hyphens only"
              />
              {errors.slug && (
                <div className="text-red-500 text-sm mt-1">{errors.slug}</div>
              )}
            </div>

            {/* Description Field */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                ref={(el) => { if (el) fieldRefs.current.description = el; }}
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onBlur={() => validateField('description')}
                className={`w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="Enter focus group description"
              />
              {errors.description && (
                <div className="text-red-500 text-sm mt-1">{errors.description}</div>
              )}
            </div>

            {/* Cover Image URL Field */}
            <div>
              <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                ref={(el) => { if (el) fieldRefs.current.coverImageUrl = el; }}
                type="url"
                id="coverImageUrl"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleChange}
                onBlur={() => validateField('coverImageUrl')}
                className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                  errors.coverImageUrl
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.coverImageUrl && (
                <div className="text-red-500 text-sm mt-1">{errors.coverImageUrl}</div>
              )}
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
                <span className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="custom-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="custom-checkbox-tick">
                    {formData.isActive && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="text-sm font-medium text-gray-700 select-none">Active</span>
              </label>
            </div>

            {/* Error Summary Box */}
            {showErrors && getErrorCount() > 0 && (
              <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Please fix the following {getErrorCount()} error{getErrorCount() !== 1 ? 's' : ''}:
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(errors).map(([fieldName, errorMessage]) => (
                          <li key={fieldName}>
                            <span className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}:</span> {errorMessage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="md:col-span-2 flex flex-row gap-2 sm:gap-3 mt-4">
              <Link
                href="/admin/focus-groups"
                className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105"
                title="Cancel"
                aria-label="Cancel"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700 hidden sm:inline">Cancel</span>
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title={loading ? 'Creating...' : 'Create Focus Group'}
                aria-label={loading ? 'Creating...' : 'Create Focus Group'}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  {loading ? (
                    <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-green-700 hidden sm:inline">{loading ? 'Creating...' : 'Create Focus Group'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
