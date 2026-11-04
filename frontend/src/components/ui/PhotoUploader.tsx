import React, { useRef, useState } from 'react';
import { Camera, Upload, X, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface PhotoUploaderProps {
  label?: string;
  helperText?: string;
  value?: string | null;
  onChange: (base64OrUrl: string | null) => void;
  className?: string;
  aspectRatio?: 'square' | 'wide';
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  label = 'Athlete Photo',
  helperText = 'Upload a clear profile photo or take a camera selfie.',
  value,
  onChange,
  className,
  aspectRatio = 'square',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className={twMerge(clsx('w-full space-y-2 text-left', className))}>
      {label && (
        <span className="block text-xs font-semibold uppercase tracking-wider text-content-secondary">
          {label}
        </span>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-border-subtle bg-surface">
        {/* Preview Frame */}
        <div
          className={clsx(
            'relative overflow-hidden bg-surface-elevated border-2 border-dashed border-border-strong flex items-center justify-center shrink-0',
            aspectRatio === 'square' ? 'w-24 h-24 rounded-2xl' : 'w-32 h-20 rounded-xl'
          )}
        >
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-red-600 transition"
                title="Remove photo"
                aria-label="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <UserIcon className="w-8 h-8 text-content-muted" />
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 w-full">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-border-subtle hover:border-[#FF6B00] text-content-primary text-xs font-semibold min-h-[44px] transition"
            >
              <Upload className="w-4 h-4 text-[#FF6B00]" />
              <span>Choose File</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-elevated hover:bg-surface border border-border-subtle hover:border-[#FF6B00] text-content-primary text-xs font-semibold min-h-[44px] transition"
            >
              <Camera className="w-4 h-4 text-[#FF6B00]" />
              <span>Take Selfie</span>
            </button>
          </div>

          <p className="text-xs text-content-muted">{helperText}</p>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        </div>

        {/* Hidden native inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};
