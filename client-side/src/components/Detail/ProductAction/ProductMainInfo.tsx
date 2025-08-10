import { useState, useEffect } from "react";
import { IProduct } from "@/types/product";
import { Star } from "lucide-react";
import { fetchProductReviews } from "@/services/reviewApi";
import toast from "react-hot-toast";
import { IReview } from "@/types/review";

interface Props {
  product: IProduct;
}

export default function ProductMainInfo({ product }: Props) {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Tính điểm đánh giá trung bình
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  // Lấy danh sách đánh giá
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const fetchedReviews = await fetchProductReviews(product.id);
        setReviews(fetchedReviews);
      } catch (error) {
        toast.error("Không thể tải đánh giá.");
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [product.id]);

  return (
    <div className="mt-4 flex flex-col items-start gap-6">
      <div className="w-full flex justify-between">
        <div className="text-sm font-bold opacity-40">
          {product.category?.name || "Danh mục"}
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-gray-500">Đang tải...</span>
          ) : (
            <>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={
                      i < Math.floor(parseFloat(averageRating)) ? "black" : "none"
                    }
                    stroke="black"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <h2 className="text-2xl font-bold flex-1">{product.name}</h2>
    </div>
  );
}