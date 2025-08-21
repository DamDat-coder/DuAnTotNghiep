"use client";

import dynamic from "next/dynamic";

const DesktopImageGallery = dynamic(() => import("./DesktopImageGallery"), {
  ssr: false,
});

interface Props {
  images: string[];
  productName: string;
  isOutOfStock?: boolean;
}

export default function DesktopImageGalleryWrapper({
  images,
  productName,
  isOutOfStock = false,
  isWishlistOpen = false, 
}: Props & { isWishlistOpen?: boolean }) {
  return (
    <DesktopImageGallery
      images={images}
      productName={productName}
      isOutOfStock={isOutOfStock}
      isWishlistOpen={isWishlistOpen} 
    />
  );
}
