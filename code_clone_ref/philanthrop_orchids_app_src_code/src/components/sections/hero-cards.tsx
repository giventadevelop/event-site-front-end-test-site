import Link from 'next/link';

const HeroCards = () => {
  return (
    <section>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Card 1 */}
        <Link
          href="#"
          className="group relative bg-[var(--color-dark-background)] p-10 lg:p-12 min-h-[350px] flex flex-col justify-end overflow-hidden"
        >
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: "url('https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/back_overlay_18.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              opacity: 0.1,
            }}
          ></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-semibold text-white leading-tight">
              The long journey to end poverty begins with a child.
            </h4>
            <span className="mt-6 inline-block text-base font-medium text-[var(--color-yellow-accent)] border-b border-[var(--color-yellow-accent)] pb-0.5 transition-colors duration-300 group-hover:text-white group-hover:border-white">
              Donate
            </span>
          </div>
        </Link>
        
        {/* Card 2 */}
        <Link
          href="#"
          className="group relative p-10 lg:p-12 min-h-[350px] flex flex-col justify-end overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_4.jpg')" }}
          />
          <div className="absolute inset-0 bg-[var(--color-cyan-accent)]/70 transition-colors duration-300 group-hover:bg-[var(--color-cyan-accent)]/80"></div>
          <div className="relative z-10">
            <h4 className="text-2xl font-semibold text-white leading-tight">
              No One Children Can Thrive on an Empty Stomach.
            </h4>
            <span className="mt-6 inline-block text-base font-medium text-[var(--color-yellow-accent)] border-b border-[var(--color-yellow-accent)] pb-0.5 transition-colors duration-300 group-hover:text-white group-hover:border-white">
              Explore more
            </span>
          </div>
        </Link>
        
        {/* Card 3 */}
        <Link
          href="#"
          className="group relative min-h-[350px] flex items-center justify-center overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_5.jpg')" }}
          />
          <div className="absolute inset-0 bg-[var(--color-yellow-accent)]/80 transition-colors duration-300 group-hover:bg-[var(--color-yellow-accent)]/90"></div>
          <div className="relative z-10">
            <span className="text-7xl lg:text-8xl font-bold text-white uppercase [writing-mode:vertical-rl] rotate-180 tracking-widest [text-shadow:1px_1px_3px_rgba(0,0,0,0.2)]">
              Donate
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default HeroCards;