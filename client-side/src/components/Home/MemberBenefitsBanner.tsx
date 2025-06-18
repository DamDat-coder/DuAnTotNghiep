// src/components/MemberBenefitsBanner.tsx
import { IMemberBenefit } from "@/types/product";
import MemberBenefitsSwiper from "./MemberBenefitsSwiper";
import Image from "next/image";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import Link from "next/link";

interface MemberBenefitsBannerProps {
  benefits: IMemberBenefit[];
  mobileSlidesPerView?: number;
  tabletSlidesPerView?: number;
}

export default function MemberBenefitsBanner({
  benefits,
  mobileSlidesPerView = 1.5,
  tabletSlidesPerView = 2.5,
}: MemberBenefitsBannerProps) {
  if (!benefits || benefits.length === 0) {
    return (
      <div>
        <p className="text-center text-gray-500">
          Không có quyền lợi nào để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <FadeInWhenVisible>
      <div className="py-4">
        <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
          Quyền Lợi Thành Viên
        </h1>

        {/* Mobile: Swiper */}
        <div className="block tablet:block laptop:hidden desktop:hidden">
          <MemberBenefitsSwiper
            benefits={benefits}
            mobileSlidesPerView={mobileSlidesPerView}
            tabletSlidesPerView={tabletSlidesPerView}
          />
        </div>

        {/* Tablet/Desktop: Grid */}
        <div className="hidden desktop:grid-cols-3 gap-4 desktop:gap-8 laptop:grid laptop:grid-cols-3 laptop:gap-8 ">
          {benefits.map((benefit) => (
            <div key={benefit.id} className="relative w-full h-full">
              <Image
                src={`/memberBenefit/${benefit.image}`}
                alt={benefit.benefit}
                width={120}
                height={40}
                className="w-full h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto  laptop:w-full laptop:h-auto"
                draggable="false"
              />
              <div className="absolute inset-0 bg-black/45 rounded"></div>
              <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[55%] flex flex-col gap-2">
                <div className="text-[1.5rem] font-heading font-bold text-white flex flex-wrap">
                  {benefit.benefit}
                </div>
                <Link
                  href="/products?id_cate=684d09e4543e02998d9df018"
                  className="text-[1rem] px-[0.7475rem] py-[0.52875rem] bg-white text-black font-body rounded-full hover:opacity-70 transition-colors w-fit"
                >
                  Shop
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
