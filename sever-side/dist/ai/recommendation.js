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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutfitRecommendations = getOutfitRecommendations;
const google_genai_1 = require("@langchain/google-genai");
const messages_1 = require("@langchain/core/messages");
const mongoose_1 = __importDefault(require("mongoose"));
const nameMapping_1 = require("../ai/nameMapping");
const model = new google_genai_1.ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash",
    temperature: 0,
});
function getOutfitRecommendations(userBehavior, products) {
    return __awaiter(this, void 0, void 0, function* () {
        const productsWithType = products.map((p) => {
            const rawType = (0, nameMapping_1.mapNameToType)(p.name);
            return {
                _id: String(p._id),
                name: p.name,
                category: p.category,
                rawType,
                type: (0, nameMapping_1.mapTypeToGroup)(rawType),
            };
        });
        const prompt = `
Bạn là hệ thống gợi ý phối đồ thông minh.

**Quy tắc bắt buộc**:
1. "basic_outfit": phải gồm đúng 1 sản phẩm có type="top" + 1 sản phẩm có type="bottom".
2. "layered_outfit": phải gồm đúng 1 sản phẩm có type="top" + 1 sản phẩm có type="bottom" + 1 sản phẩm có type="outer".
3. "recommendations": danh sách tối thiểu 3 sản phẩm khác (nếu có), lấy từ danh sách sản phẩm cho trước.
4. Tuyệt đối không chọn sản phẩm type="other".
5. Mỗi ID phải tồn tại trong danh sách sản phẩm cho trước, không được tự tạo.
6. Nếu không tìm thấy sản phẩm phù hợp thì trả về [].

Hành vi người dùng: ${JSON.stringify(userBehavior)}
Danh sách sản phẩm (id, name, type): ${JSON.stringify(productsWithType)}

**Chỉ trả JSON đúng format**:
{
  "basic_outfit": ["id_top", "id_bottom"],
  "layered_outfit": ["id_top", "id_bottom", "id_outer"],
  "recommendations": ["id1", "id2", "id3"]
}
`;
        const res = yield model.invoke([new messages_1.HumanMessage(prompt)]);
        const rawOutput = res.content.replace(/```json|```/g, "").trim();
        const match = rawOutput.match(/\{[\s\S]*\}/);
        if (!match)
            throw new Error("AI trả về dữ liệu không hợp lệ");
        const parsed = JSON.parse(match[0]);
        return sanitizeAIResult(parsed, productsWithType);
    });
}
function sanitizeAIResult(aiResult, productsWithType) {
    const validIds = new Set(productsWithType.map((p) => String(p._id)));
    const productMap = new Map(productsWithType.map((p) => [String(p._id), p.type]));
    const filterValid = (ids) => ids.filter((id) => validIds.has(id) && mongoose_1.default.Types.ObjectId.isValid(id));
    const pickByType = (type, exclude = []) => {
        var _a;
        return (_a = productsWithType.find((p) => p.type === type && !exclude.includes(p._id))) === null || _a === void 0 ? void 0 : _a._id;
    };
    // basic_outfit
    let basic = filterValid(aiResult.basic_outfit || []);
    if (!basic.some((id) => productMap.get(id) === "top")) {
        const topId = pickByType("top", basic);
        if (topId)
            basic.push(topId);
    }
    if (!basic.some((id) => productMap.get(id) === "bottom")) {
        const bottomId = pickByType("bottom", basic);
        if (bottomId)
            basic.push(bottomId);
    }
    basic = filterValid(basic).slice(0, 2);
    // layered_outfit
    let layered = filterValid(aiResult.layered_outfit || []);
    if (!layered.some((id) => productMap.get(id) === "top")) {
        const topId = pickByType("top", layered);
        if (topId)
            layered.push(topId);
    }
    if (!layered.some((id) => productMap.get(id) === "bottom")) {
        const bottomId = pickByType("bottom", layered);
        if (bottomId)
            layered.push(bottomId);
    }
    if (!layered.some((id) => productMap.get(id) === "outer")) {
        const outerId = pickByType("outer", layered);
        if (outerId)
            layered.push(outerId);
    }
    layered = filterValid(layered).slice(0, 3);
    // recommendations (luôn đủ 5 sản phẩm)
    let recs = filterValid(aiResult.recommendations || []);
    if (recs.length < 5) {
        const others = productsWithType
            .map((p) => p._id)
            .filter((id) => mongoose_1.default.Types.ObjectId.isValid(id) &&
            !recs.includes(id) &&
            !basic.includes(id) &&
            !layered.includes(id));
        recs = [...recs, ...others.slice(0, 5 - recs.length)];
    }
    return {
        basic_outfit: basic,
        layered_outfit: layered,
        recommendations: recs.slice(0, 5), // ✅ giới hạn tối đa 5
    };
}
