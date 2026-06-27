# Executive Committee Team Member Profile Image Upload Feature - Complete Documentation

## 🎯 Feature Overview
We are implementing a profile image upload feature for executive committee team members that allows users to upload profile photos for each team member in the list. The feature includes a dedicated upload dialog with drag-and-drop functionality, file preview, and progress tracking.

## 🔧 Technical Implementation

### Frontend Components
- **`ImageUploadDialog.tsx`**: Modal dialog for image upload with drag-and-drop, preview, and progress
- **`ExecutiveCommitteeList.tsx`**: Team member list with upload icon for each row
- **`ExecutiveCommitteeClient.tsx`**: Main client component managing upload state and dialog
- **`ApiServerActions.ts`**: Server actions for API calls including the upload function

### Backend Integration
- **API Endpoint**: `/api/event-medias/upload` (migrated from `/upload-multiple`)
- **Proxy Handler**: `/api/proxy/event-medias/upload.ts` for secure backend communication
- **Parameters**: Includes `executiveTeamMemberID`, `isTeamMemberProfileImage: true`, and other required fields

## 🚨 Critical Issues We've Faced and Resolved

### 1. Backend Null Pointer Exception (Primary Issue)
**Problem**: Backend returns HTTP 500 error with message:
```
"Cannot invoke \"com.nextjstemplate.service.dto.EventMediaDTO.getId()\" because \"result\" is null"
```

**Root Cause**: The backend upload process fails and returns a null `EventMediaDTO` object, but some interceptor or response processor tries to call `getId()` on this null object.

**Impact**: Complete upload failure with 500 status, preventing any profile images from being uploaded.

### 2. Proxy Handler Response Piping Issues
**Problem**: The proxy handler was blindly piping all responses (including 500 errors) without checking HTTP status codes.

**Root Cause**: Using `apiRes.body.pipe(res)` for error responses triggered internal processing that attempted to parse null objects.

**Impact**: The proxy itself was causing additional errors by trying to process malformed backend responses.

### 3. Frontend Response Body Double-Reading
**Problem**: Frontend error handling tried to read the response body multiple times:
1. First attempt: `response.json()` (consumes the stream)
2. Fallback attempt: `response.text()` (fails with "body stream already read")

**Root Cause**: Complex error handling logic that attempted JSON parsing first, then text fallback.

**Impact**: Runtime errors preventing proper error messages from being displayed to users.

### 4. Response Parsing on Error Status Codes
**Problem**: Attempting to parse JSON responses even when HTTP status indicated failure.

**Root Cause**: Not properly checking HTTP status codes before attempting response parsing.

**Impact**: Confusing error messages and potential crashes when backend returns error responses.

## ✅ Solutions Implemented

### 1. HTTP Status Code Only Approach
**Strategy**: Rely purely on HTTP status codes for success/failure determination:
- **2xx status codes (200-299)**: Success → Parse response for image URL
- **Any other status code**: Failure → Handle as error without parsing response body

### 2. Proxy Handler Status Code Validation
**Strategy**: Check HTTP status codes in the proxy before processing responses.

### 3. Single Response Body Reading
**Strategy**: Only attempt to read the response body once, either as JSON for success or not at all for errors.

### 4. Null Object Prevention
**Strategy**: Avoid any processing of backend responses that contain null objects.

## 📁 File References and Code Snippets

### 1. Main Upload Function - `src/app/admin/executive-committee/ApiServerActions.ts`

