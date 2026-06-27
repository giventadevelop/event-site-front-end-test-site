'use client';

import React, { useEffect, useRef } from 'react';

const LOCATION_PINS = [
  { id: 'south-west-america', name: 'South West America' },
  { id: 'north-east-america', name: 'North East America' },
  { id: 'uk', name: 'UK' },
  { id: 'africa', name: 'Africa' },
  { id: 'india', name: 'India' },
] as const;

/**
 * Worldwide Locations section: heading + panel styled like syromalabarchurch.in
 * (dark blue gradient, left text block with orange-red accent, map, CTA).
 * Pins use Bootstrap tooltips (data-bs-toggle="tooltip") initialized on mount.
 */
export default function SyroLocationsSection() {
  const tooltipInstancesRef = useRef<unknown[]>([]);

  useEffect(() => {
    const container = document.getElementById('syro-eparchy-countries');
    if (!container || typeof window === 'undefined') return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const initTooltips = () => {
      const win = window as unknown as { bootstrap?: { Tooltip: new (el: HTMLElement) => unknown } };
      if (!win.bootstrap?.Tooltip) return false;
      const triggers = container.querySelectorAll<HTMLElement>('.country-tooltips[data-bs-toggle="tooltip"]');
      const instances: unknown[] = [];
      triggers.forEach((el) => {
        try {
          instances.push(new win.bootstrap!.Tooltip(el));
        } catch {
          // already initialized or invalid
        }
      });
      tooltipInstancesRef.current = instances;
      return true;
    };

    if (!initTooltips()) {
      intervalId = setInterval(() => {
        if (initTooltips() && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      tooltipInstancesRef.current.forEach((instance: unknown) => {
        if (instance && typeof (instance as { dispose?: () => void }).dispose === 'function') {
          (instance as { dispose: () => void }).dispose();
        }
      });
      tooltipInstancesRef.current = [];
    };
  }, []);

  return (
    <section className="syromalabar-locations mb-16">
      <div className="container">
        <div className="section-title">
          <h6>Our Presence</h6>
        </div>
        <div className="location-container">
          <div className="main-title">
            <h2>
              <span>Malankara Orthodox Syrian Church</span>
              <br />
              <span>Worldwide</span>
              <span className="imp-color"> Locations</span>
            </h2>
          </div>
          {/* Panel below heading: blue gradient, left text block, map, CTA (match syromalabarchurch.in) */}
          <div className="syro-locations-panel">
            <div className="syro-locations-panel-inner">
              <div className="syro-locations-text-block">
                <div className="syro-locations-accent-bar" aria-hidden />
                <div className="syro-locations-text-content">
                  <h3 className="syro-locations-panel-title">Places Where We Are Situated</h3>
                  <p className="syro-locations-panel-desc">Our Church is Situated Around The World</p>
                </div>
              </div>
              {/* Map container: position relative, pins overlay (match syromalabarchurch.in index.html #eparchy_countries) */}
              <div className="syro-locations-map-wrap syro-img-map-container">
                <div id="syro-eparchy-countries" className="syro-eparchy-countries">
                  {LOCATION_PINS.map(({ id, name }) => (
                    <div
                      key={id}
                      className={`${id} position-absolute`}
                      role="button"
                      tabIndex={0}
                      aria-label={name}
                    >
                      <span
                        className="country-tooltips syro-country-tooltips d-none d-lg-block"
                        data-bs-toggle="tooltip"
                        data-bs-custom-class="location-tooltip"
                        data-bs-placement="top"
                        data-bs-title={name}
                      />
                    </div>
                  ))}
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/dioceses/mosc-diocese-map%20(2).jpg"
                  alt="Worldwide Locations"
                  width={1200}
                  height={600}
                  className="syro-locations-map-img"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
