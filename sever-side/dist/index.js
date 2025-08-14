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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = __importDefault(require("./config/db"));
const PORT = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3000', 10);
const HOST = process.env.HOST || '127.0.0.1';
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.default)();
        app_1.default.listen(PORT, HOST, () => {
            console.log(`🚀 Server running at http://${HOST}:${PORT}`);
<<<<<<< HEAD
            console.log(`🌐 Public API via Nginx: http://api.styleforyou.online (-> /api/*)`);
=======
            console.log(`🌐 Public API via Nginx: https://api.styleforyou.online (-> /api/*)`);
>>>>>>> 26c33e0f889b1f3595e0a2ba18d8d7b249b66ca8
        });
    }
    catch (err) {
        console.error('❌ Kết nối MongoDB thất bại:', err);
        process.exit(1);
    }
}))();
