// src/components/MemberBenefitsBanner.tsx
import { IMemberBenefit } from "@/types";
import MemberBenefitsSwiper from "./MemberBenefitsSwiper";

interface MemberBenefitsBannerProps {
  benefits: IMemberBenefit[];
}

export default function MemberBenefitsBanner({ benefits }: MemberBenefitsBannerProps) {
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
    <div className="py-4">
      <h1 className="text-[1.5rem] pb-6 font-heading font-bold">
        Quyền Lợi Thành Viên
      </h1>

      {/* Mobile: Swiper */}
      <div className="block tablet:hidden">
        <MemberBenefitsSwiper benefits={benefits} />
      </div>

      {/* Tablet/Desktop: Grid */}
      <div className="hidden tablet:grid tablet:grid-cols-2 desktop:grid-cols-3 gap-4 desktop:gap-8">
        {benefits.map((benefit) => (
          <div key={benefit.id} className="relative w-full h-full">
            <img
              src={`/memberBenefit/${benefit.image}`}
              alt={benefit.benefit}
              className="w-full h-[25.625rem] object-cover rounded select-none tablet:h-80 desktop:w-full desktop:h-auto"
              draggable="false"
            />
            <div className="absolute inset-0 bg-black/45 rounded"></div>
            <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[55%] flex flex-col gap-2">
              <div className="text-[1.5rem] font-heading font-bold text-white tablet:text-2xl desktop:text-3xl leading-[1.8125rem] flex flex-wrap">
                {benefit.benefit}
              </div>
              <button className="text-[1rem] px-[0.7475rem] py-[0.52875rem] bg-black text-white font-body rounded-full hover:opacity-70 transition-colors w-fit">
                Shop
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}