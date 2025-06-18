import Image from "next/image";

interface LikeIconProps {
  variant: "white" | "black";
  isActive: boolean;
  width?: number;
  height?: number;
  className?: string;
}

export default function LikeIcon({
  variant,
  isActive,
  width = 16,
  height = 16,
  className,
}: LikeIconProps) {
  const getIconSrc = () => {
    if (variant === "white") {
      return isActive ? "/product/product_like_active.svg" : "/product/product_like.svg";
    }
    return isActive
      ? "/product/product_like_active_detail.svg"
      : "/product/product_like_detail.svg";
  };


  return (
    <div
      className={`w-8 h-8 rounded-full flex justify-center items-center`}
    >
      <Image
        src={getIconSrc()}
        width={width}
        height={height}
        alt={isActive ? "Unlike" : "Like"}
        className={className}
      />
    </div>
  );
}