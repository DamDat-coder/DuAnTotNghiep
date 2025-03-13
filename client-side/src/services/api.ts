import { Product } from "../types";

const API_BASE_URL = "https://67d2c0f690e0670699beeab2.mockapi.io/";

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      cache: "no-store", // Tương đương SSR, luôn fetch mới
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data: Product[] = await res.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