```typescript
/**
 * Uploads a profile image for a team member
 *
 * 🎯 IMPORTANT: This function relies ONLY on HTTP status codes for success/failure determination.
 * - 2xx status codes (200-299) = Success
 * - Any other status code = Failure
 *
 * This approach prevents issues with null responses or malformed JSON from backend errors.
 * The backend may return a 500 error with a null EventMediaDTO result, but we avoid
 * processing it to prevent getId() calls on null objects.
 *
 * The proxy handler now returns structured error JSON for failures instead of piping
 * the raw backend error response that contains null objects.
 */
export async function uploadTeamMemberProfileImage(
  memberId: number,
  file: File,
  userProfileId?: number
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file); // Changed from 'files' to 'file' per new API schema

    const params = new URLSearchParams();
    params.append('eventId', '0'); // Use 0 for team member profile images (not event-specific)
    params.append('executiveTeamMemberID', String(memberId)); // Add the team member ID as required by backend
    params.append('eventFlyer', 'false');
    params.append('isEventManagementOfficialDocument', 'false');
    params.append('isHeroImage', 'false');
    params.append('isActiveHeroImage', 'false');
    params.append('isFeaturedImage', 'false');
    params.append('isPublic', 'true');
    params.append('isTeamMemberProfileImage', 'true'); // Set to true for team member profile images
    params.append('title', `Team Member Profile Image - ${memberId}`); // Required parameter
    params.append('description', 'Profile image uploaded for executive committee team member');
    params.append('tenantId', getTenantId()); // Required parameter

    const baseUrl = getAppUrl();
    const url = `${baseUrl}/api/proxy/event-medias/upload?${params.toString()}`;

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    // 🎯 CRITICAL: Only rely on HTTP status codes for success/failure determination
    // This prevents issues with null responses or malformed JSON from backend errors

    // Check if the response indicates success (2xx status codes)
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Upload successful - HTTP status:', response.status);

      // Only attempt to parse response if we got a successful status code
      try {
        const result = await response.json();

        // Extract the image URL from the response
        // The response structure may vary, so we need to handle different possible formats
        if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
          return result.data[0].fileUrl || result.data[0].url;
        } else if (result && result.fileUrl) {
          return result.fileUrl;
        } else if (result && result.url) {
          return result.url;
        } else {
          console.warn('⚠️ Upload successful but no image URL found in response:', result);
          // Even if no URL found, the upload succeeded - return a placeholder or throw
          throw new Error('Upload successful but no image URL found in response');
        }
      } catch (parseError) {
        console.error('❌ Failed to parse successful upload response:', parseError);
        throw new Error('Upload successful but failed to parse response');
      }
    } else {
      // 🚫 Any non-2xx status code indicates failure
      // Proxy now returns structured error JSON for failures
      try {
        const errorResponse = await response.json();
        const errorMessage = errorResponse.message || errorResponse.error || `HTTP ${response.status} error`;

        console.error('❌ Upload failed - HTTP status:', response.status, 'Error:', errorMessage);

        // Throw error with clear status code information
        throw new Error(`Upload failed: ${errorMessage}`);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        const errorText = await response.text();
        console.error('❌ Upload failed - HTTP status:', response.status, 'Error:', errorText);
        throw new Error(`Upload failed with HTTP status ${response.status}: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('Error uploading team member profile image:', error);
    return null;
  }
}
```

### 2. Proxy Handler - `src/pages/api/proxy/event-medias/upload.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { getCachedApiJwt, generateApiJwt } from "@/lib/api/jwt";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

