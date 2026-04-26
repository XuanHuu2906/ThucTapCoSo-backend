import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { env } from '../config/env.js';

// Cấu hình Cloudinary
if (env.CLOUDINARY_URL) {
  cloudinary.config(env.CLOUDINARY_URL);
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cv',
    resource_type: 'auto',
    public_id: (req: any, file: any) => `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
  } as any,
});

export const uploadCV = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
    }
  },
});
