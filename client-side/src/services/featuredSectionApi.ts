import { IFeaturedProducts } from "../types";
import { fetchWithAuth } from "./api";

// Lấy featured section
export async function fetchFeaturedSection(): Promise<IFeaturedProducts[]> {
  const TEMP2_URL = "https://67e0f65058cc6bf785238ee0.mockapi.io/";
  try {
    const temp = await fetchWithAuth<any>(
      `${TEMP2_URL}/memberBenefit`,
      { cache: "no-store" },
      false
    );
    let data: IFeaturedProducts[] = temp.map((e: any) => ({
      id: e.id,
      banner: e.banner || "",
      gender: e.gender || "unknown",
    }));
    return data;
  } catch (error) {
    console.error("Error fetching featured section:", error);
    return [];
  }
}