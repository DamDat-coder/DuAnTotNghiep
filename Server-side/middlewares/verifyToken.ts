import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(403).json({ message: "Token không hợp lệ hoặc thiếu" });
    return;
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "default_secret";

  jwt.verify(token, jwtSecret, (err, decoded: any) => {
    if (err) {
      res.status(401).json({
        message: err.name === "TokenExpiredError" ? "Token đã hết hạn" : "Token không hợp lệ",
      });
      return;
    }
    req.userId = decoded.id;
    next();
  });
};

export default verifyToken;