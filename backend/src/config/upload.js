import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Given a multer file object, return the permanent public URL.
 *   - Cloudinary upload → file.path is the https://res.cloudinary.com/… URL
 *   - Local disk upload → construct /api/uploads/<filename>
 */
export const getFileUrl = (file) => {
  if (!file) return null;
  if (file.path?.startsWith('http')) return file.path;          // Cloudinary
  return `/api/uploads/${file.filename}`;                       // Local dev
};

// ─── Storage ─────────────────────────────────────────────────────────────────

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

const makeCloudinaryStorage = () =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: 'sevasethu',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    }),
  });

const makeDiskStorage = () => {
  const uploadsRoot = path.resolve('src/uploads');
  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsRoot),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safe}`);
    },
  });
};

// ─── Exported factory ────────────────────────────────────────────────────────

export const makeMulter = () =>
  multer({
    storage: useCloudinary ? makeCloudinaryStorage() : makeDiskStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype?.startsWith('image/')) {
        return cb(new Error('Only image uploads are allowed'));
      }
      cb(null, true);
    },
  });

/** @deprecated Use getFileUrl(file) instead */
export const getPublicUploadUrl = (filename) =>
  filename ? `/api/uploads/${filename}` : undefined;
