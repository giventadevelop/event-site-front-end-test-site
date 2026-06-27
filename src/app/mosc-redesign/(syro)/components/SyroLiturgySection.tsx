'use client';

import React, { useEffect, useState, useCallback } from 'react';

export interface LiturgyReading {
  liturgy_day_heading?: string;
  season_name?: string;
  liturgy_heading: string;
  content_place: string;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function SyroLiturgySection() {
  const [lng, setLng] = useState<'en' | 'ml'>('en');
  const [readings, setReadings] = useState<LiturgyReading[] | null>(null);
  const [liturgyDate, setLiturgyDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchReadings = useCallback((language: 'en' | 'ml') => {
    setLoading(true);
    setError(null);
    fetch(`/api/liturgy?lng=${language}`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error ?? 'Failed to load readings');
          });
        }
        return res.json();
      })
      .then((data: { message?: LiturgyReading[]; liturgyDate?: string }) => {
        const list = Array.isArray(data?.message) ? data.message : [];
        setReadings(list);
        setLiturgyDate(data?.liturgyDate ?? null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load liturgy readings');
        setReadings(null);
        setLiturgyDate(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchReadings(lng);
  }, [lng, fetchReadings]);

  const handleLanguageSwitch = (language: 'en' | 'ml') => {
    setLng(language);
  };

  // Show the liturgy day date from API when available (e.g. 8 March 2026); otherwise today
  const displayDate = liturgyDate
    ? formatDate(new Date(liturgyDate + 'T12:00:00'))
    : formatDate(new Date());

  return (
    <section className="liturgy" aria-label="Liturgical Calendar">
      <style>{`
        #liturgy_readings > p {
          color: #95b6d9 !important;
          font-size: 20px !important;
          font-weight: 400 !important;
          margin-bottom: 0 !important;
        }
        #liturgy_readings > h2 {
          color: #fff !important;
          font-size: 2.2rem !important;
          font-weight: 700 !important;
          margin-bottom: 0.5rem !important;
        }
      `}</style>
      <div className="container">
        {/* Vertical sidebar text — handled by existing CSS (writing-mode: vertical-lr) */}
        <div className="section-title">
          <h6>Liturgical Calendar</h6>
        </div>

        <div className="liturgy-container">
          {/* Right-aligned title */}
          <div className="main-title">
            <h2>
              <span className="imp-color">Liturgical</span>{' '}
              <span>Calendar</span>
            </h2>
          </div>

          {/* Main liturgy card */}
          <div className="liturgy-details">
            {/* Date badge */}
            <div className="liturgy-date">
              <span>
                <i className="fa-solid fa-calendar-day me-3" />
              </span>
              <span>{displayDate}</span>
            </div>

            {/* Content area */}
            <div className="liturgy-data">
              <div className="row">
                {/* Liturgy image — left column */}
                <div className="col-lg-3">
                  <div className="liturgy-image position-relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mosc/assets/images/mosc_images/liturgy.jpg"
                      alt="Liturgical Calendar"
                    />
                  </div>
                </div>

                {/* Readings — right column */}
                <div className="col-lg-9">
                  <div className="row">
                    {/* Language toggle */}
                    <div className="col-12 d-flex justify-content-end">
                      <ul className="nav nav-pills">
                        <li className="liturgy-nav-item nav-item">
                          <button
                            className={`liturgy-button nav-link${lng === 'en' ? ' active' : ''}`}
                            data-id="en"
                            type="button"
                            onClick={() => handleLanguageSwitch('en')}
                            aria-pressed={lng === 'en'}
                            aria-label="Show readings in English"
                          >
                            English
                          </button>
                        </li>
                        <li className="liturgy-nav-item nav-item" role="presentation">
                          <button
                            className={`liturgy-button nav-link${lng === 'ml' ? ' active' : ''}`}
                            data-id="ml"
                            type="button"
                            onClick={() => handleLanguageSwitch('ml')}
                            aria-pressed={lng === 'ml'}
                            aria-label="Show readings in Malayalam"
                          >
                            Malayalam
                          </button>
                        </li>
                      </ul>
                    </div>

                    {/* Readings content */}
                    <div className="col-12">
                      <div className="liturgy-readings">
                        <div className="tab-content">
                          <div
                            className="tab-pane fade show active"
                            id="liturgy_readings"
                          >
                            {/* Loading state */}
                            {loading && (
                              <div
                                className="d-flex align-items-center py-4"
                                aria-live="polite"
                              >
                                <div
                                  className="spinner-border text-light spinner-border-sm me-3"
                                  role="status"
                                >
                                  <span className="visually-hidden">Loading…</span>
                                </div>
                                <span style={{ color: '#95b6d9' }}>
                                  Loading readings…
                                </span>
                              </div>
                            )}

                            {/* Error state */}
                            {error && !loading && (
                              <div style={{ color: '#95b6d9', padding: '20px 0' }}>
                                {error.includes('Access Denied') ||
                                error.includes('LITURGY_API_TOKEN') ? (
                                  <>
                                    <p style={{ fontWeight: 500 }}>
                                      Daily readings are temporarily unavailable.
                                    </p>
                                    <p style={{ marginTop: '8px', fontSize: '14px' }}>
                                      Visit the{' '}
                                      <a
                                        href="https://www.syromalabarliturgy.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                          color: '#ff7903',
                                          textDecoration: 'underline',
                                        }}
                                      >
                                        Syro-Malabar Commission for Liturgy
                                      </a>{' '}
                                      for readings.
                                    </p>
                                  </>
                                ) : (
                                  <p>{error}</p>
                                )}
                              </div>
                            )}

                            {/* Empty state */}
                            {!loading &&
                              !error &&
                              readings &&
                              readings.length === 0 && (
                                <p style={{ color: '#95b6d9', padding: '20px 0' }}>
                                  No readings available for this day.
                                </p>
                              )}

                            {/* Readings data */}
                            {!loading &&
                              !error &&
                              readings &&
                              readings.length > 0 && (
                                <>
                                  {readings[0]?.liturgy_day_heading && (
                                    <p>{readings[0].liturgy_day_heading}</p>
                                  )}
                                  {readings[0]?.season_name && (
                                    <h2>{readings[0].season_name}</h2>
                                  )}
                                  <ul className="fa-ul">
                                    {readings.map((r, i) => (
                                      <li key={i}>
                                        <i className="fa-li fa-solid fa-cross" />
                                        {r.liturgy_heading}
                                        {r.content_place && (
                                          <span>
                                            {' '}
                                            ( {r.content_place} )
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
