'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Camera, Check, Loader, AlertCircle } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Profile Photo',
  error,
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (Images only)
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Validate size (Max 5MB for the raw select, though we will optimize it drastically)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image file must be under 5MB.');
      return;
    }

    setLoading(true);
    setUploadError(null);

    try {
      // 1. Process image on a canvas to crop and resize
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          setUploadError('Could not optimize image. Canvas not supported.');
          setLoading(false);
          return;
        }

        // Set output dimensions (400x400 for highly optimized premium avatars)
        canvas.width = 400;
        canvas.height = 400;

        // Calculate center square crop bounds
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        // Draw center-cropped square to canvas
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 400, 400);

        // Convert canvas to blob (optimizing as webp at 0.85 quality)
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              setUploadError('Failed to process image bytes.');
              setLoading(false);
              return;
            }

            // Create compressed file
            const optimizedFile = new File([blob], 'avatar.webp', {
              type: 'image/webp',
            });

            // 2. Upload file to secure backend endpoint
            const formData = new FormData();
            formData.append('file', optimizedFile);

            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });

            const result = await response.json();

            if (result.success && result.data?.url) {
              const uploadedUrl = result.data.url;
              setPreview(uploadedUrl);
              onChange(uploadedUrl);
            } else {
              setUploadError(result.error || 'Failed to upload processed image.');
            }
            setLoading(false);
          },
          'image/webp',
          0.85
        );
      };

      img.onerror = () => {
        setUploadError('Failed to load selected image.');
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image optimization/upload error:', err);
      setUploadError('An error occurred during upload. Please try again.');
      setLoading(false);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {label && (
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {label} {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </span>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1.5px dashed var(--color-border)',
        background: 'var(--color-bg-primary)',
        transition: 'all 0.2s ease',
      }}>
        {/* Profile Avatar Preview */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px solid var(--color-primary-light)',
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          flexShrink: 0,
          boxShadow: 'var(--shadow-sm)',
        }}>
          {preview ? (
            <img
              src={preview}
              alt="Profile photo preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Camera size={32} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} />
          )}

          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          )}
        </div>

        {/* Upload Action controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flexGrow: 1 }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerSelect}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <UploadCloud size={14} /> {preview ? 'Replace Photo' : 'Upload Photo'}
            </Button>
            {preview && !loading && (
              <span style={{
                color: 'var(--color-success)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
                <Check size={14} /> Ready
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Allowed formats: JPG, PNG, WEBP. Cropped to 400x400 square. Max 5MB.
          </p>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/jpg, image/webp"
          style={{ display: 'none' }}
        />
      </div>

      {uploadError && (
        <span style={{
          color: 'var(--color-error)',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          marginTop: '0.25rem',
        }}>
          <AlertCircle size={14} /> {uploadError}
        </span>
      )}

      {error && !uploadError && (
        <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
          {error}
        </span>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
