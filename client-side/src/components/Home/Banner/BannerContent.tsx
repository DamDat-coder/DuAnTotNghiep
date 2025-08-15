"use client";

import { MouseEventHandler } from "react";

interface BannerContentProps {
  status: string;
  name: string;
  description: string;
  dark?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function BannerContent({
  status,
  name,
  description,
  dark,
  onClick,
}: BannerContentProps) {
  return (
    <div
      className={`flex flex-col items-center tablet:items-center justify-evenly gap-3 mt-5 text-${
        dark ? "white" : "gray-700"
      } `}
    >
      <div className="banner_status text-base">{status}</div>
      <div className="banner_name text-[1.5rem] font-bold tablet:text-2xl leading-[1.8125rem] line-clamp-1">
        {name}
      </div>
      <div className="banner_description desc-text tablet:text-lg text-center">
        {description}
      </div>
      <button
        type="button"
        onClick={onClick}
        aria-label="Chuyển đến trang mua sắm"
        className={`banner_action text-[1rem] px-6 py-2 font-bold rounded-full hover:opacity-70 transition-colors ${
          dark ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        Shop
      </button>
    </div>
  );
}
