'use client';

import Image from 'next/image';

interface HomePageHeroProps {
  heroImageUrl: string;
}

export function HomePageHero({ heroImageUrl }: HomePageHeroProps) {
  return (
    <section
      className="hero-section relative w-full h-[350px] md:h-[350px] sm:h-[220px] bg-transparent pb-0"
      style={{ height: undefined }}
    >
      {/* Side Image */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '250px',
          minWidth: '120px',
          height: '100%',
          zIndex: 1,
        }}
        className="w-[120px] md:w-[250px] min-w-[80px] h-full"
      >
        {/* Overlay logo */}
        <Image
          src="/images/side_images/malayalees_us_logo.avif"
          alt="Malayalees US Logo"
          width={80}
          height={80}
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(255,255,255,0.7)',
            borderRadius: '50%',
            boxShadow: '0 8px 64px 16px rgba(80,80,80,0.22)',
            zIndex: 2,
          }}
          className="md:w-[120px] md:h-[120px] w-[80px] h-[80px]"
          priority
        />
        <Image
          src="/images/side_images/pooram_side_image_two_images_blur_1.png"
          alt="Kerala Sea Coast"
          width={250}
          height={400}
          className="h-full object-cover rounded-l-lg shadow-2xl"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: '60% center',
            display: 'block',
            boxShadow: '0 0 96px 32px rgba(80,80,80,0.22)',
          }}
          priority
        />
      </div>

      {/* Hero Image */}
      <div
        className="absolute hero-image-container"
        style={{
          left: 265,
          top: 8,
          right: 8,
          bottom: 8,
          zIndex: 2,
        }}
      >
        <div className="w-full h-full relative">
          <Image
            src={heroImageUrl}
            alt="Hero blurred background"
            fill
            className="object-cover w-full h-full blur-lg scale-105"
            style={{
              zIndex: 0,
              filter: 'blur(24px) brightness(1.1)',
              objectPosition: 'center',
            }}
            aria-hidden="true"
            priority
          />
          <Image
            src={heroImageUrl}
            alt="Event Hero"
            fill
            className="object-cover w-full h-full"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
              zIndex: 1,
              background: 'linear-gradient(to bottom, #f8fafc 0%, #fff 100%)',
            }}
            priority
          />
          {/* Overlays */}
          <div className="pointer-events-none absolute left-0 top-0 w-full h-8" style={{ background: 'linear-gradient(to bottom, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
          <div className="pointer-events-none absolute left-0 bottom-0 w-full h-8" style={{ background: 'linear-gradient(to top, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8" style={{ background: 'linear-gradient(to right, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8" style={{ background: 'linear-gradient(to left, rgba(248,250,252,1) 0%, rgba(248,250,252,0) 100%)', zIndex: 20 }} />
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 768px) {
          .hero-section .hero-image-container {
            left: 130px !important;
          }
        }
      `}</style>
    </section>
  );
}