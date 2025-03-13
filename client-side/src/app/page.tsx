import Header from "../components/Header";
import Footer from "../components/Footer";
import Banner from "../components/Banner";
import FeaturedSection from "../components/FeaturedSection";
import { fetchProducts } from "../services/api";
import { Product } from "../types";

// Server Component (App Router)
export default async function Home() {
  const products = await fetchProducts();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Trang Chủ" />
      <main className="flex-grow">
        <Banner />
        <FeaturedSection products={products} />
      </main>
      <Footer />
    </div>
  );
}