const rateLimit = require("express-rate-limit");

import { Request, Response, NextFunction } from "express";
type RateLimitMiddleware = (req: Request, res: Response, next: NextFunction) => void;

const limiter: RateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});

module.exports = limiter;