import Image from 'next/image';

const partnerLogos = [
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_1.png', 
    alt: "M'N'Mize Interior logo",
    width: 144, 
    height: 34 
  },
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_2.png', 
    alt: 'Nordyne Defense Dynamics logo', 
    width: 138, 
    height: 66 
  },
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_3.png', 
    alt: 'Metriks Data Center logo', 
    width: 144, 
    height: 38 
  },
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_4.png', 
    alt: 'Quo Legal Firm logo', 
    width: 144, 
    height: 38 
  },
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_5.png', 
    alt: 'Agrimax logo', 
    width: 144, 
    height: 40 
  },
  { 
    src: 'https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/logo_6.png', 
    alt: 'VS 1998 logo',
    width: 144, 
    height: 28 
  },
];

const PartnersLogos = () => {
  return (
    <div className="bg-background">
      <div className="container py-16 md:py-24">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 md:gap-x-16 lg:justify-between">
          {partnerLogos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
              className="h-auto w-auto max-w-full flex-shrink-0 filter grayscale opacity-60 transition-all duration-300 ease-in-out hover:grayscale-0 hover:opacity-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersLogos;