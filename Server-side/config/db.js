"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("📡 connectDB() is running...");
    const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/DB_GraduationProject";
    try {
        yield mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            autoIndex: true,
        });
        console.log(`✅ MongoDB connected`);
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected!");
    });
    mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected!");
    });
});
module.exports = connectDB;
