"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import InteractiveWorldMap from "@/components/ui/InteractiveWorldMap";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Saint {
  name: string;
  href: string;
  image: string;
  alt: string;
}

interface Region {
  id: string;
  label: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const saints: Saint[] = [
{
  name: "St. Mary Mother of God",
  href: "/mosc/saints/st-mary-mother-of-god",
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/St_Mother_Mary.jpg",
  alt: "Icon of St. Mary, Mother of God, in traditional Orthodox style"
},
{
  name: "St. Basilios Yeldho",
  href: "/mosc/saints/st-baselios-yeldho-kothamangalam-bava",
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1380920cf-1773947408866.png",
  alt: "Portrait of St. Basilios Yeldho Kothamangalam Bava in episcopal vestments"
},
{
  name: "St. Geevarghese",
  href: "/mosc/saints/st-geevarghese-mar-dionysius-vattasseril",
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/St_Geevarghese.jpg",
  alt: "Portrait of St. Geevarghese Mar Dionysius Vattasseril in traditional attire"
},
{
  name: "St. Gregorios Of Parumala",
  href: "/mosc/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios",
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/St_Gregorios_Parumala.jpg",
  alt: "Portrait of St. Gregorios of Parumala Metropolitan in episcopal robes"
}];


const regions: Region[] = [
{ id: "south-west-america", label: "South West America" },
{ id: "north-east-america", label: "North East America" },
{ id: "uk", label: "UK" },
{ id: "africa", label: "Africa" },
{ id: "india", label: "India" }];


const quickLinks = [
{ label: "Spiritual Organisations", href: "#" },
{ label: "Publications", href: "#" },
{ label: "Institutions", href: "#" },
{ label: "Training", href: "#" },
{ label: "Theological Seminaries", href: "#" },
{ label: "Lectionary", href: "#" },
{ label: "Downloads", href: "#" },
{ label: "Calendar", href: "#" },
{ label: "Gallery", href: "#" }];


const navLinks = [
{ label: "Home", href: "/" },
{ label: "The Catholicate", href: "#" },
{ label: "Administration", href: "#" },
{ label: "The Church", href: "#" },
{ label: "Holy Synod", href: "#" },
{ label: "Ecumenical", href: "#" },
{ label: "Dioceses", href: "#" },
{ label: "News", href: "#" },
{ label: "Directory", href: "#" },
{ label: "Saints", href: "#" }];


const slides = [
{
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/bava_thirumeni_pope_visit.jpeg",
  alt: "His Holiness Baselios Marthoma Mathews III meeting with Pope Francis at the Vatican"
},
{
  image: "https://www.mosc-temp.com/mosc/assets/images/mosc_images/Malankara_Orthodox_Palace_Slider_New.jpeg",
  alt: "Malankara Orthodox Palace, the headquarters of the Malankara Orthodox Syrian Church in Devalokam, Kottayam"
}];


// ─── Component ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState("india");
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [saintIndex, setSaintIndex] = useState(0);
  const [readingLang, setReadingLang] = useState<"english" | "malayalam">("english");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const sliderRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Scroll animation refs
  const aboutRef = useRef<HTMLElement>(null);
  const calendarRef = useRef<HTMLElement>(null);
  const presenceRef = useRef<HTMLElement>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [presenceVisible, setPresenceVisible] = useState(false);

  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    sliderRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => {if (sliderRef.current) clearInterval(sliderRef.current);};
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === aboutRef.current) setAboutVisible(true);
            if (entry.target === calendarRef.current) setCalendarVisible(true);
            if (entry.target === presenceRef.current) setPresenceVisible(true);
          }
        });
      },
      { threshold: 0.12 }
    );
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (calendarRef.current) observer.observe(calendarRef.current);
    if (presenceRef.current) observer.observe(presenceRef.current);
    return () => observer.disconnect();
  }, []);

  const visibleSaints = saints.slice(saintIndex, saintIndex + 3);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for your message. We will get back to you soon.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-parchment font-dm-sans overflow-x-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 shadow-md border-b-2 border-burgundy/40">

        {/* Row 1: Logo + Church Name */}
        <div className="bg-parchment-deep border-b border-burgundy/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-2">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                  <Image
                    src="https://www.mosc-temp.com/images/logos/Current_Edits/New%20Edit/Mosc_Header_Logo9.png"
                    alt="Malankara Orthodox Syrian Church official logo"
                    fill
                    className="object-contain" />
                </div>
                <span className="text-burgundy-dark font-bold text-lg md:text-xl leading-tight tracking-wide">
                  Malankara Orthodox Syrian Church
                </span>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-burgundy/80 hover:text-burgundy p-2"
                aria-label="Toggle mobile menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ?
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> :
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Main Nav */}
        <div className="bg-burgundy-dark hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
            <nav className="flex items-center gap-0 justify-end">
              {navLinks.map((link) =>
              <Link
                key={link.label}
                href={link.href}
                className="relative text-burgundy-dark hover:text-burgundy font-medium text-[11px] px-3 py-2 transition-all duration-200 whitespace-nowrap group overflow-hidden">
                <span className="absolute inset-0 bg-burgundy/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-sm" />
                <span className="relative z-10">{link.label}</span>
              </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen &&
        <div className="lg:hidden bg-parchment-deep border-t border-burgundy/20 py-2">
          <div className="max-w-7xl mx-auto px-4">
            {navLinks.map((link) =>
            <Link
              key={link.label}
              href={link.href}
              className="block text-burgundy-dark hover:text-burgundy text-xs py-2 px-2 hover:bg-burgundy/10 rounded transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}>
              {link.label}
            </Link>
            )}
          </div>
        </div>
        }

        {/* Row 3: Quick Links Bar */}
        <div className="bg-burgundy overflow-x-auto border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 lg:px-16">
            <div className="flex items-center gap-0 min-w-max justify-end ml-auto">
              {quickLinks.map((ql) =>
              <Link
                key={ql.label}
                href={ql.href}
                className="relative text-parchment-light font-semibold text-[10px] px-3 py-2 whitespace-nowrap border-r border-white/10 last:border-r-0 group overflow-hidden transition-colors duration-200 hover:text-warmGold">
                <span className="absolute inset-0 bg-warmBrown scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-bottom" />
                <span className="relative z-10">{ql.label}</span>
              </Link>
              )}
            </div>
          </div>
        </div>

      </header>

      {/* ── HERO SLIDER ────────────────────────────────────────────────── */}
      <section className="relative h-[300px] md:h-[400px] overflow-hidden">
        {slides.map((slide, i) =>
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}>
          <div
            className="absolute inset-0"
            style={{ transform: `translateY(${scrollY * 0.3}px)`, willChange: "transform" }}>
            <Image src={slide.image} alt={slide.alt} fill className="object-cover" priority={i === 0} />
          </div>
        </div>
        )}

        {/* Slide content overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-16 w-full">
            <div className="max-w-lg">
              <div className="w-12 h-0.5 bg-warmGold mb-4" />
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
                Malankara Orthodox<br />
                <span className="text-warmGold">Syrian Church</span>
              </h1>
              <p className="text-parchment/90 text-sm md:text-base leading-relaxed">
                Rooted in the Apostolic ministry of St. Thomas in India
              </p>
            </div>
          </div>
        </div>

        {/* Pagination dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) =>
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 h-2.5 bg-warmGold" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"}`}
            aria-label={`Go to slide ${i + 1}`} />
          )}
        </div>
      </section>

      {/* ── ICON QUICK ACCESS BAR ──────────────────────────────────────── */}
      <section className="bg-parchment-deep border-y-2 border-burgundy/20">
        <div className="max-w-7xl mx-auto px-4 lg:px-16">
          <div className="grid grid-cols-5 divide-x divide-burgundy/20">
            {[
            {
              label: "Catholicate News",
              href: "/news",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M4 4h16v2H4zM4 9h10M4 13h10M4 17h6M16 13l2 2 4-4" />
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                </svg>

            },
            {
              label: "Downloads",
              href: "/downloads",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M12 3v13M7 11l5 5 5-5" />
                  <path d="M4 18h16" />
                </svg>

            },
            {
              label: "E-Mail",
              href: "/contact-form-email",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>

            },
            {
              label: "Gallery",
              href: "/gallery",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <rect x="2" y="2" width="20" height="20" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M2 15l6-6 4 4 3-3 7 7" />
                </svg>

            },
            {
              label: "Contact Info",
              href: "/contact-info",
              icon:
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                </svg>

            }].
            map((item) =>
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 py-4 px-2 transition-all duration-300 group hover:bg-burgundy hover:-translate-y-0.5 hover:shadow-md hover:shadow-burgundy/30">
              <span className="text-burgundy group-hover:text-white transition-colors duration-300 group-hover:scale-110 transform">{item.icon}</span>
              <span className="text-warmBrown group-hover:text-white text-xs font-medium text-center leading-tight transition-colors duration-300">
                {item.label}
              </span>
            </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── ABOUT US ───────────────────────────────────────────────────── */}
      <section ref={aboutRef} className={`py-16 md:py-24 bg-parchment border-b border-burgundy/15 transition-all duration-700 ease-out ${aboutVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Images collage */}
            <div className="relative h-[380px] md:h-[480px]">
              <div className="absolute top-0 left-0 w-3/4 h-3/4 rounded-2xl overflow-hidden shadow-xl shadow-burgundy/20 border border-burgundy/30 transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/Malankara_Orthodox_Fathers_Image.jpeg"
                  alt="Malankara Orthodox Church fathers and bishops gathered in a formal assembly"
                  fill
                  className="object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-xl shadow-warmGold/20 border-4 border-parchment transition-transform duration-500 hover:scale-[1.02]">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/Cross_Image.png"
                  alt="Malankara Orthodox Syrian Church cross symbol representing the faith"
                  fill
                  className="object-cover" />
              </div>
              {/* Decorative circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden border-4 border-warmGold shadow-lg z-10">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/MOSC_Cross_Inside_Circle.png"
                  alt="MOSC cross emblem inside circle, the official seal of the Malankara Orthodox Syrian Church"
                  fill
                  className="object-cover" />
              </div>
            </div>

            {/* Text */}
            <div>
              <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/40 px-3 py-1 rounded-full bg-burgundy/10">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mb-6 leading-tight">
                The Malankara Orthodox<br />
                <span className="text-burgundy">Syrian Church</span>
              </h2>
              <p className="text-warmGray-dark leading-relaxed mb-8 text-base">
                The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India. We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations while serving our members with love, compassion, and spiritual guidance.
              </p>
              <Link
                href="/mosc/the-church/the-malankara-orthodox-syrian-church"
                className="inline-flex items-center gap-2 bg-burgundy text-white font-semibold px-6 py-3 rounded-lg hover:bg-burgundy-light transition-all duration-300 text-sm hover:shadow-lg hover:shadow-burgundy/40 hover:-translate-y-0.5 transform">
                Know More
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Saints Carousel */}
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-burgundy text-xs font-bold tracking-widest uppercase">Heritage</span>
                <h3 className="text-2xl font-bold text-warmBrown-dark mt-1">Our Saints & Blesseds</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSaintIndex(Math.max(0, saintIndex - 1))}
                  disabled={saintIndex === 0}
                  className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
                  aria-label="Previous saint">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSaintIndex(Math.min(saints.length - 3, saintIndex + 1))}
                  disabled={saintIndex >= saints.length - 3}
                  className="w-9 h-9 rounded-full border border-burgundy/40 flex items-center justify-center text-burgundy hover:bg-burgundy hover:text-white hover:border-burgundy disabled:opacity-30 transition-all duration-200"
                  aria-label="Next saint">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {visibleSaints.map((saint) =>
              <Link
                key={saint.name}
                href={saint.href}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] block border border-burgundy/20 hover:border-burgundy/60 transition-all duration-300 hover:shadow-xl hover:shadow-burgundy/30 hover:-translate-y-1 transform">
                <Image src={saint.image} alt={saint.alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-warmBrown-dark/90 via-warmBrown-dark/20 to-transparent group-hover:from-burgundy/90 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold text-sm leading-tight">{saint.name}</p>
                  <span className="text-warmGold text-xs mt-1 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn more <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATHOLICOS PROFILE ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-parchment-deep relative overflow-hidden border-b border-burgundy/15">
        {/* Decorative bg */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-burgundy rounded-full blur-3xl"
            style={{ transform: `translateY(${(scrollY - 600) * 0.12}px)`, willChange: "transform" }} />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 bg-warmGold rounded-full blur-3xl"
            style={{ transform: `translateY(${(scrollY - 600) * -0.1}px)`, willChange: "transform" }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-5 gap-10 items-center">
            {/* Images */}
            <div className="lg:col-span-2 flex gap-4">
              <div className="flex-1 rounded-2xl overflow-hidden aspect-[3/4] relative shadow-xl border border-burgundy/30 hover:border-burgundy/60 transition-all duration-300 hover:shadow-burgundy/30">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/Baselios_Marthoma_Mathews_III.jpeg"
                  alt="His Holiness Baselios Marthoma Mathews III, Catholicos of the East and Malankara Metropolitan, in full episcopal vestments"
                  fill
                  className="object-cover" />
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden aspect-[3/4] relative shadow-xl mt-8 border border-burgundy/30 hover:border-burgundy/60 transition-all duration-300 hover:shadow-burgundy/30">
                <Image
                  src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/Baselios_Marthoma_Mathews_III_2.jpeg"
                  alt="His Holiness Baselios Marthoma Mathews III during an official church ceremony"
                  fill
                  className="object-cover" />
              </div>
            </div>

            {/* Text */}
            <div className="lg:col-span-3">
              <span className="inline-block text-warmGold-dark text-xs font-bold tracking-widest uppercase mb-3 border border-warmGold/50 px-3 py-1 rounded-full bg-warmGold/10">
                Malankara Metropolitan
              </span>
              <p className="text-burgundy text-sm font-medium mb-2">Catholicos of the East and Malankara Metropolitan</p>
              <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mb-6 leading-tight">
                His Holiness Baselios<br />
                <span className="text-burgundy">Marthoma Mathews III</span>
              </h2>
              <p className="text-warmGray-dark leading-relaxed mb-8 text-base">
                His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.
              </p>
              <Link
                href="/mosc/holy-synod/his-holiness-baselios-marthoma-mathews-iii"
                className="inline-flex items-center gap-2 border-2 border-burgundy text-burgundy font-semibold px-6 py-3 rounded-lg hover:bg-burgundy hover:text-white transition-all duration-300 text-sm hover:shadow-lg hover:shadow-burgundy/40 hover:-translate-y-0.5 transform">
                View Profile
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── LITURGICAL CALENDAR ────────────────────────────────────────── */}
      <section ref={calendarRef} className={`py-16 md:py-24 bg-parchment border-b border-burgundy/15 transition-all duration-700 ease-out ${calendarVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Calendar image */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-xl shadow-burgundy/15 border-2 border-burgundy/25 hover:border-burgundy/50 hover:shadow-burgundy/25 transition-all duration-300 group">
              <Image
                src="https://www.mosc-temp.com/mosc/assets/images/mosc_images/liturgy.jpg"
                alt="Malankara Orthodox Syrian Church liturgical calendar showing feast days and holy seasons"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-warmBrown-dark/60 to-transparent" />
            </div>

            {/* Calendar content */}
            <div className="bg-parchment-light rounded-2xl p-8 border border-burgundy/20 shadow-sm">
              <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
                Liturgical Calendar
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mb-2 leading-tight">
                Daily <span className="text-burgundy">Readings</span>
              </h2>
              <p className="text-warmGold-dark font-semibold mb-6">19 March 2026</p>

              {/* Language toggle */}
              <div className="flex gap-2 mb-6">
                {(["english", "malayalam"] as const).map((lang) =>
                <button
                  key={lang}
                  onClick={() => setReadingLang(lang)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  readingLang === lang ?
                  "bg-burgundy text-white shadow-md shadow-burgundy/30" : "border border-burgundy/30 text-warmBrown hover:border-burgundy hover:text-burgundy hover:bg-burgundy/5"}`
                  }>
                  {lang}
                </button>
                )}
              </div>

              <div className="bg-parchment-deep rounded-xl p-5 border border-burgundy/20">
                {readingLang === "english" ?
                <div className="space-y-3">
                  <div className="flex gap-3 group/item hover:bg-burgundy/5 rounded-lg p-2 -mx-2 transition-colors duration-200">
                    <span className="text-burgundy text-xs font-bold uppercase tracking-wider w-20 shrink-0 pt-0.5">First</span>
                    <p className="text-warmGray-dark text-sm">Isaiah 55:6-9 — Seek the Lord while he may be found</p>
                  </div>
                  <div className="flex gap-3 group/item hover:bg-burgundy/5 rounded-lg p-2 -mx-2 transition-colors duration-200">
                    <span className="text-burgundy text-xs font-bold uppercase tracking-wider w-20 shrink-0 pt-0.5">Epistle</span>
                    <p className="text-warmGray-dark text-sm">Romans 8:14-17 — Led by the Spirit of God</p>
                  </div>
                  <div className="flex gap-3 group/item hover:bg-burgundy/5 rounded-lg p-2 -mx-2 transition-colors duration-200">
                    <span className="text-warmGold-dark text-xs font-bold uppercase tracking-wider w-20 shrink-0 pt-0.5">Gospel</span>
                    <p className="text-warmGray-dark text-sm">Luke 15:11-32 — The Parable of the Prodigal Son</p>
                  </div>
                </div> :
                <p className="text-warmGray-dark text-sm text-center py-4">Malayalam readings loading...</p>
                }
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR PRESENCE ───────────────────────────────────────────────── */}
      <section ref={presenceRef} className={`py-16 md:py-24 bg-parchment-deep border-b border-burgundy/15 transition-all duration-700 ease-out ${presenceVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-10">
            <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
              Our Presence
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-warmBrown-dark mt-2">
              Malankara Orthodox Syrian Church<br />
              <span className="text-burgundy">Worldwide Locations</span>
            </h2>
            <p className="text-warmGray-dark mt-3 text-sm">Places Where We Are Situated — Our Church is Situated Around The World</p>
          </div>

          {/* Region selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {regions.map((region) =>
            <button
              key={region.id}
              onClick={() => setActiveRegion(region.id)}
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              activeRegion === region.id ?
              "bg-burgundy text-white shadow-lg shadow-burgundy/40 scale-105" :
              "border border-burgundy/30 text-warmBrown hover:border-burgundy hover:text-white hover:bg-burgundy hover:shadow-md hover:shadow-burgundy/30 hover:scale-105"}`
              }>
              {region.label}
            </button>
            )}
          </div>

          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 shadow-xl shadow-burgundy/15 border-2 border-burgundy/25 hover:border-burgundy/45 hover:shadow-burgundy/25 transition-all duration-300 group">
            <InteractiveWorldMap activeRegion={activeRegion} hoveredRegion={hoveredRegion} />
            <div className="absolute inset-0 bg-parchment/5" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="bg-warmBrown-dark border-t-2 border-burgundy/40">
        {/* Contact Form */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <span className="text-warmGold text-xs font-bold tracking-widest uppercase mb-3 block border-l-4 border-warmGold pl-3">Get In Touch</span>
              <h3 className="text-2xl font-bold text-white mb-6">Contact Us</h3>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name *"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-warmBrown border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-warmGold focus:ring-1 focus:ring-warmGold/30 transition-all duration-200" />
                  <input
                    type="email"
                    placeholder="Email *"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-warmBrown border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-warmGold focus:ring-1 focus:ring-warmGold/30 transition-all duration-200" />
                </div>
                <input
                  type="tel"
                  placeholder="Phone *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-warmBrown border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-warmGold focus:ring-1 focus:ring-warmGold/30 transition-all duration-200" />
                <textarea
                  placeholder="Message *"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-warmBrown border border-white/10 text-white placeholder-white/40 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-warmGold focus:ring-1 focus:ring-warmGold/30 transition-all duration-200 resize-none" />
                <button
                  type="submit"
                  className="bg-warmGold text-warmBrown-dark font-bold px-8 py-3 rounded-lg hover:bg-warmGold-light transition-all duration-300 text-sm hover:shadow-lg hover:shadow-warmGold/40 hover:-translate-y-0.5 transform">
                  Send Message
                </button>
              </form>
            </div>

            {/* Info columns */}
            <div className="grid sm:grid-cols-2 gap-8">
              {/* Quick Links */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider border-b border-white/10 pb-2">Quick Links</h4>
                <ul className="space-y-2">
                  {[
                  { label: "Catholicate News", href: "/news" },
                  { label: "Downloads", href: "/downloads" },
                  { label: "E-Mail", href: "/contact-form-email" },
                  { label: "Gallery", href: "/gallery" },
                  { label: "Contact Info", href: "/contact-info" }].
                  map((link) =>
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/60 hover:text-warmGold text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                      <span className="w-1 h-1 rounded-full bg-warmGold/40 group-hover:bg-warmGold transition-colors duration-200" />
                      {link.label}
                    </Link>
                  </li>
                  )}
                </ul>

                <h4 className="text-white font-semibold mt-6 mb-3 text-sm uppercase tracking-wider border-b border-white/10 pb-2">Upcoming Events</h4>
                <p className="text-white/50 text-sm">Visit our events page for upcoming events.</p>

                <h4 className="text-white font-semibold mt-6 mb-3 text-sm uppercase tracking-wider border-b border-white/10 pb-2">Social With Us</h4>
                <div className="flex gap-3">
                  {["facebook", "twitter", "youtube", "instagram"].map((social) =>
                  <a
                    key={social}
                    href="#"
                    className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:bg-warmGold hover:text-warmBrown-dark hover:border-warmGold transition-all duration-200 text-xs hover:scale-110 transform"
                    aria-label={`Follow us on ${social}`}>
                    {social[0].toUpperCase()}
                  </a>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider border-b border-white/10 pb-2">Headquarters</h4>
                <address className="not-italic space-y-3">
                  <div className="flex gap-3">
                    <svg className="w-4 h-4 text-warmGold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Catholicate Palace<br />
                      Devalokam, Kottayam<br />
                      Kerala, India
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-4 h-4 text-warmGold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href="tel:+914812300700" className="text-white/60 hover:text-warmGold text-sm transition-colors duration-200">
                      +91-481-2300-700
                    </a>
                  </div>
                  <div className="flex gap-3">
                    <svg className="w-4 h-4 text-warmGold shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href="mailto:info@mosc.in" className="text-white/60 hover:text-warmGold text-sm transition-colors duration-200">
                      info@mosc.in
                    </a>
                  </div>
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-4 bg-warmBrown-dark/80">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/40 text-xs">
              © 2026 The Malankara Orthodox Church. All rights reserved.
            </p>
            <p className="text-white/30 text-xs">
              Powered by: Giventa Inc. USA
            </p>
          </div>
        </div>
      </footer>
    </div>);

}