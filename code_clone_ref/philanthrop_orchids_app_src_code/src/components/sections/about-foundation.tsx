import { ArrowUpRight } from 'lucide-react';

const AboutFoundation = () => {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-start gap-16 xl:gap-24">
          {/* Left Column: Stats */}
          <div className="w-full lg:w-2/5 flex flex-col gap-y-12 shrink-0">
            <div>
              <h2
                className="text-[120px] font-bold leading-none text-transparent"
                style={{ WebkitTextStroke: '1px var(--color-primary)' }}
              >
                10k
              </h2>
              <p className="mt-2 text-foreground font-medium text-lg tracking-wide">
                People helped
              </p>
            </div>
            <div>
              <h2
                className="text-[120px] font-bold leading-none text-transparent"
                style={{ WebkitTextStroke: '1px var(--color-destructive)' }}
              >
                200+
              </h2>
              <p className="mt-2 text-foreground font-medium text-lg tracking-wide">
                Closed projects
              </p>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="w-full lg:w-3/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-[7px] w-[7px] block rounded-full bg-muted-foreground"></span>
              <span className="h-[7px] w-[7px] block rounded-full bg-muted-foreground"></span>
              <span className="ml-1 text-sm font-medium text-muted-foreground tracking-widest">
                About foundation
              </span>
            </div>
            <h3 className="text-4xl font-bold text-foreground mb-8 leading-tight">
              Hard times for the world &amp; opportunities to help people in need
            </h3>
            <p className="text-lg text-foreground font-semibold mb-6">
              Halosaur duckbilled barracudina, goosefish gar pleco, chum salmon armoured catfish gudgeon sawfish whitefish orbicular batfish
            </p>
            <p className="text-base text-muted-foreground mb-10">
              Mummichog paradise fish! Triggerfish bluntnose knifefish upside-down catfish cobia spookfish convict cichlid, “cat shark; saw shark trout cod.
            </p>
            <a
              href="https://demo.artureanec.com/themes/philantrop/about-us/"
              className="inline-flex items-center gap-3 rounded-full border border-[#F9C23C] py-4 px-8 text-base font-medium text-foreground transition-colors hover:bg-[#F9C23C] hover:text-white"
            >
              <span>Explore more</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFoundation;