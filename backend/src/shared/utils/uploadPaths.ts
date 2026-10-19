import path from 'path';
import fs from 'fs';

/**
 * Universally resolves the backend/uploads directory regardless of whether
 * node is started from root workspace or from backend/ folder.
 */
export const getUploadsDir = (): string => {
  const candidates = [
    path.resolve(process.cwd(), 'backend', 'uploads'),
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(__dirname, '..', '..', '..', 'uploads'), // from backend/src/shared/utils -> backend/uploads
    path.resolve(__dirname, '..', '..', '..', '..', 'backend', 'uploads'),
    path.resolve(__dirname, '..', '..', 'uploads'), // from dist/shared/utils -> dist/../uploads
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }

  // Fallback: create backend/uploads relative to cwd
  const defaultDir = fs.existsSync(path.resolve(process.cwd(), 'backend'))
    ? path.resolve(process.cwd(), 'backend', 'uploads')
    : path.resolve(process.cwd(), 'uploads');

  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return defaultDir;
};
