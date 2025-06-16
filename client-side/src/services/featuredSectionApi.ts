import { IFeaturedProducts } from "../types/product";
import { fetchWithAuth } from "./api";

// Lấy featured section
export async function fetchFeaturedSection(): Promise<IFeaturedProducts[]> {
  const TEMP2_URL = "https://67e3b0622ae442db76d1204c.mockapi.io";
  try {
    const temp = await fetchWithAuth<any>(
      `${TEMP2_URL}/feature`,
      { cache: "no-store" },
      false
    );
    let data: IFeaturedProducts[] = temp.map((e: any) => ({
      id: e.id,
      banner: e.banner || "",
      gender: e.gender || "unknown",
      description: e.description || "unknown",
    }));
    return data;
  } catch (error) {
    console.error("Error fetching featured section:", error);
    return [];
  }
}