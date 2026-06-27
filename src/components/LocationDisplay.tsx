'use client';

import React, { useState } from 'react';
import { FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

interface LocationDisplayProps {
  location: string;
  venueName?: string;
  className?: string;
}

export default function LocationDisplay({ location, venueName, className = '' }: LocationDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(location);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy location:', err);
    }
  };

  const handleGoogleMaps = () => {
    const encodedLocation = encodeURIComponent(location);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleGoogleDirections = () => {
    const encodedLocation = encodeURIComponent(location);
    const googleDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    window.open(googleDirectionsUrl, '_blank');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-semibold flex-1">{location}</span>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        title="Copy address"
      >
        <FaCopy className="w-6 h-6 text-blue-500" />
      </button>

      {/* Google Maps Button */}
      <button
        onClick={handleGoogleMaps}
        className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
        title="Open in Google Maps"
      >
        <FaExternalLinkAlt className="w-6 h-6 text-green-500" />
      </button>

      {/* Copy Success Indicator */}
      {copied && (
        <span className="text-green-600 text-sm font-medium">Copied!</span>
      )}
    </div>
  );
}