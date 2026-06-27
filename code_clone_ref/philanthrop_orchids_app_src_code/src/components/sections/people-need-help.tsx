import Image from "next/image";

const PeopleNeedHelp = () => {
  const marqueeText = "People need your help";

  const MarqueeTextContent = () => (
    <>
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="font-display text-[clamp(4rem,20vw,10rem)] leading-none font-bold uppercase mx-8 text-transparent whitespace-nowrap"
          style={{ WebkitTextStroke: "1px rgba(33, 37, 41, 0.1)" }}
        >
          {marqueeText}
        </span>
      ))}
    </>
  );

  return (
    <section className="relative bg-white pt-24 pb-12 overflow-x-clip">
      <Image
        src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/back_overlay_18.png"
        alt="Pink watercolor background accent"
        width={396}
        height={356}
        className="absolute top-[-20px] left-[-40px] z-0"
        unoptimized
      />

      <div className="relative z-10 -rotate-2 mb-[-40px] md:mb-[-60px]">
        <div className="flex w-full">
          <div className="flex animate-marquee-slow flex-none">
            <MarqueeTextContent />
          </div>
          <div className="flex animate-marquee-slow flex-none" aria-hidden="true">
            <MarqueeTextContent />
          </div>
        </div>
      </div>

      <div className="container mx-auto relative z-20 px-4">
        <div className="flex justify-center items-start gap-12 flex-wrap">
          {/* Portrait 1 */}
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 w-1.5 md:w-2 h-24 bg-yellow-accent z-10"></div>
            <div className="relative w-[180px] h-[250px] md:w-[250px] md:h-[350px] rounded-[150px] overflow-hidden">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo-386x646.jpg"
                alt="An elderly woman with a thoughtful expression"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div className="absolute inset-0 bg-green-accent mix-blend-multiply rounded-[150px]"></div>
            </div>
          </div>

          {/* Portrait 2 */}
          <div className="relative mt-8 md:mt-16">
            <div className="relative w-[180px] h-[250px] md:w-[250px] md:h-[350px] rounded-[150px] overflow-hidden">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_2-386x646.jpg"
                alt="A young girl with intense eyes looking at the camera"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div className="absolute inset-0 bg-pink-accent mix-blend-multiply rounded-[150px]"></div>
            </div>
          </div>

          {/* Portrait 3 */}
          <div className="relative">
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 w-1.5 md:w-2 h-24 bg-cyan-accent z-10"></div>
            <div className="relative w-[180px] h-[250px] md:w-[250px] md:h-[350px] rounded-[150px] overflow-hidden">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_3-386x646.jpg"
                alt="A man wearing a cap looking sideways"
                fill
                className="object-cover object-center"
                unoptimized
              />
              <div className="absolute inset-0 bg-yellow-accent mix-blend-multiply rounded-[150px]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default PeopleNeedHelp;