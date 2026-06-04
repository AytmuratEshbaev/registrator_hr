"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useLanguage } from "@/components/language/language-provider";
import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  captionKey: string;
  gridClass: string;
}

const GALLERY_IMAGES: GalleryImage[] = [
  {
    src: "/assets/images/school_classroom.png",
    captionKey: "Shinam sinfxonalar",
    gridClass: "md:col-span-2 md:row-span-2",
  },
  {
    src: "/assets/images/school_library.png",
    captionKey: "Zamonaviy kutubxona",
    gridClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/assets/images/school_it_lab.png",
    captionKey: "IT va robototexnika xonasi",
    gridClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/assets/images/school_science_lab.png",
    captionKey: "Ilmiy laboratoriya",
    gridClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/assets/images/school_sports_gym.png",
    captionKey: "Keng sport zali",
    gridClass: "md:col-span-1 md:row-span-2",
  },
  {
    src: "/assets/images/school_art_room.png",
    captionKey: "Tasviriy san'at va ijod xonasi",
    gridClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/assets/images/school_courtyard.png",
    captionKey: "Shinam maktab hovlisi",
    gridClass: "md:col-span-1 md:row-span-1",
  },
  {
    src: "/assets/images/school_cafeteria.png",
    captionKey: "Shinam oshxona",
    gridClass: "md:col-span-1 md:row-span-1",
  },
];

export function Gallery() {
  const { t } = useLanguage();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setActiveIdx((prev) => (prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null));
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIdx((prev) =>
      prev !== null ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length : null
    );
  }, []);

  const handleClose = useCallback(() => {
    setActiveIdx(null);
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIdx, handleNext, handlePrev, handleClose]);

  // Disable body scroll when Lightbox is active
  useEffect(() => {
    if (activeIdx !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIdx]);

  return (
    <section className="w-full py-16 bg-white border-t border-slate-200/60">
      <div className="max-w-5xl w-full mx-auto px-4 md:px-6">
        
        {/* Sarlavha qismi */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight select-none flex items-center justify-center gap-2">
            <span className="w-2.5 h-6 rounded-full bg-indigo-900 block" />
            {t("Maktab galereyasi")}
          </h2>
          <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed">
            {t("Maktabimiz hayotidan yorqin lavhalar")}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[160px] md:auto-rows-[180px] lg:auto-rows-[200px]">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              className={cn(
                "relative group rounded-2xl overflow-hidden cursor-zoom-in border border-slate-100 bg-slate-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-200/50",
                img.gridClass
              )}
            >
              {/* Rasm */}
              <Image
                src={img.src}
                alt={t(img.captionKey)}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 select-none" />

              {/* Hover Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 select-none flex items-end justify-between text-white">
                <div className="space-y-1">
                  <p className="text-xs text-orange-400 font-black uppercase tracking-wider">
                    ZEYIN SCHOOL
                  </p>
                  <p className="text-base font-extrabold tracking-tight">
                    {t(img.captionKey)}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200">
          
          {/* Top navigation - Yopish va Hisoblagich */}
          <div className="w-full flex items-center justify-between text-white/80 select-none max-w-5xl mx-auto">
            <span className="text-sm font-bold tracking-wider font-mono">
              {activeIdx + 1} / {GALLERY_IMAGES.length}
            </span>
            <button
              onClick={handleClose}
              className="w-11 h-11 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Yopish"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Central content - Rasm va Navigatsiya tugmalari */}
          <div className="relative w-full flex-1 flex items-center justify-center py-4">
            
            {/* Chap tugmasi */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-4 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Oldingi rasm"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>

            {/* Kattalashtirilgan Rasm */}
            <div className="relative w-full max-w-4xl h-full max-h-[70vh] flex items-center justify-center">
              <Image
                src={GALLERY_IMAGES[activeIdx].src}
                alt={t(GALLERY_IMAGES[activeIdx].captionKey)}
                fill
                sizes="(max-width: 1024px) 100vw, 1024px"
                className="object-contain"
                priority
              />
            </div>

            {/* O'ng tugmasi */}
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-4 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200"
              aria-label="Keyingi rasm"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>

          </div>

          {/* Bottom content - Izoh */}
          <div className="w-full text-center pb-4 select-none max-w-xl mx-auto">
            <p className="text-xs text-orange-400 font-black uppercase tracking-wider mb-1.5">
              ZEYIN SCHOOL GALLERY
            </p>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {t(GALLERY_IMAGES[activeIdx].captionKey)}
            </h3>
          </div>

        </div>
      )}
    </section>
  );
}
