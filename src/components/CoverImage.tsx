import { useState } from 'react';
import { Disc3 } from 'lucide-react';

interface CoverImageProps {
  src?: string;
  alt: string;
  className?: string;
  iconSize?: number;
}

export function CoverImage({ src, alt, className = '', iconSize = 24 }: CoverImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#1C1C24] via-[#141419] to-[#0B0B0E] text-[#71717A] ${className}`}
        aria-label={alt}
      >
        <Disc3 size={iconSize} strokeWidth={1.5} className="opacity-70" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={`object-cover bg-[#141419] ${className}`}
    />
  );
}
