import { IMemberBenefit } from "../types/product";
import { fetchWithAuth } from "./api";

// Lấy lợi ích thành viên
export async function fetchMemberBenefits(): Promise<IMemberBenefit[]> {
  const TEMP_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";
  try {
    return await fetchWithAuth<IMemberBenefit[]>(
      `${TEMP_URL}/memberBenefits`,
      { cache: "no-store" },
      false
    );
  } catch (error) {
    console.error("Error fetching member benefits:", error);
    return [];
  }
}