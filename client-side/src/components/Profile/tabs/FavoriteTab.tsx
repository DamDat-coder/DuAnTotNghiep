export default function FavoriteTab() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">SẢN PHẨM YÊU THÍCH</h1>
      <div>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b pb-4">
              {/* Hình ảnh */}
              <img
                src="/images/sample-product.jpg"
                alt="Áo khoác"
                className="w-24 h-24 object-cover"
              />

              {/* Thông tin */}
              <div className="flex-1">
                <h3 className="font-semibold">
                  MLB – Áo khoác phối mũ unisex Gopcore Basic
                </h3>
                <p className="text-gray-500 text-sm">Men's Shoes</p>
                <button className="mt-1">
                  <span role="img" aria-label="heart">
                    ❤️
                  </span>
                </button>
              </div>

              {/* Giá */}
              <div className="text-right">
                <div className="text-sm text-gray-400 line-through">
                  5,589,000₫
                </div>
                <div className="text-red-600 font-semibold">1,790,000₫</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
