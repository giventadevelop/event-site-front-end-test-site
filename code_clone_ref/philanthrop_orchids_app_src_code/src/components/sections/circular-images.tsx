import React from 'react';
import Image from 'next/image';

const CircularImagesSection = () => {
  return (
    <section className="relative bg-white pt-24 pb-12 lg:pb-24 overflow-x-clip">
      {/* Decorative Background Elements - Desktop only */}
      <div className="hidden lg:block absolute top-0 -left-[193px] w-[1440px] z-0 select-none pointer-events-none" aria-hidden="true">
        <div className="font-display font-bold text-[200px] leading-none uppercase text-foreground/[.04] whitespace-nowrap">
          People need your help
        </div>
        <div className="font-display font-bold text-[200px] leading-none uppercase text-foreground/[.04] whitespace-nowrap">
          People need your help
        </div>
        <div className="font-display font-bold text-[200px] leading-none uppercase text-foreground/[.04] whitespace-nowrap">
          People need your help
        </div>
      </div>
      <Image
        src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/back_overlay_18.png"
        alt=""
        width={337}
        height={311}
        className="absolute -top-12 -left-20 w-1/2 h-auto lg:-top-[110px] lg:-left-[84px] lg:w-[20%] z-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-8">
        {/* Desktop Layout */}
        <div className="hidden lg:block relative h-[560px]">
          <div className="absolute w-[20px] h-[180px] bg-yellow-accent top-[153px] left-[128px] z-10" />
          <div className="absolute w-[280px] h-[280px] top-[121px] left-[168px] z-20">
            <div className="w-full h-full rounded-full bg-green-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>

          <div className="absolute w-[340px] h-[340px] top-0 left-[470px] z-20">
            <div className="w-full h-full rounded-full bg-pink-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_2-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>

          <div className="absolute w-[20px] h-[180px] bg-cyan-accent top-[174px] left-[790px] z-10" />
          <div className="absolute w-[280px] h-[280px] top-[140px] left-[830px] z-20">
            <div className="w-full h-full rounded-full bg-yellow-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_3-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center space-y-16 mt-8">
          {/* Image 1 Mobile */}
          <div className="relative w-64 h-64">
            <div className="absolute -left-4 top-1/4 w-3 h-32 bg-yellow-accent z-10" />
            <div className="w-full h-full rounded-full bg-green-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>
          
          {/* Image 2 Mobile */}
          <div className="relative w-72 h-72">
            <div className="absolute -right-4 top-1/4 w-3 h-32 bg-cyan-accent z-10" />
            <div className="w-full h-full rounded-full bg-pink-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_2-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>
          
          {/* Image 3 Mobile */}
          <div className="relative w-64 h-64">
             <div className="w-full h-full rounded-full bg-yellow-accent mix-blend-multiply opacity-80">
              <div className="w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_3-386x646.jpg"
                  alt="Philantrop Custom Image"
                  width={386}
                  height={646}
                  className="w-full h-auto mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CircularImagesSection;