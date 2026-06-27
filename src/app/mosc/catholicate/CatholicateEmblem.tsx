'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function CatholicateEmblem() {
  const [imgSrc, setImgSrc] = useState('/images/logos/Current_Edits/Mosc_logo_jan2026.png');

  return (
    <div className="relative w-64 md:w-80 h-auto flex items-center justify-center">
      <Image
        src={imgSrc}
        alt="Official Emblem of the Malankara Orthodox Syrian Church"
        width={320}
        height={400}
        className="w-full h-auto object-contain"
        priority
        onError={() => {
          // Fallback to Untitled-1.jpg if emblem.png doesn't exist
          if (imgSrc !== '/images/catholicate/Untitled-1.jpg') {
            setImgSrc('/images/catholicate/Untitled-1.jpg');
          }
        }}
      />
    </div>
  );
}
