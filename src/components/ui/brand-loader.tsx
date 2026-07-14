"use client"

import Image from "next/image"
import { withBasePath } from "@/lib/base-path"
import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

const logoSrc = withBasePath("/Logo.svg?v=5")

function BrandLoader({
  label = "Загрузка...",
  fullScreen = false,
  className,
}: {
  label?: string
  fullScreen?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-5 px-4 text-center",
        fullScreen
          ? "fixed inset-0 z-[200] bg-background/90 backdrop-blur-md"
          : "min-h-[50dvh] w-full",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <Image
          src={logoSrc}
          alt="KassaPay"
          width={180}
          height={40}
          className="h-9 w-auto object-contain sm:h-10"
          priority
        />
        <Spinner size="lg" label="" className="text-primary" />
        {label ? (
          <p className="text-sm text-muted-foreground">{label}</p>
        ) : null}
      </div>
    </div>
  )
}

export { BrandLoader }
