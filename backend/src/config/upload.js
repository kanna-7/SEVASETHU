import fs from 'fs';
import path from 'path';
import multer from 'multer';

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

const uploadsRoot = path.resolve('src/uploads');
ensureDir(uploadsRoot);

export const makeMulter = () => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsRoot);
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}-${safeName}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype?.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
      cb(null, true);
    },
  });
};

export const getPublicUploadUrl = (filename) => {
  if (!filename) return undefined;
  return `/api/uploads/${filename}`;
};

