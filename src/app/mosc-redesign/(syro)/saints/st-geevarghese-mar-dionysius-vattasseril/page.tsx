import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';
import QuickLinks from '../../components/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'St. Geevarghese Mar Dionysius Vattasseril',
  description: 'St. Geevarghese Mar Dionysius Vattasseril, Malankara Metropolitan, was a bright light for the Malankara Orthodox Syrian Church.',
};

const currentSlug = '/mosc-redesign/saints/st-geevarghese-mar-dionysius-vattasseril';

export default async function StGeevargheseMarDionysiusPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'saints' ? 'saints' : 'home';
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="St. Geevarghese Mar Dionysius Vattasseril" breadcrumbFrom={breadcrumbFrom} />
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/saints/st-geevarghese-mar-dionysius-vattasseril.jpg"
                    alt="St. Geevarghese Mar Dionysius Vattasseril"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-syro-primary text-syro-dark-gray leading-relaxed space-y-4">
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue">Introduction</h2>
                  <p>
                    St. Geevarghese Mar Dionysius Vattasseril, Malankara Metropolitan, was a bright light for the Malankara Orthodox Syrian Church that illumined during her dark and tumultuous times and possessed the vision to bring the Church triumphantly from the bonds of foreign oppression. Thirumeni dedicated his entire life to secure the freedom and welfare of the Holy Church. His Grace faced many troubles and obstacles as well as received constant physical and verbal abuse via threats and physical attacks as he courageously led the Church to her independence. He confronted the dangers and obstacles directly responding with vigor, strength and remarkable conviction and confidence in God&rsquo;s justice and plan, which was a product of his continual fasting and prayer. God protected Thirumeni throughout his life whether in Kerala or abroad as he sought the freedom of the Church from foreign powers. His great triumph lay in the ability to unite the entire Church, both the priests and laymen to follow his lead. He was incredibly gifted in many fields, a multifarious genius. He was a spiritual leader, a theological educator, scholar of languages, literature and traditions. He was a dignified, valorous and noble personality with a remarkable commanding power.
                  </p>
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue">Early Life</h2>
                  <p>
                    St. Dionysius was born to his parents, Joseph Vattasseril of Mallappally and Eliamma Kolathu Kalathil of Kurichy on 31st October 1858. Following his elementary education at C. M. S. Middle School in Mallappally he completed his high school education from C. M. S. High School, Kottayam. In 1876, while still a high school student, he was ordained as a sub deacon by H. H. Moran Mar Pathrose Patriarch.
                  </p>
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue">Life in the Church</h2>
                  <p>
                    Dn. Geevarghese studied at the Orthodox Theological Seminary (Old Seminary or Pazhaya Seminary), Kottayam for four years thereby undergoing his theological training. Dn. Geevarghese soon became a great Syriac scholar under the careful tutelage of St. Gregorios of Parumala, who taught him at Seminary. In 1879 Dn. Geevarghese was ordained as a full deacon and in 1880 he was ordained as a priest by St. Gregorios. By 1880, Fr. Geevarghese had become an authority in the Syriac, Church History, Faith and Doctrine, the Church Fathers, and Theology. In recognition of his incredible expertise in Syriac and theology he was designated as Malankara Malpan. He spent his spare time reading, studying, and thinking which translated to his many renowned writings such as &ldquo;Doctrines of the Church&rdquo;. He also used his scholarship to edit and publish the order of Church worship to be used by the ordinary faithful for meaningful participation in worship. He was appointed as Principal of M. D. Seminary, Kottayam as he was both a great scholar and administrator. In 1903, he was blessed as a Ramban (monk). He also served as the Manager of Parumala Seminary. In 1908 he was consecrated as H. G. Geevarghese Mar Dionysius Metropolitan and served as the Assistant Malankara Metropolitan. The next year he became the Malankara Metropolitan and served and led the Church in that capacity until his departure from this life in 1934 when he and the Church triumphed in establishing the official constitution of the Malankara Orthodox Syrian Church.
                  </p>
                  <h2 className="font-syro-display font-semibold text-xl text-syro-blue">Legacy</h2>
                  <p>
                    H. H. Moran Mar Baselios Geevarghese II Catholicos of blessed memory remarked in the speech at the burial of Vattasseril Thirumeni, &ldquo;When we look at the highest solemn position held by Vattasseril Thirumeni and his deep and firm faith in God, he seemed similar to Moses who led the sons of Abraham from the captive land of Egypt to the promised land of freedom and happiness. There is no doubt about it. Moses had spent his entire life for the freedom of his people but he could not enter the Promised Land. He was only able to see the Promised Land from a distance. Likewise the Moses of the Malankara Church has also watched the freedom of his Church from a distance&rdquo;. Vattasseril Thirumeni was a good orator who was well aware of the importance of the vitality and moral persuasiveness of words when delivering the speeches to the faithful. Spiritually, he was transformed by Christ and bore no scars from sin. His humility and withdrawal from the praise of this world kept many from seeing the incredibly pious and faithful life that Thirumeni lived. In addition to not publicizing his own spiritual advancement he also avoided spiritual hypocrisy and arrogance throughout his life. Prayers and fasting were the pillars that were Vattasseril Thirumeni&rsquo;s spiritual foundation. He faced all the challenges with the power he had gained through his valued spiritual life. In addition to the liturgical hours of prayer, Thirumeni spent much time in private prayers and silent meditations behind closed doors and away from the attention of people. In spite of his busy schedule, he was also able to focus on three to four lessons from the Holy Bible everyday. Despite Vattasseril Thirumeni&rsquo;s literal application of Christ&rsquo;s instruction to pray in private and not for others to see, many recognized that His Grace was a living saint amongst them.
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
                      href={link.href === '/mosc-redesign/saints' ? link.href : `${link.href}?from=saints`}
                      className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 ${
                        link.href === '/mosc-redesign/saints' ? 'hidden' : link.href === currentSlug ? 'bg-syro-red text-white' : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
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
