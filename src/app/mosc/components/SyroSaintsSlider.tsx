'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SAINTS = [
  { name: 'St.Mary Mother of God', image: '/mosc/assets/images/mosc_images/St_Mother_Mary.jpg', href: '/mosc/saints/st-mary-mother-of-god' },
  { name: 'St. Baselios Yeldho', image: '/mosc/assets/images/mosc_images/St_Baselios_Yeldho.jpg', href: '/mosc/saints/st-baselios-yeldho-kothamangalam-bava' },
  { name: 'St. Geevarghese', image: '/mosc/assets/images/mosc_images/St_Geevarghese.jpg', href: '/mosc/saints/st-geevarghese-mar-dionysius-vattasseril' },
  { name: 'St. Gregorios Of Parumala', image: '/mosc/assets/images/mosc_images/St_Gregorios_Parumala.jpg', href: '/mosc/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios' },
] as const;

/** Duplicated for seamless infinite loop */
const SAINTS_LOOP = [...SAINTS, ...SAINTS];

const N = SAINTS.length;
const GAP_PX = 10;
const AUTOPLAY_MS = 4000;
const SPEED_MS = 1000;

interface SyroSaintsSliderProps {
  /** When true, render only the saints block (no section wrapper) for use inside About section */
  embedInAbout?: boolean;
}

export default function SyroSaintsSlider({ embedInAbout }: SyroSaintsSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translatePx, setTranslatePx] = useState(0);
  const [slideStepPx, setSlideStepPx] = useState(0);
  const skipTransitionRef = useRef(false);
  const [transitionDisabled, setTransitionDisabled] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const updateSlideStep = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const viewportWidth = viewport.getBoundingClientRect().width;
    const itemsPerView = viewportWidth >= 768 ? 3 : 1;
    const firstLi = track.querySelector<HTMLLIElement>('li');
    if (firstLi) {
      const itemWidth = firstLi.getBoundingClientRect().width;
      setSlideStepPx(itemWidth + GAP_PX);
    } else {
      setSlideStepPx(Math.max(1, viewportWidth / itemsPerView + GAP_PX));
    }
  }, []);

  useEffect(() => {
    updateSlideStep();
    const ro = new ResizeObserver(updateSlideStep);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [updateSlideStep]);

  useEffect(() => {
    if (slideStepPx <= 0) return;
    setTranslatePx(-currentIndex * slideStepPx);
  }, [currentIndex, slideStepPx]);

  /** Reset from clone (index N) back to 0 without animation so loop is seamless */
  const resetToStart = useCallback(() => {
    skipTransitionRef.current = true;
    setTransitionDisabled(true);
    setCurrentIndex(0);
    setTranslatePx(0);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        skipTransitionRef.current = false;
        setTransitionDisabled(false);
      });
    });
  }, []);

  /** Jump to end clone without animation so prev from 0 is seamless */
  const jumpToEndClone = useCallback(() => {
    if (slideStepPx <= 0) return;
    skipTransitionRef.current = true;
    setTransitionDisabled(true);
    const endIndex = SAINTS_LOOP.length - 1;
    setCurrentIndex(endIndex);
    setTranslatePx(-endIndex * slideStepPx);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        skipTransitionRef.current = false;
        setTransitionDisabled(false);
      });
    });
  }, [slideStepPx]);

  const goPrev = useCallback(() => {
    if (currentIndex === 0) {
      jumpToEndClone();
      return;
    }
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex, jumpToEndClone]);

  const goNext = useCallback(() => {
    if (currentIndex === SAINTS_LOOP.length - 1) {
      skipTransitionRef.current = true;
      setTransitionDisabled(true);
      setCurrentIndex(0);
      setTranslatePx(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          skipTransitionRef.current = false;
          setTransitionDisabled(false);
        });
      });
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLUListElement>) => {
      if (e.propertyName !== 'transform') return;
      if (currentIndex === N) resetToStart();
    },
    [currentIndex, resetToStart]
  );

  useEffect(() => {
    autoplayRef.current = setInterval(() => {
      const prev = currentIndexRef.current;
      if (prev === SAINTS_LOOP.length - 1) {
        setTransitionDisabled(true);
        setCurrentIndex(0);
        setTranslatePx(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setTransitionDisabled(false));
        });
      } else {
        setCurrentIndex(prev + 1);
      }
    }, AUTOPLAY_MS);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, []);

  const content = (
    <div className="our-saints-container syro-saints-container disable-select">
      <div className="section-title our-saints-section-title">
        <h6>Our Saints &amp; Blesseds</h6>
      </div>
      <div className="our-saints-slider-container syro-saints-slider-container">
        <ul
          className="controls syro-saints-controls"
          id="saints-customize-controls"
          aria-label="Saints carousel navigation"
          role="group"
        >
          <li className="prev">
            <button type="button" onClick={goPrev} aria-label="Previous" aria-controls="saints">
              <i className="fas fa-angle-left" />
            </button>
          </li>
          <li className="next">
            <button type="button" onClick={goNext} aria-label="Next" aria-controls="saints">
              <i className="fas fa-angle-right" />
            </button>
          </li>
        </ul>
        <div
          className="syro-saints-viewport"
          ref={viewportRef}
          role="region"
          aria-roledescription="carousel"
          aria-label="Our Saints & Blesseds"
        >
          <ul
            className="our-saints-slider syro-saints-track"
            ref={trackRef}
            id="saints"
            style={{
              transform: `translate3d(${translatePx}px, 0, 0)`,
              transition: transitionDisabled ? 'none' : `transform ${SPEED_MS}ms ease`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {SAINTS_LOOP.map((saint, i) => (
              <li key={`${saint.name}-${i}`}>
                <Link href={saint.href} className="unset-link syro-saints-link">
                  <div className="our-saints-card d-flex align-items-center">
                    <div className="our-saints-img me-3">
                      <figure>
                        <Image
                          src={saint.image}
                          alt={saint.name}
                          width={65}
                          height={65}
                          loading="lazy"
                          className="rounded-full object-cover w-full h-full"
                        />
                      </figure>
                    </div>
                    <div className="our-saints-title">
                      <h6>{saint.name}</h6>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  if (embedInAbout) return content;
  return <section className="syro-saints-section">{content}</section>;
}
