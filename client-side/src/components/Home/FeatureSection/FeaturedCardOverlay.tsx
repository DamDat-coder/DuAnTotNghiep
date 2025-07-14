import Link from "next/link";

interface FeaturedCardOverlayProps {
  hovered: boolean;
  description: string;
  linkHref: string;
  linkLabel: string;
}

export default function FeaturedCardOverlay({
  hovered,
  description,
  linkHref,
  linkLabel,
}: FeaturedCardOverlayProps) {
  return (
    <>
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          hovered ? "opacity-80" : "opacity-0"
        }`}
      />
      <div className="absolute w-full px-20 inset-0 flex items-center justify-center transition-opacity duration-300">
        <div className="w-full flex flex-col gap-6 items-start justify-center">
          <p
            className={`text-lg text-white transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {description}
          </p>
          <Link
            href={linkHref}
            className={`w-auto text-lg font-bold text-black bg-white px-6 py-3 rounded-full transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label={`Xem sản phẩm ${linkLabel}`}
          >
            Shop {linkLabel}
          </Link>
        </div>
      </div>
    </>
  );
}
