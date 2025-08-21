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
      {/* Overlay background */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          hovered ? "opacity-80" : "opacity-0"
        }`}
      />
      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-start justify-center gap-6 px-6 laptop:px-20 desktop:px-20">
        <p
          className={` text-white text-lg transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {description}
        </p>
        <Link
          href={linkHref}
          className={`bg-white text-black font-bold px-6 py-3 rounded-full transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          aria-label={`Xem sản phẩm ${linkLabel}`}
        >
          Shop {linkLabel}
        </Link>
      </div>
    </>
  );
}
