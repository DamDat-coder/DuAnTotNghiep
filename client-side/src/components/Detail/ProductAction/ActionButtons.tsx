import Image from "next/image";
import { IProduct } from "@/types/product";
import { useCartDispatch } from "@/contexts/CartContext";
import WishlistButton from "../../Core/Layout/WishlistButton/WishlistButton";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import LoginPopup from "@/components/Core/Layout/Popups/AuthAction/LoginPopup";
import RegisterPopup from "@/components/Core/Layout/Popups/AuthAction/RegisterPopup";
import ForgotPasswordPopup from "@/components/Core/Layout/Popups/PasswordAction/ForgotPasswordPopup";
import ResetPasswordPopup from "@/components/Core/Layout/Popups/PasswordAction/ResetPasswordPopup";

interface ActionButtonsProps {
  product: IProduct;
  selectedSize: string | null;
  selectedColor: string | null;
  selectedVariant: IProduct["variants"][0] | undefined;
  isLiked: boolean;
  setIsLiked: (liked: boolean) => void;
  setIsBuyNowPopupOpen: (open: boolean) => void;
  couponId: string | null;
}

export default function ActionButtons({
  product,
  selectedSize,
  selectedColor,
  selectedVariant,
  isLiked,
  setIsLiked,
  setIsBuyNowPopupOpen,
  couponId,
}: ActionButtonsProps) {
  const dispatch = useCartDispatch();
  const { user, openLoginWithData, setOpenLoginWithData, registerFormData } =
    useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Quản lý overflow-hidden khi bất kỳ popup nào mở
  useEffect(() => {
    if (isLoginOpen || isRegisterOpen || isForgotOpen || isResetOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isLoginOpen, isRegisterOpen, isForgotOpen, isResetOpen]);

  // Xử lý pendingCart sau khi đăng nhập
  useEffect(() => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (accessToken && user) {
      const pendingCartRaw = localStorage.getItem("pendingCart");
      if (pendingCartRaw) {
        try {
          const pendingCart = JSON.parse(pendingCartRaw);
          const {
            product: pendingProduct,
            selectedSize,
            selectedColor,
            quantity,
          } = pendingCart;

          // Kiểm tra tính hợp lệ của pendingCart
          if (
            !selectedColor ||
            !selectedSize ||
            quantity < 1 ||
            !pendingProduct?.id ||
            !pendingProduct?.categoryId
          ) {
            toast.error("Dữ liệu giỏ hàng tạm thời không hợp lệ!");
            localStorage.removeItem("pendingCart");
            return;
          }

          const pendingVariant = pendingProduct.variants.find(
            (v: any) => v.size === selectedSize && v.color === selectedColor
          );

          if (!pendingVariant || pendingVariant.stock < quantity) {
            toast.error("Sản phẩm trong giỏ hàng tạm thời không đủ hàng!");
            localStorage.removeItem("pendingCart");
            return;
          }

          const discountedPrice = Math.round(
            pendingVariant.price * (1 - pendingVariant.discountPercent / 100)
          );

          const cartItem = {
            id: pendingProduct.id,
            name: pendingProduct.name,
            price: discountedPrice,
            originPrice: pendingVariant.price,
            discountPercent: pendingVariant.discountPercent,
            image: pendingProduct.images[0] || "",
            quantity,
            size: selectedSize,
            color: selectedColor,
            liked: isLiked,
            selected: true,
            categoryId: pendingProduct.categoryId,
            stock: pendingVariant.stock,
          };

          dispatch({ type: "add", item: cartItem });
          toast.success("Đã thêm sản phẩm từ giỏ hàng tạm thời!");
          localStorage.removeItem("pendingCart");
        } catch (error) {
          toast.error("Không thể thêm sản phẩm từ giỏ hàng tạm thời!");
          localStorage.removeItem("pendingCart");
        }
      }
    }
  }, [user, dispatch, isLiked]);

  // Xử lý khi nhấn "Thêm vào giỏ hàng"
  const handleAddToCart = () => {
    const accessToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!accessToken) {
      // Lưu thông tin vào pendingCart nếu chưa đăng nhập
      const pendingCart = {
        product,
        selectedSize,
        selectedColor,
        quantity: 1, // Mặc định quantity là 1, tương tự ActionButtons
      };
      localStorage.setItem("pendingCart", JSON.stringify(pendingCart));
      localStorage.setItem("redirectToCart", "true");
      setIsLoginOpen(true);
      toast.error("Bạn vui lòng đăng nhập trước khi thêm vào giỏ hàng!");
      return;
    }

    if (!selectedColor) {
      toast.error("Vui lòng chọn màu sắc trước!");
      return;
    }
    if (!selectedSize) {
      toast.error("Vui lòng chọn size trước!");
      return;
    }
    if (!selectedVariant || selectedVariant.stock === 0) {
      toast.error("Sản phẩm này hiện không có sẵn!");
      return;
    }
    if (!product.categoryId) {
      toast.error("Không thể thêm sản phẩm do thiếu thông tin danh mục!");
      return;
    }

    const discountedPrice = Math.round(
      selectedVariant.price * (1 - selectedVariant.discountPercent / 100)
    );

    const cartItem = {
      id: product.id,
      name: product.name,
      originPrice: selectedVariant.price,
      price: discountedPrice,
      discountPercent: selectedVariant.discountPercent,
      image: product.images[0] || "",
      quantity: 1,
      size: selectedSize,
      color: selectedColor,
      liked: isLiked,
      selected: true,
      categoryId: product.categoryId,
      stock: selectedVariant.stock,
    };

    dispatch({ type: "add", item: cartItem });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  // Các hàm xử lý mở/đóng popup
  const handleCloseLoginPopup = () => {
    setIsLoginOpen(false);
  };

  const handleOpenRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    setIsRegisterOpen(false);
  };

  const handleOpenForgotPassword = () => {
    setIsLoginOpen(false);
    setIsForgotOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setIsForgotOpen(false);
  };

  const handleOpenLogin = () => {
    setIsRegisterOpen(false);
    setIsForgotOpen(false);
    setIsLoginOpen(true);
  };

  const handleOpenResetPassword = () => {
    setIsForgotOpen(false);
    setResetToken("sample-token"); // Thay bằng token thực tế từ API
    setIsResetOpen(true);
  };

  const handleCloseResetPassword = () => {
    setIsResetOpen(false);
  };

  // Xử lý openLoginWithData
  useEffect(() => {
    if (openLoginWithData) {
      setIsLoginOpen(true);
      setOpenLoginWithData(false);
    }
  }, [openLoginWithData, setOpenLoginWithData]);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="relative w-[95%]">
            <button
              onClick={handleAddToCart}
              className="relative z-10 bg-black text-white w-[95%] px-6 py-2 text-sm font-medium flex items-center justify-between"
            >
              <span>THÊM VÀO GIỎ HÀNG</span>
              <Image
                src="/product/product_addToCart_angle.svg"
                alt="Thêm vào giỏ hàng"
                width={20}
                height={20}
              />
            </button>
            <div className="absolute bottom-[-0.3rem] right-[0.875rem] bg-white border-2 border-black w-[95%] border-solid px-6 py-2 text-sm font-medium flex items-center justify-between z-0">
              <span>THÊM VÀO GIỎ HÀNG</span>
              <Image
                src="/product/product_addToCart_angle.svg"
                alt="Thêm vào giỏ hàng"
                width={20}
                height={20}
              />
            </div>
          </div>
          <div className="z-40 w-11 h-11 border-2 border-solid border-black flex justify-center items-center">
            <WishlistButton product={product} variant="black" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/product/product_section3_delivery.svg"
              alt="Free shipping"
              width={20}
              height={20}
            />
            <span className="text-sm">Free ship khi đơn hàng trên 1 triệu</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/product/product_section3_swap.svg"
              alt="Easy return"
              width={20}
              height={20}
            />
            <span className="text-sm">Đổi trả hàng dễ dàng</span>
          </div>
        </div>
      </div>

      {/* Các popup */}
      <AnimatePresence>
        {isLoginOpen && (
          <LoginPopup
            isOpen={isLoginOpen}
            onClose={handleCloseLoginPopup}
            onOpenRegister={handleOpenRegister}
            initialFormData={registerFormData}
            onOpenForgotPassword={handleOpenForgotPassword}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRegisterOpen && (
          <RegisterPopup
            isOpen={isRegisterOpen}
            onClose={handleCloseRegister}
            onOpenLogin={handleOpenLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isForgotOpen && (
          <ForgotPasswordPopup
            isOpen={isForgotOpen}
            onClose={handleCloseForgotPassword}
            onOpenLogin={handleOpenLogin}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isResetOpen && (
          <ResetPasswordPopup
            isOpen={isResetOpen}
            onClose={handleCloseResetPassword}
            token={resetToken}
          />
        )}
      </AnimatePresence>
    </>
  );
}
