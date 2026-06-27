'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface MoscRedesignSaint {
  name: string;
  href: string;
  image: string;
  alt: string;
  imageClassName?: string;
}

const GAP_PX = 20;
const SLIDE_MS = 500;

function itemsPerViewForWidth(viewportWidth: number): number {
  if (viewportWidth >= 768) return 3;
  if (viewportWidth >= 640) return 2;
  return 1;
}

interface MoscRedesignSaintsCarouselProps {
  saints: MoscRedesignSaint[];
}

export default function MoscRedesignSaintsCarousel({ saints }: MoscRedesignSaintsCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [slideStepPx, setSlideStepPx] = useState(0);
  const [cardWidthPx, setCardWidthPx] = useState(0);

  const maxIndex = Math.max(0, saints.length - itemsPerView);

  const updateMetrics = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const viewportWidth = viewport.getBoundingClientRect().width;
    const perView = itemsPerViewForWidth(viewportWidth);
    const gaps = GAP_PX * Math.max(0, perView - 1);
    const cardWidth = Math.max(1, (viewportWidth - gaps) / perView);

    setItemsPerView(perView);
    setCardWidthPx(cardWidth);
    setSlideStepPx(cardWidth + GAP_PX);
    setIndex((prev) => Math.min(prev, Math.max(0, saints.length - perView)));
  }, [saints.length]);

  useEffect(() => {
    updateMetrics();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const ro = new ResizeObserver(updateMetrics);
    ro.observe(viewport);
    window.addEventListener('resize', updateMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, [updateMetrics]);

  const goPrev = () => setIndex((prev) => Math.max(0, prev - 1));
  const goNext = () => setIndex((prev) => Math.min(maxIndex, prev + 1));

  return (
    <div className="about-us-saints-section mt-20">
      <div className="about-us-saints-header flex items-center justify-between mb-8">
        <div>
          <span className="text-burgundy text-xs font-bold tracking-widest uppercase">Heritage</span>
          <h3 className="text-2xl font-bold text-warmBrown-dark mt-1">Our Saints &amp; Blesseds</h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
            title="Previous saint"
            aria-label="Previous saint"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            disabled={index >= maxIndex}
            className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
            title="Next saint"
            aria-label="Next saint"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="about-us-saints-viewport overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label="Our Saints and Blesseds"
      >
        <div
          className="about-us-saints-track flex gap-5"
          style={{
            transform: `translate3d(-${index * slideStepPx}px, 0, 0)`,
            transition: `transform ${SLIDE_MS}ms ease-in-out`,
          }}
        >
          {saints.map((saint) => (
            <Link
              key={saint.name}
              href={saint.href}
              className="about-us-saints-slide group relative shrink-0 rounded-xl overflow-hidden aspect-[6/5] block border border-burgundy/20 bg-parchment-deep hover:border-burgundy/60 transition-all duration-300 hover:shadow-xl hover:shadow-burgundy/30 hover:-translate-y-1 transform"
              style={{ width: cardWidthPx > 0 ? `${cardWidthPx}px` : undefined }}
            >
              <Image
                src={saint.image}
                alt={saint.alt}
                fill
                quality={95}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className={`object-contain object-top transition-transform duration-500 ${saint.imageClassName ?? 'group-hover:scale-105'}`}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-warmBrown-dark/90 via-warmBrown-dark/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="saint-card-title font-semibold text-sm leading-tight">{saint.name}</p>
                <span className="text-warmGold text-xs mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