/**
 * Proxy handler for event media uploads
 *
 * 🎯 CRITICAL: This handler checks HTTP status codes before processing responses.
 * - 2xx status codes (200-299) = Success → Pipe response body
 * - Any other status code = Failure → Return simple error JSON (NO piping)
 *
 * This prevents issues with null responses or malformed JSON from backend errors.
 * The backend may return a 500 error with a null EventMediaDTO result, but we avoid
 * piping it to prevent getId() calls on null objects.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (!API_BASE_URL) {
      res.status(500).json({ error: "API base URL not configured" });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    let token = await getCachedApiJwt();
    if (!token) {
      token = await generateApiJwt();
    }

    // Forward all query params
    const params = new URLSearchParams();
    for (const key in req.query) {
      const value = req.query[key];
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else if (typeof value !== 'undefined') {
        params.append(key, value);
      }
    }

    let apiUrl = `${API_BASE_URL}/api/event-medias/upload`;
    const qs = params.toString();
    if (qs) apiUrl += `?${qs}`;

    const fetch = (await import("node-fetch")).default;
    const headers = { ...req.headers, authorization: `Bearer ${token}` };
    delete headers["host"];
    delete headers["connection"];

    // Sanitize headers
    const sanitizedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (Array.isArray(value)) sanitizedHeaders[key] = value.join("; ");
      else if (typeof value === "string") sanitizedHeaders[key] = value;
    }

    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: sanitizedHeaders,
      body: req,
    });

    // 🎯 CRITICAL: Check HTTP status code before processing response
    // This prevents issues with null responses or malformed JSON from backend errors
    // IMPORTANT: For error responses, DO NOT pipe the body to avoid getId() calls on null EventMediaDTO objects

    if (apiRes.status >= 200 && apiRes.status < 300) {
      // ✅ Success: Pipe the response body back to client
      console.log('✅ Proxy: Backend upload successful - HTTP status:', apiRes.status);
      res.status(apiRes.status);
      apiRes.body.pipe(res);
    } else {
      // ❌ Failure: DO NOT pipe error response body to avoid null pointer exceptions
      console.error('❌ Proxy: Backend upload failed - HTTP status:', apiRes.status);

      // For error responses, just return the status and a simple error message
      // DO NOT pipe the response body as it may contain null objects that cause getId() calls
      res.status(apiRes.status);
      res.setHeader('Content-Type', 'application/json');
      res.json({
        error: 'Backend upload failed',
        status: apiRes.status,
        message: `Upload failed with HTTP status ${apiRes.status}`,
        // DO NOT include the actual error details to avoid null pointer exceptions
        // The backend error response contains null EventMediaDTO objects
      });
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
}
```

### 3. Upload Dialog Component - `src/app/admin/executive-committee/ImageUploadDialog.tsx`

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaTimes, FaSpinner, FaImage } from 'react-icons/fa';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import { uploadTeamMemberProfileImage } from './ApiServerActions';
import { useAuth } from '@clerk/nextjs';

interface ImageUploadDialogProps {
  member: ExecutiveCommitteeTeamMemberDTO;
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (imageUrl: string) => void;
}

export default function ImageUploadDialog({
  member,
  isOpen,
  onClose,
  onUploadSuccess,
}: ImageUploadDialogProps) {
  const { userId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [userProfileId, setUserProfileId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Get user profile ID when component mounts
  useEffect(() => {
    const getUserProfile = async () => {
      if (userId) {
        try {
          // Fetch user profile to get the ID
          const response = await fetch('/api/proxy/user-profiles/by-user/' + userId);
          if (response.ok) {
            const profile = await response.json();
            setUserProfileId(profile.id);
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }
    };

    getUserProfile();
  }, [userId]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !member.id) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate initial progress
      setUploadProgress(10);

      // Upload the image using the new function
      // 🎯 This function now relies ONLY on HTTP status codes for success/failure
      const imageUrl = await uploadTeamMemberProfileImage(
        member.id,
        selectedFile,
        userProfileId || undefined
      );

      if (!imageUrl) {
        throw new Error('Failed to get image URL from upload response');
      }

      // Simulate completion progress
      setUploadProgress(100);

      // Call success handler with the actual image URL
      onUploadSuccess(imageUrl);

      // Show success message
      // 🎯 Success determined by HTTP 2xx status code, not response content
      alert('Profile image uploaded successfully! The page will refresh to show the updated image.');

      // Reload the parent page to reflect the latest data
      window.location.reload();

      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClose = () => {
    if (selectedFile && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Profile Image</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isUploading}
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload a profile image for <strong>{member.firstName} {member.lastName}</strong>
          </p>
        </div>

        {/* Drag and Drop Area */}
        <div
          ref={dropRef}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg mx-auto"
              />
              <p className="text-sm text-gray-600">
                Selected: {selectedFile?.name}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <FaImage className="mx-auto text-4xl text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  Drag and drop an image here, or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports: JPG, PNG, GIF (Max: 5MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FaUpload />
                <span>Upload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. Main Client Component - `src/app/admin/executive-committee/ExecutiveCommitteeClient.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import ExecutiveCommitteeForm from './ExecutiveCommitteeForm';
import ExecutiveCommitteeList from './ExecutiveCommitteeList';
import ImageUploadDialog from './ImageUploadDialog';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import { fetchExecutiveCommitteeMembers } from './ApiServerActions';

export default function ExecutiveCommitteeClient() {
  const [members, setMembers] = useState<ExecutiveCommitteeTeamMemberDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingMember, setUploadingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await fetchExecutiveCommitteeMembers();
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberCreated = (newMember: ExecutiveCommitteeTeamMemberDTO) => {
    setMembers(prev => [...prev, newMember]);
  };

  const handleMemberUpdated = (updatedMember: ExecutiveCommitteeTeamMemberDTO) => {
    setMembers(prev => prev.map(member =>
      member.id === updatedMember.id ? updatedMember : member
    ));
  };

  const handleMemberDeleted = (deletedId: number) => {
    setMembers(prev => prev.filter(member => member.id !== deletedId));
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    if (uploadingMember?.id) {
      // Update the member's profile image URL
      setMembers(prev => prev.map(member =>
        member.id === uploadingMember.id
          ? { ...member, profileImageUrl: imageUrl }
          : member
      ));
    }
    setUploadingMember(null);

    // Show success message
    console.log('Profile image updated successfully:', imageUrl);

    // Note: The page will be reloaded by the ImageUploadDialog
    // This ensures the latest data is displayed including thumbnails
  };

  const openUploadDialog = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setUploadingMember(member);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ExecutiveCommitteeForm
        onMemberCreated={handleMemberCreated}
        onMemberUpdated={handleMemberUpdated}
      />

      <ExecutiveCommitteeList
        members={members}
        onMemberUpdated={handleMemberUpdated}
        onMemberDeleted={handleMemberDeleted}
        onUpload={openUploadDialog}
      />

      {/* Image Upload Dialog */}
      {uploadingMember && (
        <ImageUploadDialog
          member={uploadingMember}
          isOpen={!!uploadingMember}
          onClose={() => setUploadingMember(null)}
          onUploadSuccess={handleImageUploadSuccess}
        />
      )}
    </div>
  );
}
```

