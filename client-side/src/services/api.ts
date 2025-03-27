import { Product, MemberBenefit } from "../types";

const API_BASE_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";

export async function fetchProducts(): Promise<Product[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
}

export async function fetchMemberBenefits(): Promise<MemberBenefit[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/memberBenefits`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error("Error fetching member benefits:", error);
        return [];
    }
}
