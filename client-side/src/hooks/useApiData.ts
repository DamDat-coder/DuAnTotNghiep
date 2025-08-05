import { useState, useEffect } from "react";
import { fetchProducts } from "../services/productApi";
import { fetchUser } from "../services/userApi";
import { fetchFeaturedSection } from "../services/featuredSectionApi";
import { fetchMemberBenefits } from "../services/memberBenefitApi";
import { fetchCategoryTree } from "../services/categoryApi";
import { IProduct, IMemberBenefit, IFeaturedProducts } from "../types/product";
import { ICategory } from "../types/category";
import { IUser } from "../types/auth";

export function useApiData() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [memberBenefits, setMemberBenefits] = useState<IMemberBenefit[]>([]);
  const [featuredSection, setFeaturedSection] = useState<IFeaturedProducts[]>(
    []
  );
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [
          productsData,
          categoriesData,
          benefitsData,
          featuredData,
          userData,
        ] = await Promise.all([
          fetchProducts(),
          fetchCategoryTree(),
          fetchMemberBenefits(),
          fetchFeaturedSection(),
          fetchUser(),
        ]);

        setProducts(productsData.data);
        setCategories(categoriesData);
        setMemberBenefits(benefitsData);
        setFeaturedSection(featuredData);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []); // Mảng phụ thuộc rỗng đảm bảo chỉ chạy 1 lần khi mount

  return {
    products,
    categories,
    memberBenefits,
    featuredSection,
    user,
    loading,
    error,
  };
}
