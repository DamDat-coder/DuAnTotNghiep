import multer from "multer";
import { Request } from "express";

export interface MulterRequest extends Request {
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  user?: {
    userId: string;
    role: string;
  };
}

const storage = multer.memoryStorage(); 
export const upload = multer({ storage });

export function normalizeFiles(files: MulterRequest["files"]): Express.Multer.File[] {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
}
