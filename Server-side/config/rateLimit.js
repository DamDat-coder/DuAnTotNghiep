"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
module.exports = limiter;
