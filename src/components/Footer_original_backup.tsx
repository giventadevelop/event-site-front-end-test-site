"use client";
import { useEffect } from 'react';

export function Footer() {
  useEffect(() => {
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear().toString();
  }, []);

  return (
    <footer className="bg-gray-900 text-white w-screen" style={{ margin: 0, padding: 0, width: '100vw' }}>
      {/* Prefooter Section */}
      <div className="py-16 bg-gray-900 w-screen" style={{ margin: 0, padding: 0, width: '100vw' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'none' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Logo & Social */}
            <div className="text-center">
              <div className="mb-5">
                <img
                  src="/images/mcefee_logo_black_border_transparent.png"
                  alt="Footer Logo"
                  className="w-40 mx-auto"
                />
              </div>
              <h6 className="text-lg font-semibold text-yellow-300 mb-5 uppercase tracking-wide">
                Follow us
              </h6>
              <ul className="flex justify-center space-x-4">
                <li>
                  <a
                    href="https://www.facebook.com/profile.php?id=61573944338286"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-10 h-10 bg-yellow-300 text-gray-900 rounded-full text-center leading-10 hover:bg-white hover:transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: Main Menu */}
            <div className="text-center">
              <h6 className="text-lg font-semibold text-yellow-300 mb-5 uppercase tracking-wide">
                Main menu
              </h6>
              <ul className="space-y-3">
                <li><a href="/" className="text-white hover:text-yellow-300 transition-colors duration-300 opacity-90 hover:opacity-100">Home</a></li>
                <li><a href="/#about-us" className="text-white hover:text-yellow-300 transition-colors duration-300 opacity-90 hover:opacity-100">About</a></li>
                <li><a href="/events" className="text-white hover:text-yellow-300 transition-colors duration-300 opacity-90 hover:opacity-100">Events</a></li>
                <li><a href="/#team-section" className="text-white hover:text-yellow-300 transition-colors duration-300 opacity-90 hover:opacity-100">Team</a></li>
                <li><a href="/#contact" className="text-white hover:text-yellow-300 transition-colors duration-300 opacity-90 hover:opacity-100">Contact</a></li>
              </ul>
            </div>

            {/* Column 3: Contacts */}
            <div className="text-center">
              <h6 className="text-lg font-semibold text-yellow-300 mb-5 uppercase tracking-wide">
                Contacts
              </h6>
              <div className="space-y-4">
                <p className="text-white opacity-90 leading-relaxed">
                  MCEFEE<br />
                  Malayali Cultural Exchange Foundation<br />
                  for Education and Events<br />
                  New Jersey, USA
                </p>
                <p className="text-white opacity-90">
                  <a href="tel:+19085168781" className="hover:text-yellow-300 transition-colors duration-300">
                    (908) 516-8781
                  </a>
                </p>
                <p className="text-white opacity-90">
                  <a href="mailto:Contactus@mcefee.org" className="hover:text-yellow-300 transition-colors duration-300">
                    Contactus@mcefee.org
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="py-5 bg-gray-800 border-t border-gray-700 w-screen" style={{ margin: 0, padding: 0, width: '100vw' }}>
        <div className="w-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'none' }}>
          <div className="text-center">
            <div className="text-gray-300 text-sm opacity-80">
              © <span id="currentYear">2025</span> MCEFEE. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}