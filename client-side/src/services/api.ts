// api.ts
import { Product, MemberBenefit, User, FeaturedProducts } from "../types";

// Định nghĩa kiểu dữ liệu cho User

const API_BASE_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";
const USER_API_BASE_URL = "https://67e0f65058cc6bf785238ee0.mockapi.io/";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();
    let data: Product[] = temp.map((e: any) => ({
      id: e.id,
      name: e.name,
      category: e.category,
      price: e.price,
      discountPercent: e.discountPercent,
      image: e.image,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function fetchMemberBenefits(): Promise<MemberBenefit[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/memberBenefits`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching member benefits:", error);
    return [];
  }
}

export async function fetchFeaturedSection(): Promise<FeaturedProducts[]> {
  try {
    const res = await fetch(`${USER_API_BASE_URL}/memberBenefit`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();
    let data: FeaturedProducts[] = temp.map((e: any) => ({
      id: e.id,
      banner: e.banner,
      gender: e.gender,
    }));
    return data;
  } catch (error) {
    console.error("Error fetching featured section:", error);
    return [];
  }
}

export async function fetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${USER_API_BASE_URL}/user`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();
    let data: User[] = temp
      .filter((e: any) => e.role === "admin" || e.role === "user") // Lọc bỏ user có role không hợp lệ
      .map((e: any) => ({
        id: e.id,
        email: e.email,
        "số điện thoại": e["số điện thoại"],
        role: e.role,
        password: e.password,
      }));
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
export type { User };
