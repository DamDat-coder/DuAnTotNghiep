export function mapNameToType(name?: string): "top" | "bottom" | "outer" | "other" {
  if (!name || typeof name !== "string") return "other"; 

  const lowerName = name.toLowerCase();

  const topKeywords = ["áo", "t-shirt", "hoodie", "polo", "croptop", "cardigan", "sweater", "sơ mi"];
  const bottomKeywords = ["quần", "jeans", "short", "váy", "đầm", "jumpsuit"];
  const outerKeywords = ["khoác", "blazer", "vest", "bomber"];

  if (topKeywords.some((k) => lowerName.includes(k))) return "top";
  if (bottomKeywords.some((k) => lowerName.includes(k))) return "bottom";
  if (outerKeywords.some((k) => lowerName.includes(k))) return "outer";
  return "other";
}
