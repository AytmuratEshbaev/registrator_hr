"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

// Изображения через Unsplash (не требуют настройки).
// Замените ссылки на собственные при необходимости.
const slides: Slide[] = [
  {
    title: "Развивайтесь вместе с нами",
    subtitle:
      "Открытые возможности для профессионального и карьерного роста на каждом этапе вашего пути.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Команда профессионалов",
    subtitle:
      "Присоединяйтесь к талантливым и опытным коллегам, работающим над интересными задачами.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Современные технологии",
    subtitle:
      "Работайте с передовыми инструментами и подходами в своей сфере. Мы инвестируем в инструменты.",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Баланс работы и жизни",
    subtitle:
      "Гибкий график, комфортные условия и забота о благополучии каждого сотрудника команды.",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
  },
  {
    title: "Постоянное обучение",
    subtitle:
      "Корпоративные тренинги, конференции и поддержка вашего профессионального развития.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1920&q=80",
  },
];

const AUTOPLAY_MS = 6000;

export function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next, paused]);

  return (
    <section
      className="relative h-[520px] md:h-[600px] overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-slate-900/40" />

          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                {slide.title}
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8">
                {slide.subtitle}
              </p>
              <Button asChild size="lg">
                <Link href="/apply">
                  Подать заявку
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Стрелки */}
      <button
        type="button"
        onClick={prev}
        aria-label="Предыдущий слайд"
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Следующий слайд"
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center justify-center w-11 h-11 rounded-full bg-white/10 backdrop-blur hover:bg-white/20 text-white transition"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Индикаторы */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Перейти к слайду ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </section>
  );
}
