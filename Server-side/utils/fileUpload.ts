import multer, { FileFilterCallback } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

const uploadDir = path.join(__dirname, "../../client-side/public/product/img/");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const checkfile = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error("Bạn chỉ được upload file ảnh (jpg, jpeg, png, gif, webp)"));
  }
  return cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: checkfile,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export { upload };