"use client";

import { useState } from "react";
import Image from "next/image";

export function PhotoGallery({
  photos,
  title,
}: {
  photos: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[21/9] items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant">
        No photos available
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-surface-container-high">
        <Image
          src={photos[active]}
          alt={title}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs text-white backdrop-blur">
          {active + 1} / {photos.length}
        </div>
      </div>
      {photos.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === active}
              className={
                "relative h-20 w-32 shrink-0 overflow-hidden rounded-md transition-opacity " +
                (i === active
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100")
              }
            >
              <Image
                src={photo}
                alt=""
                fill
                sizes="128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
