"use client";

import dynamic from "next/dynamic";

const DesktopImageGallery = dynamic(() => import("./DesktopImageGallery"), {
  ssr: false,
});

interface Props {
  images: string[];
  productName: string;
}

export default function DesktopImageGalleryWrapper({ images, productName }: Props) {
  return <DesktopImageGallery images={images} productName={productName} />;
}
