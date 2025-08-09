import { Router } from "express";
import { getProvinces, getWardsByProvince, getAllWards } from "../controllers/address.controller";
const router = Router();

router.get("/provinces", getProvinces);
router.get("/wards/:province_code", getWardsByProvince);
router.get("/wards/all", getAllWards);

export default router;