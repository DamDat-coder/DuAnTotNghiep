import Image from "next/image";
import Link from "next/link";

interface MemberBenefitCardProps {
  image: string;
  benefit: string;
  linkHref: string;
  isDarkButton?: boolean;
}

export default function MemberBenefitCard({
  image,
  benefit,
  linkHref,
  isDarkButton = false,
}: MemberBenefitCardProps) {
  return (
    <div className="relative w-full rounded overflow-hidden aspect-[3/4]">
      {/* Ảnh fill + object-cover */}
      <Image
        src={`/memberBenefit/${image}`}
        alt={benefit}
        fill
        className="object-cover select-none"
        draggable={false}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "/fallback.jpg";
        }}
      />

      {/* Overlay mờ */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Nội dung */}
      <div className="absolute bottom-6 left-6 w-[70%] flex flex-col gap-2">
        <div className="text-lg laptop:text-[1.5rem] desktop:text-[1.5rem] font-heading font-bold text-white leading-tight">
          {benefit}
        </div>
        <Link
          href={linkHref}
          className={`text-[1rem] px-3 py-2 font-body rounded-full transition-colors w-fit ${
            isDarkButton ? "bg-black text-white" : "bg-white text-black"
          } hover:opacity-70`}
          aria-label={`Xem quyền lợi: ${benefit}`}
        >
          Shop
        </Link>
      </div>
    </div>
  );
}
