import React from 'react';

const ChildrenCta = () => {
  return (
    <section className="bg-[#2C3E50] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Image with Text Overlay */}
        <div
          className="relative flex items-center justify-center bg-cover bg-center min-h-[450px] lg:min-h-[600px]"
          style={{ backgroundImage: "url('https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/children_photo.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/10" />
          <h3 className="text-white font-bold tracking-widest uppercase text-[clamp(6rem,16vw,10rem)] opacity-[0.08] leading-none text-center select-none">
            Children
          </h3>
        </div>
        
        {/* Right Column: Text and CTA Button */}
        <div className="flex flex-col items-center justify-center text-center p-12 sm:p-16 md:p-24">
          <h3 className="text-white text-[28px] font-semibold leading-[1.4] max-w-md mb-16">
            The long journey to end poverty begins with a child.
          </h3>
          <a href="https://demo.artureanec.com/themes/philantrop/causes-3/" className="w-[120px] h-[120px] transition-transform duration-300 hover:scale-110">
            {/* This SVG structure is based on the provided html_structure to replicate the circular text button */}
            <svg viewBox="0 0 100 100" className="w-full h-full"> 
              <defs>
                <path id="circle" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"></path>
              </defs>
              <text style={{ fill: '#F9C23C', fontSize: '11px', fontWeight: 500, letterSpacing: '2.5px' }}>
                <textPath href="#circle">
                  DONATE • DONATE • DONATE • 
                </textPath>
              </text>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ChildrenCta;