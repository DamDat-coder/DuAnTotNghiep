import { Request, Response } from "express";
import path from "path";
import fs from "fs";

const provinceData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/province.json"), "utf8")
);
const wardData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/ward.json"), "utf8")
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
