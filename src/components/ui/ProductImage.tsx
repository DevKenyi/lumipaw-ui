import { useState } from 'react';

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <span className="text-4xl select-none opacity-30">🐾</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
