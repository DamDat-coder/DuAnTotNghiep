import { Request, Response } from "express";
import path from "path";
import fs from "fs";

// Đảm bảo lấy đúng đường dẫn tới thư mục 'data' ở cả môi trường dev và production
const dataDir = path.join(__dirname, "..", "..", "data");

const provinceData = JSON.parse(
  fs.readFileSync(path.join(dataDir, "province.json"), "utf8")
);
const wardData = JSON.parse(
  fs.readFileSync(path.join(dataDir, "ward.json"), "utf8")
);

// Lấy danh sách tỉnh/thành phố
export const getProvinces = (req: Request, res: Response) => {
  res.json(Object.values(provinceData));
};

// Lấy danh sách phường/xã theo mã tỉnh/thành phố
export const getWardsByProvince = (req: Request, res: Response) => {
  const { province_code } = req.params;
  const wards = Object.values(wardData).filter(
    (ward: any) => ward.parent_code === province_code
  );
  res.json(wards);
};

export const getAllWards = (req: Request, res: Response) => {
  res.json(Object.values(wardData));
};
