"use client";

import { IMemberBenefit } from "@/types/product";
import FadeInWhenVisible from "@/components/Core/Animation/FadeInWhenVisible";
import MemberBenefitsSwiper from "./MemberBenefitsSwiper";
import MemberBenefitCard from "./MemberBenefitCard";

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

        {/* Mobile/Tablet: Swiper */}
        <div className="block tablet:block laptop:hidden desktop:hidden">
          <MemberBenefitsSwiper
            benefits={benefits}
            mobileSlidesPerView={mobileSlidesPerView}
            tabletSlidesPerView={tabletSlidesPerView}
          />
        </div>

        {/* Desktop: Grid */}
        <div className="hidden laptop:grid desktop:grid grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <MemberBenefitCard
              key={benefit.id}
              image={benefit.image}
              benefit={benefit.benefit}
              linkHref="/products?id_cate=684d09e4543e02998d9df018"
            />
          ))}
        </div>
      </div>
    </FadeInWhenVisible>
  );
}
