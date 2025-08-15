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
    <div className="relative w-full rounded overflow-hidden h-[25rem]">
      <Image
        src={`/memberBenefit/${image}`}
        alt={benefit}
        width={300}
        height={300}
        className="w-full h-[38.4375rem] object-cover select-none"
        draggable={false}
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src = "/fallback.jpg";
        }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute bottom-[1.5rem] left-[1.5rem] w-[60%] flex flex-col gap-2">
        <div className="text-lg laptop:text-[1.5rem] desktop:text-[1.5rem] font-heading font-bold text-white flex flex-wrap leading-tight">
          {benefit}
        </div>
        <Link
          href={linkHref}
          className={`text-[1rem] px-[0.7475rem] py-[0.52875rem] ${
            isDarkButton ? "bg-black text-white" : "bg-white text-black"
          } font-body rounded-full hover:opacity-70 transition-colors w-fit`}
          aria-label={`Xem quyền lợi: ${benefit}`}
        >
          Shop
        </Link>
      </div>
    </div>
  );
}
