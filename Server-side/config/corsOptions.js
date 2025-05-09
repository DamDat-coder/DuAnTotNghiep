"use strict";
const corsOptions = {
    origin: "http://localhost:3300",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};
module.exports = corsOptions;
