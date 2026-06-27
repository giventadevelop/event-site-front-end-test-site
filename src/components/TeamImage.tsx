'use client';
import Image from 'next/image';

interface TeamImageProps {
  src: string;
  name: string;
}

export function TeamImage({ src, name }: TeamImageProps) {
  return (
    <div className="text-center">
      <div className="relative w-40 h-40 mx-auto mb-2">
        <Image
          src={src}
          alt={`Photo of ${name}`}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <p className="font-semibold">{name}</p>
    </div>
  );
}