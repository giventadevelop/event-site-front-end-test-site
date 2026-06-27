"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Youtube, ArrowUp } from "lucide-react";
import React, { useEffect, useState } from "react";

// Self-contained client component for the back-to-top button
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <a
      href="#"
      onClick={scrollToTop}
      className={`fixed bottom-10 right-10 z-50 bg-[#F9C23C] text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ease-in-out ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      aria-label="Back to top"
    >
      <ArrowUp className="w-7 h-7" />
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#2C3E50] text-gray-300 pt-24 pb-12 relative">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16">

          {/* Column 1: Logo and Social */}
          <div>
            <Link href="#" className="mb-6 inline-block">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/themes/philantrop/img/logo_white.png"
                alt="Philantrop Logo"
                width={150}
                height={33}
                priority
              />
            </Link>
            <p className="text-white mt-4 mb-4">Follow us</p>
            <ul className="flex space-x-4">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="YouTube">
                  <Youtube size={20} />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Contacts */}
          <div>
            <h6 className="text-white font-semibold text-lg mb-6">Contacts</h6>
            <p className="text-gray-400 leading-relaxed mb-4">
              Agencium Ltd, 31 Ashcombe,
              <br />
              London NW5 1QU, UK
            </p>
            <p className="mb-2">
              <a href="tel:+13685678954" className="hover:text-white transition-colors">+1 (368) 567 89 54</a>
            </p>
            <p className="mb-4">
              <a href="tel:+18003508431" className="hover:text-white transition-colors">+ 800 350 84 31</a>
            </p>
            <p>
              <a href="mailto:support@philantrop.com" className="text-[#F9C23C] hover:text-yellow-400 transition-colors">support@philantrop.com</a>
            </p>
          </div>

          {/* Column 3: Main Menu */}
          <div>
            <h6 className="text-white font-semibold text-lg mb-6">Main menu</h6>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pages</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contacts</a></li>
            </ul>
          </div>

          {/* Column 4: Donors Info */}
          <div>
            <h6 className="text-white font-semibold text-lg mb-6">Donors info</h6>
            <ul className="space-y-3">
              <li><a href="#" className="hover:text-white transition-colors">Give or Redeem Gift Cards</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Donate in Honor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Project of the Month Club</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Start a Fundraiser</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Donor Resources</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p className="mb-4 md:mb-0 text-center md:text-left">
            © <a href="#" className="hover:text-white transition-colors">Philantrop</a> 2024. All Rights Reserved by Artureanec
          </p>
          <ul className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <li><a href="#" className="hover:text-white transition-colors">Terms of use Privacy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Environmental Policy</a></li>
          </ul>
        </div>
      </div>
      <BackToTopButton />
    </footer>
  );
};

export default Footer;