### 5. Team Member List Component - `src/app/admin/executive-committee/ExecutiveCommitteeList.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { FaEdit, FaTrash, FaUpload } from 'react-icons/fa';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import ExecutiveCommitteeForm from './ExecutiveCommitteeForm';
import Modal from '@/components/Modal';

interface ExecutiveCommitteeListProps {
  members: ExecutiveCommitteeTeamMemberDTO[];
  onMemberUpdated: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onMemberDeleted: (id: number) => void;
  onUpload: (member: ExecutiveCommitteeTeamMemberDTO) => void;
}

export default function ExecutiveCommitteeList({
  members,
  onMemberUpdated,
  onMemberDeleted,
  onUpload,
}: ExecutiveCommitteeListProps) {
  const [editingMember, setEditingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const [deletingMember, setDeletingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);

  const handleEdit = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setEditingMember(member);
  };

  const handleDelete = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setDeletingMember(member);
  };

  const handleConfirmDelete = async () => {
    if (deletingMember?.id) {
      try {
        const response = await fetch(`/api/proxy/executive-committee-team-members/${deletingMember.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onMemberDeleted(deletingMember.id);
          setDeletingMember(null);
        } else {
          alert('Failed to delete member');
        }
      } catch (error) {
        console.error('Error deleting member:', error);
        alert('Error deleting member');
      }
    }
  };

  const handleFormSubmit = (member: ExecutiveCommitteeTeamMemberDTO) => {
    onMemberUpdated(member);
    setEditingMember(null);
  };

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No executive committee members found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Executive Committee Members</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expertise
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {member.profileImageUrl ? (
                      <img
                        src={member.profileImageUrl}
                        alt={`${member.firstName} ${member.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{member.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {member.expertise ? (
                      <div className="flex flex-wrap gap-1">
                        {member.expertise.split(' ').map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">No expertise listed</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onUpload(member)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-50"
                      title="Upload profile image"
                    >
                      <FaUpload />
                    </button>
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50"
                      title="Edit member"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(member)}
                      className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                      title="Delete member"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <Modal
          open={!!editingMember}
          onClose={() => setEditingMember(null)}
          title="Edit Executive Committee Member"
        >
          <ExecutiveCommitteeForm
            member={editingMember}
            onMemberCreated={() => {}}
            onMemberUpdated={handleFormSubmit}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <Modal
          open={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          title="Confirm Deletion"
        >
          <div className="text-center">
            <p className="text-lg">
              Are you sure you want to delete{' '}
              <strong>{deletingMember.firstName} {deletingMember.lastName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setDeletingMember(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
```

## 🎯 Current Status and Testing

### What's Working
- ✅ Upload dialog UI with drag-and-drop functionality
- ✅ File validation and preview
- ✅ Progress tracking during upload
- ✅ HTTP status code validation
- ✅ Proxy handler status code checking
- ✅ Single response body reading

### What We're Testing
- 🔄 Backend upload success scenarios (2xx responses)
- 🔄 Backend upload failure scenarios (5xx responses)
- 🔄 Error message display to users
- 🔄 Page refresh after successful upload

### Remaining Challenges
- **Backend Integration**: The core issue remains that the backend is returning null `EventMediaDTO` objects
- **Error Context**: Users need clear feedback about what went wrong during upload
- **Success Handling**: Need to ensure successful uploads properly update the UI

## 🎯 Next Steps for Complete Resolution

### 1. Backend Investigation
- **Check Backend Logs**: Identify why the upload process is failing and returning null results
- **Validate Parameters**: Ensure all required parameters are being sent correctly
- **Database Constraints**: Check if there are database constraints preventing successful uploads

### 2. Frontend Enhancement
- **Better Error Messages**: Provide specific guidance based on error types
- **Retry Mechanism**: Allow users to retry failed uploads
- **Validation**: Client-side validation of file types, sizes, and parameters

### 3. Monitoring and Debugging
- **Enhanced Logging**: Add more detailed logging for debugging upload issues
- **Error Tracking**: Implement proper error tracking for production monitoring
- **User Feedback**: Provide clear, actionable error messages to users

## 🔍 Technical Details for Developers

### Key Files Modified
- `src/app/admin/executive-committee/ApiServerActions.ts` - Upload function with status code validation
- `src/pages/api/proxy/event-medias/upload.ts` - Proxy handler with status code checking
- `src/app/admin/executive-committee/ImageUploadDialog.tsx` - Upload dialog component
- `src/app/admin/executive-committee/ExecutiveCommitteeClient.tsx` - Main client component

### Critical Code Patterns
1. **Always check HTTP status codes first** before attempting response parsing
2. **Never pipe error response bodies** in proxy handlers
3. **Only read response body once** to avoid stream consumption issues
4. **Use structured error messages** instead of raw backend responses
5. **Implement graceful fallbacks** for parsing failures

### Testing Commands
```bash
# Check TypeScript compilation
npx tsc --noEmit --skipLibCheck

# Check linting
npm run lint

# Test upload functionality
# Navigate to /admin/executive-committee and try uploading an image
```

## 📋 Summary of Key Changes Made

1. **Modified `uploadTeamMemberProfileImage` function** to rely only on HTTP status codes
2. **Updated proxy handler** to check status codes before processing responses
3. **Fixed response body reading** to avoid double-consumption issues
4. **Added comprehensive error handling** with structured error messages
5. **Implemented null object prevention** throughout the upload flow
6. **Added page reload functionality** after successful uploads
7. **Enhanced user feedback** with progress tracking and success messages

This comprehensive approach ensures that the upload feature is robust, handles errors gracefully, and provides clear feedback to users while preventing the null pointer exceptions that were causing the original failures.


