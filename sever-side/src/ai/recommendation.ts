import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import mongoose from "mongoose";
import { mapNameToType, mapTypeToGroup } from "../ai/nameMapping";

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
  model: "gemini-1.5-flash",
  temperature: 0,
});

export async function getOutfitRecommendations(userBehavior: any, products: any[]) {
  const productsWithType = products.map((p) => {
    const rawType = mapNameToType(p.name);
    return {
      _id: String(p._id),
      name: p.name,
      category: p.category,
      rawType,
      type: mapTypeToGroup(rawType), 
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

  const res = await model.invoke([new HumanMessage(prompt)]);
  const rawOutput = (res.content as string).replace(/```json|```/g, "").trim();
  const match = rawOutput.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI trả về dữ liệu không hợp lệ");

  const parsed = JSON.parse(match[0]);

  return sanitizeAIResult(parsed, productsWithType);
}

function sanitizeAIResult(aiResult: any, productsWithType: any[]) {
  const validIds = new Set(productsWithType.map((p) => String(p._id)));
  const productMap = new Map(productsWithType.map((p) => [String(p._id), p.type]));

  const filterValid = (ids: string[]) =>
    ids.filter((id) => validIds.has(id) && mongoose.Types.ObjectId.isValid(id));

  const pickByType = (type: string, exclude: string[] = []) => {
    return productsWithType.find(
      (p) => p.type === type && !exclude.includes(p._id)
    )?._id;
  };

  // basic_outfit
  let basic = filterValid(aiResult.basic_outfit || []);
  if (!basic.some((id) => productMap.get(id) === "top")) {
    const topId = pickByType("top", basic);
    if (topId) basic.push(topId);
  }
  if (!basic.some((id) => productMap.get(id) === "bottom")) {
    const bottomId = pickByType("bottom", basic);
    if (bottomId) basic.push(bottomId);
  }
  basic = filterValid(basic).slice(0, 2);

  // layered_outfit
  let layered = filterValid(aiResult.layered_outfit || []);
  if (!layered.some((id) => productMap.get(id) === "top")) {
    const topId = pickByType("top", layered);
    if (topId) layered.push(topId);
  }
  if (!layered.some((id) => productMap.get(id) === "bottom")) {
    const bottomId = pickByType("bottom", layered);
    if (bottomId) layered.push(bottomId);
  }
  if (!layered.some((id) => productMap.get(id) === "outer")) {
    const outerId = pickByType("outer", layered);
    if (outerId) layered.push(outerId);
  }
  layered = filterValid(layered).slice(0, 3);

  // recommendations (luôn đủ 5 sản phẩm)
  let recs = filterValid(aiResult.recommendations || []);
  if (recs.length < 5) {
    const others = productsWithType
      .map((p) => p._id)
      .filter(
        (id) =>
          mongoose.Types.ObjectId.isValid(id) &&
          !recs.includes(id) &&
          !basic.includes(id) &&
          !layered.includes(id)
      );
    recs = [...recs, ...others.slice(0, 5 - recs.length)];
  }

  return {
    basic_outfit: basic,
    layered_outfit: layered,
    recommendations: recs.slice(0, 5), // ✅ giới hạn tối đa 5
  };
}