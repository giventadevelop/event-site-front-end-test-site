'use client';

import React from 'react';

interface AppImageProps {
  src: string;
  alt?: string;
  className?: string;
  [key: string]: any;
}

function AppImage({
  src,
  alt = "Image Name",
  className = "",
  ...props
}: AppImageProps) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default AppImage;
