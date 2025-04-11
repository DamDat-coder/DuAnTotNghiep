// api.ts
import {
  IProduct,
  IMemberBenefit,
  IUser,
  IFeaturedProducts,
  ICategory,
} from "../types";

// Định nghĩa kiểu dữ liệu cho User

const API_BASE_URL = "https://67e3b0622ae442db76d1204c.mockapi.io/";
const USER_API_BASE_URL = "https://67e0f65058cc6bf785238ee0.mockapi.io/";
const PRODUCTS_URL = "http://localhost:3000/products/";
const CATEGORIES_URL = "http://localhost:3000/categories/";

export async function fetchProducts(): Promise<IProduct[]> {
  try {
    const res = await fetch(`${PRODUCTS_URL}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();

    // Truy cập vào temp.data
    let data: IProduct[] = temp.data.map((e: any) => ({
      id: e._id,
      name: e.name,
      category: e.categoryId?.name || "Không rõ", // category nằm trong categoryId
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
export async function fetchProductById(id: string): Promise<IProduct | null> {
  try {
    const res = await fetch(`${PRODUCTS_URL}/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const temp = await res.json();

    const product: IProduct = {
      id: temp._id,
      categoryId: temp.categoryId?.$oid || temp.categoryId,
      name: temp.name,
      category: temp.categoryId?.name || "Không rõ",
      price: temp.price,
      discountPercent: temp.discountPercent,
      image: temp.image,
    };

    return product;
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
}

export async function fetchCategories(): Promise<ICategory[]> {
  try {
    const res = await fetch(CATEGORIES_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const temp = await res.json();
    console.log("fetchCategories response:", temp); // Log để debug

    // Kiểm tra temp.data có phải là mảng không
    if (!temp.data || !Array.isArray(temp.data)) {
      throw new Error(
        "Dữ liệu danh mục không hợp lệ: temp.data không phải là mảng."
      );
    }

    const data: ICategory[] = temp.data.map((e: any) => ({
      id: e._id,
      name: e.name,
      description: e.description,
      img: e.img,
      parentId: e.parentId,
    }));

    return data;
  } catch (error) {
    console.error("Error fetching categories:", error);

    return [];
  }
}

export async function fetchMemberBenefits(): Promise<IMemberBenefit[]> {
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

export async function fetchFeaturedSection(): Promise<IFeaturedProducts[]> {
  try {
    const res = await fetch(`${USER_API_BASE_URL}/memberBenefit`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();
    let data: IFeaturedProducts[] = temp.map((e: any) => ({
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

export async function fetchUsers(): Promise<IUser[]> {
  try {
    const res = await fetch(`${USER_API_BASE_URL}/user`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    let temp = await res.json();
    let data: IUser[] = temp
      .filter((e: any) => e.role === "admin" || e.role === "user") // Lọc bỏ user có role không hợp lệ
      .map((e: any) => ({
        id: e.id,
        email: e.email,
        name: e.name,
        phone: e.phone,
        role: e.role,
        password: e.password,
      }));
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
export type { IUser };
