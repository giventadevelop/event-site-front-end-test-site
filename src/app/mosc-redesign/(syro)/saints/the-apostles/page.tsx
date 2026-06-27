import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'The Apostles | Malankara Orthodox Syrian Church',
  description: 'The twelve apostles of Jesus Christ: their names, meanings, and tradition. Simon Peter, Andrew, James and John, Philip, Bartholomew, Thomas, James the Less, Matthew, Simon the Zealot, Judas Iscariot, and St. Jude.',
};

const currentSlug = '/mosc-redesign/saints/the-apostles';

export default async function TheApostlesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Apostles" breadcrumbFrom={breadcrumbFrom} />
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/the-apostles.jpg"
                    alt="The Apostles"
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none font-syro-primary text-syro-dark-gray">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Apostles
                  </h2>

                  <p className="leading-relaxed mb-6 text-justify">
                    The word Apostle (apostolos) designates a person with a particular mission. In the very strict biblical meaning it denotes only the twelve Apostles. In the Gospel narratives the Twelve Apostles are described as having been commissioned to preach the Gospel to the world, regardless of whether Jew or Gentile. Although the Apostles are portrayed as having been Galilean Jews, and 10 of their names are Aramaic and the rest are Greek. The Church considers St Paul in the same status because of his direct experience with Jesus Christ and zeal for the propagation of the Gospel. According to the tradition, all the Apostles, except St John, suffered martyrdom.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-10 mb-4">
                    The Twelve Apostles
                  </h3>
                  <p className="leading-relaxed mb-6 text-justify">
                    According to the list occurring in the Synoptic Gospels (Mk 3:13-19, Mt. 10:1-4, Lk. 6:12-16), the Twelve chosen by Jesus near the beginning of His ministry, those whom also He named Apostles, were:
                  </p>

                  <ul className="space-y-4 list-none pl-0">
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Simon:</strong> called Peter (Grk. petros, petra; Aram. kēf; Engl. rock) by Jesus, also known as Simon bar Jonah and Simon bar Jochanan (Aram.).
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Andrew:</strong> brother of Peter, a Bethsaida fisherman and disciple of John the Baptist, and also the First-Called Apostle.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">James and John:</strong> sons of Zebedee, called by Jesus Boanerges (an Aramaic name explained in Mk 3:17 as &ldquo;Sons of Thunder&rdquo;).
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Philip:</strong> from Bethsaida &ldquo;of Galilee&rdquo; (John 1:44, 12:21).
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Bartholomew:</strong> in Aramaic &ldquo;bar-Talemai&rdquo;, &ldquo;son of Talemai&rdquo; or from Ptolemais, sometimes identified with the Nathanael of John 1:45-1:51.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Thomas:</strong> also known as Judas Thomas Didymus – Aramaic T&apos;oma&apos; = twin, and Greek Didymous = twin.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">James, son of Alphaeus:</strong> commonly identified with James the Less. Sometimes also identified with James the Just.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Matthew:</strong> the tax collector, some identify with Levi son of Alphaeus.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Simon the Canaanite:</strong> called in Luke and Acts &ldquo;Simon the Zealot&rdquo;, some identify with Simeon of Jerusalem, which others dispute on the grounds that Simeon was described at the time of Jesus&apos; birth some thirty years before, as an old man not far from death.
                    </li>
                    <li className="leading-relaxed">
                      <strong className="text-syro-blue">Judas Iscariot:</strong> the name Iscariot may refer to the Judaean towns of Kerioth or to the sicarii (Jewish nationalist insurrectionists), or to Issachar. Also referred to (e.g. at Jn. 6:71 and 13:26) as &ldquo;Judas, the son of Simon&rdquo;. He was replaced as an apostle in Acts by Matthias.
                    </li>
                    <li className="leading-relaxed">
                      The identity of the other apostle of the twelve, traditionally called <strong className="text-syro-blue">St. Jude</strong>, varies between the Synoptic Gospels and also between ancient manuscripts of each gospel: Mark names him as Thaddaeus; different manuscripts of Matthew identify him as either Thaddeus or Lebbaeus.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Saints Categories
                </h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href === '/mosc-redesign/saints' ? link.href : `${link.href}?from=saints`}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === '/mosc-redesign/saints' ? 'hidden' : link.href === currentSlug
                          ? 'bg-syro-red text-white'
                          : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
