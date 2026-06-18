import Image from "next/image";

type HallerLogoProps = {
  variant?: "sidebar" | "login";
};

export function HallerLogo({ variant = "sidebar" }: HallerLogoProps) {
  if (variant === "login") {
    return (
      <div className="mb-6 flex justify-center">
        <Image
          src="/logo_haller.png"
          alt="Haller Immobilienberatung GmbH"
          width={280}
          height={72}
          priority
          className="h-auto w-full max-w-[280px]"
        />
      </div>
    );
  }

  return (
    <div className="mb-1">
      <Image
        src="/logo_haller.png"
        alt="Haller Immobilienberatung GmbH"
        width={180}
        height={46}
        priority
        className="h-auto w-full max-w-[180px]"
      />
      <p className="mt-2 text-xs text-dash-muted">Verwaltungssystem</p>
    </div>
  );
}
