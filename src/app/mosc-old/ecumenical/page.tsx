import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Ecumenical',
  description:
    'Department of Ecumenical Relations of the Malankara Orthodox Syrian Church. Fraternal relations, Orthodox Churches, Catholic dialogue, and ecumenical ventures.',
};

const ECUMENICAL_ARTICLES = [
  {
    title: 'Department of Ecumenical Relations',
    excerpt:
      'The Department of Ecumenical Relations caters onto the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and...',
    image: '/images/mosc/ecumenical/Untitled-1-300x176.jpg',
    href: '/mosc-old/ecumenical/world-council-of-churches',
  },
  {
    title: 'The Relation between Orthodox Churches',
    excerpt:
      'The Malankara Orthodox Church has always tried to cooperate with the communities which encircled her absorbing the imitable things from them. From the very inception, she also cooperated with the...',
    image: '/images/mosc/ecumenical/all.jpg',
    href: '/mosc-old/ecumenical/orthodox-churches',
  },
  {
    title: 'Relationship with the Catholic Churches',
    excerpt:
      'Pro Oriente, the Catholic organization was the inspiration behind the initiation of unofficial dialogues with the Catholic Church. The dialogues began in 1971 helped to correct many misunderstanding in both...',
    image: '/images/mosc/ecumenical/rome.jpg',
    href: '/mosc-old/ecumenical/catholic-church',
  },
  {
    title: 'In Egypt with the Message of Fraternity',
    excerpt:
      "His Holiness Baselios Marthoma Paulose II attended the enthronement service of Pope Tawadros II, the Supreme head of the Coptic Orthodox Church at St. Mark's Cathedral, Cairo on 18th March,...",
    image: '/images/mosc/ecumenical/eg.jpg',
    href: '/mosc-old/ecumenical/in-egypt-with-the-message-of-fraternity',
  },
  {
    title: 'The Shepherd of the Indian Church in Ethiopia',
    excerpt:
      'Abune Mathias, the 63rd Ichege of the See of St. Tekle Haymanot and the 6th Patriarch Catholicos of Ethiopia was enthroned on 3rd March 2013 amidst prayers of millions of...',
    image: '/images/mosc/ecumenical/et.jpg',
    href: '/mosc-old/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia',
  },
  {
    title: 'The Confluence of Love in Vatican',
    excerpt:
      'The epoch making meeting between His Holiness Baselios Marthoma Paulose II, the Supreme Head of the Malankara Orthodox Church and His Holiness Pope Francis, the Supreme Head of the Catholic...',
    image: '/images/mosc/ecumenical/rome.jpg',
    href: '/mosc-old/ecumenical/the-confluence-of-love-in-vatican',
  },
  {
    title: 'The Fraternity at Vienna',
    excerpt:
      'His Holiness the Catholicos visited Vienna on 3rd September 2013 as the special invitee of Pro-Oriente. Pro-Oriente is the fellowship of all the Churches which use Syriac as the sacramental...',
    image: '/images/mosc/ecumenical/vienna.jpg',
    href: '/mosc-old/ecumenical/the-fraternity-at-vienna',
  },
  {
    title:
      'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican',
    excerpt:
      'Your Holiness, most Venerable Brother in Christ, Praising the Triune God, let me humbly greet Your Holiness in the name of the Bishops. Clergy and the Faithful of the Malankara...',
    image: '/images/mosc/ecumenical/rm.jpg',
    href: '/mosc-old/ecumenical/catholicos-speech-vatican',
  },
  {
    title:
      'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican',
    excerpt:
      'Your Holiness , It is a joy for me to meet Your Holiness and the distinguished delegation of the Malankara Orthodox Syrian Church. Through you, I greet a Church that...',
    image: '/images/mosc/ecumenical/rm1.jpg',
    href: '/mosc-old/ecumenical/pope-francis-speech-vatican',
  },
  {
    title: 'The Successor of St. Thomas in Europe',
    excerpt:
      'A grand reception was accorded to His Holiness Baselios Marthoma Paulose II by the U. K. Europe Africa Diocese and the Lambeth Palace of the Anglican Church jointly on 9th...',
    image: null,
    href: '/mosc-old/ecumenical/the-successor-of-st-thomas-in-europe',
  },
  {
    title: 'Co-operation with the Protestant Churches',
    excerpt:
      'It is a fact that there is no healthy and lively talks between the Orthodox and CSI, Marthoma Churches. However, the Malankara Church has strong relations and cooperation with these...',
    image: null,
    href: '/mosc-old/ecumenical/co-operation-with-the-protestant-churches',
  },
  {
    title: 'Ecumenical ventures in modern times',
    excerpt:
      'His Holiness Baselios Marthoma Paulose II is also very keen to encourage ecumenical relations. Various ecclesiastical visits during a short span of time have paid rich dividends. A delegation led...',
    image: null,
    href: '/mosc-old/ecumenical/ecumenical-ventures-in-modern-times',
  },
];

const EcumenicalPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section - hidden per design */}
      <section className="hidden relative bg-gradient-to-br from-background to-muted min-h-[320px] flex items-center py-16" aria-hidden>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:gap-12">
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
                Ecumenical
              </h1>
              <p className="font-body text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Department of Ecumenical Relations — fraternal relations of the Church
                and engagement with Christian communities worldwide.
              </p>
            </div>
            <div className="flex-shrink-0 mt-6 md:mt-0 flex justify-center">
              <div className="relative w-full max-w-sm h-auto rounded-lg overflow-hidden sacred-shadow-lg border border-border/30 flex items-center justify-center bg-muted/20">
                <Image
                  src="/images/mosc/ecumenical/Untitled-1-300x176.jpg"
                  alt="Ecumenical relations"
                  width={300}
                  height={176}
                  className="w-full h-auto object-contain"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  sizes="(max-width: 768px) 100vw, 384px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department of Ecumenical Relations intro - hidden per design */}
      <section className="hidden py-12 bg-card border-t border-border/20" aria-hidden>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Department of Ecumenical Relations
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Department of Ecumenical Relations caters to the fraternal relations of the Church.
              The Church, being a founding member of the World Council of Churches, extends its warmth
              and cooperation to Christian communities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Ecumenical Relations &amp; Dialogue
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore our church&apos;s engagement with Orthodox Churches, Catholic dialogue,
              Protestant cooperation, and ecumenical ventures in modern times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ECUMENICAL_ARTICLES.map((article, index) => (
              <Link
                key={index}
                href={article.href}
                className="bg-card rounded-lg sacred-shadow p-0 overflow-hidden hover:sacred-shadow-lg reverent-transition group flex flex-col"
              >
                {/* Image: centered, fully visible, no crop/overflow/overlap */}
                <div className="relative w-full h-48 bg-muted/50 overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt=""
                      fill
                      className="object-contain object-center group-hover:scale-105 reverent-transition"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                      <span
                        className="text-4xl text-primary/40"
                        role="img"
                        aria-hidden
                      >
                        ⛪
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3 group-hover:text-primary reverent-transition line-clamp-3">
                    {article.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 mt-4 font-body text-primary font-medium text-sm group-hover:gap-3 reverent-transition">
                    Read More
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick links / Navigation to sub-sections */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              Explore Ecumenical Topics
            </h2>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto">
              Navigate to specific areas of our ecumenical relations and dialogue.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/mosc-old/ecumenical/world-council-of-churches"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>🌍</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                World Council of Churches
              </span>
            </Link>
            <Link
              href="/mosc-old/ecumenical/orthodox-churches"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>⛪</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                Orthodox Churches
              </span>
            </Link>
            <Link
              href="/mosc-old/ecumenical/catholic-church"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>✟</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                Catholic Church
              </span>
            </Link>
            <Link
              href="/mosc-old/ecumenical/protestant-churches"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>📖</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                Protestant Churches
              </span>
            </Link>
            <Link
              href="/mosc-old/ecumenical/oriental-orthodox"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>🤝</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                Oriental Orthodox
              </span>
            </Link>
            <Link
              href="/mosc-old/ecumenical/interfaith-dialogue"
              className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border/30 hover:border-primary/40 reverent-transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                <span className="text-lg" role="img" aria-hidden>🕊️</span>
              </div>
              <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                Interfaith Dialogue
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EcumenicalPage;
