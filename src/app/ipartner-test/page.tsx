'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function IPartnerTestPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isBlurry, setIsBlurry] = useState(false);
  const [isCircus, setIsCircus] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} ${isBlurry ? 'blur-sm' : ''} ${isCircus ? 'animate-bounce' : ''}`}>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="welcome-message">
              <p className="text-sm text-gray-600 dark:text-gray-300">Vitajte! ako Vám môžem pomôcť?</p>
            </div>
            <div className="theme-controls flex flex-wrap gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                dark theme
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  theme === 'light' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                light theme
              </button>
              <button
                onClick={() => setIsBlurry(!isBlurry)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  isBlurry ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                i feel blurry
              </button>
              <button
                onClick={() => setIsCircus(!isCircus)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  isCircus ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                i feel like circus today
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="border-t border-gray-200 dark:border-gray-700 py-4">
            <ul className="flex flex-wrap gap-6 text-sm">
              <li>
                <Link href="#o-spolocnosti" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  o spoločnosti
                </Link>
              </li>
              <li>
                <Link href="#sluzby" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  služby
                </Link>
              </li>
              <li>
                <Link href="#filantropia" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  filantropia
                </Link>
              </li>
              <li>
                <Link href="#referencie" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  referencie
                </Link>
              </li>
              <li>
                <Link href="#kontakt" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  kontakt
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pre klientov */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">pre klientov</h2>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  webmail
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  servis
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  nastavenia e-mailu
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  circle tracking
                </Link>
              </li>
            </ul>
          </section>

          {/* Neprehliadnite */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">neprehliadnite</h2>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  webhosting
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  PPC kampane
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  referencie
                </Link>
              </li>
            </ul>
          </section>

          {/* Odporúčame */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">odporúčame</h2>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  tlačové služby
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  IT správa
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  audio systémy
                </Link>
              </li>
            </ul>
          </section>

          {/* Informácie */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">informácie</h2>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  GDPR
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  logomanuál ipartner
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  žiadosť o sponzorovanie
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  kontakty
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">Copyright © 2007 - 2025</p>
            <p className="font-semibold mb-2">iPARTNER s.r.o.</p>
            <p>Hurbanova 1243/18, 03101, Liptovský Mikuláš</p>
            <p className="mt-2">IČO: 43802338</p>
            <p>DIČ: 2022493781</p>
            <p>IČ DPH: SK2022493781</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

