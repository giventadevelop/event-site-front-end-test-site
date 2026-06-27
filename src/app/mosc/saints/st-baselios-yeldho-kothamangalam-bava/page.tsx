import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'St. Baselios Yeldho (Kothamangalam Bava)',
  description: 'St Baselios Yeldho was born in a village called kooded (now known as Karakosh) near Mosul in Iraq.',
};

const currentSlug = '/mosc/saints/st-baselios-yeldho-kothamangalam-bava';

export default async function StBaseliosYeldhoPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="St. Baselios Yeldho (Kothamangalam Bava)" breadcrumbFrom={breadcrumbFrom} />
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/st-baselios-yeldho-kothamangalam-bava.jpg"
                    alt="St. Baselios Yeldho (Kothamangalam Bava)"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-syro-primary text-syro-dark-gray leading-relaxed space-y-4">
                  <p>
                    St Baselios Yeldho was born in a village called kooded (now known as Karakosh) near Mosul in Iraq where Marth Smooni and her 7 children suffered martyrdom. At a very young age he joined the Mar Bahanan Monastery and become a monk. In 1678 he was consecrated Maphriyana by the Patriarch of Antioch Moran Mar Ignatius Abdul Masiha I. In 1685 at the age of 92, the holy father started the difficult mission to India at the request of Mar Thoma II of Malankara who informed the Patriarchate about the unpleasant situation of the Church here.
                  </p>
                  <p>
                    The saintly Maphriyana was accompanied by Mar Ivanios Hidayathulla, his brother and two monks but only three of them is believed to have reached Malankara. As the saint reached the church premises, the church bells began to toll. People living in the neighbourhood rushed to the church to find out what the commotion was about. And that was on &lsquo;Kanni 11th&rsquo; in the Malayalam calendar (end of September), AD 1685. The Saint entered the church and sat on the steps of the &lsquo;Madbaha&rsquo;. There was a young deacon who was fluent in Syriac. When he realized that a Episcopa had stayed behind at Kozhipally, he and some members of the congregation set out for the place. They took a kerchief from the Saint for identification. When the Episcopa saw the approaching crowd he was afraid. He thought that they had killed Bava and were now about to get at him. He therefore refused to come down from the tree. The deacon however offered him the sign of peace and spoke Syriac. He then came down from the tree and went with the people to the church.
                  </p>
                  <p>
                    On Kanni 13, the church used to celebrate its foundation day. On the 12th evening the Vicar sought the Saint&rsquo;s permission to hoist the flag. The Saint replied that the festival of the Holy Cross should be celebrated on the 14th and not on the 13th. When it was explained to the Saint that what they were celebrating was not the festival of the Holy Cross but the anniversary of the founding of the parish, the Saint permitted them to go ahead but reminded them about the importance of the festival of the Holy Cross.
                  </p>
                  <p>
                    On the next day, on the feast of the Holy Cross, (&lsquo;Kanni 14&rsquo; as per the Malayalam calendar), Episcopa Mar Ivanios Hidayathulla was consecrated as Metropolitan after the Qurbana by the saintly Mar Baselios Yeldho Bava. (Mar Ivanios, who was consecrated by Mar Yeldho, carried on apostolic work for eight years. He passed away in 1693 and was buried at the Mar Thoman Church, Mulanthuruthy). Because of the tedious journey and the old age, Bava was totally exhausted by then. Three days after he became seriously ill. On Kanni 17th, he received the last sacraments of anointment with oil and extreme unction. All the while he was lying inside the church. Two days after (on Kanni 19, which is September 29) in the afternoon, the saintly father left his mortal self for his heavenly home at the age of 92. That was a Saturday. As he was sinking, the congregation assembled inside the church and were offering prayers. The Saint told them that he was about to die and when his spirit leaves his body, there would be a sign on the Cross situated on the western side of the Church. And the huge granite Cross miraculously lit up at the time of the Saint&rsquo;s demise. The Holy Father&rsquo;s mortal remains was entombed on the next day (Kanni 20) in the western side of the Madbaha of the church. The two weeks of sojourn of the Maphriyana at Kothamangalam electrified the Marthoma Christians all over Malankara and the mission undertaken by the saint was fulfilled to a large extent by his faithful associate, Metropolitan Mar Ivanios Hidayathulla.
                  </p>
                  <p>
                    In 1947 Mar Baselios Yeldho of blessed memory was declared a saint by the then Catholicos of the church, His Holiness Baselius Geevarghese II.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Saints Categories</h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href === '/mosc/saints' ? link.href : `${link.href}?from=saints`}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === '/mosc/saints' ? 'hidden' : link.href === currentSlug
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
