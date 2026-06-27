import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Holy Synod',
  description:
    'Members of the Holy Synod of the Malankara Orthodox Syrian Church — bishops and the Catholicos as the highest governing body.',
};

const IMAGE_BASE = '/mosc/assets/images/mosc_images/Holy Synod';

const synodMembers: Array<{
  title: string;
  excerpt: string;
  image: string;
  internalHref?: string;
}> = [
  {
    title: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara',
    excerpt:
      'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October...',
    image: `${IMAGE_BASE}/Baselios_Marthoma_Mathews_III.jpg`,
    internalHref: '/mosc/holy-synod/his-holiness-baselios-marthoma-mathews-iii',
  },
  {
    title: 'H. G. Dr. Thomas Mar Athanasius Metropolitan',
    excerpt:
      'His Grace was born on 28 June 1952 at Arikuzha, Thodupuzha, to Rev. Fr Yohannan Puttanil and Mrs Mariam. He did his schooling at Government UPS School Arikuzha and NSS...',
    image: `${IMAGE_BASE}/Thomas_Mar_Athanasius.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-dr-thomas-mar-athanasius',
  },
  {
    title: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan',
    excerpt:
      'His Grace was born at Elakkaranadu, a typical village in the Ernakulam District of Kerala, to a social worker Mr Markose and Mrs Saramma, Murimakkil. He had his primary education...',
    image: `${IMAGE_BASE}/Dr_Yuhanon.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-yuhanon-mor-meletius-metropolitan',
  },
  {
    title: 'H.G. Kuriakose Mar Clemis Metropolitan',
    excerpt:
      'His Grace was born in 1936 at Nellikkal, Koipram Village in Thiruvalla Taluk as the second son to Perumethmannil Mr PK Mathai and Mrs Sosamma. He has one brother and...',
    image: `${IMAGE_BASE}/Kuriakose_Mar_Clemis.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-kuriakose-mar-clemis',
  },
  {
    title: 'H.G. Geevarghese Mar Coorilos Metropolitan',
    excerpt:
      'His Grace was born on 7 October 1949 at Kollad, near Kottayam, to Mr PK Kurian and Mrs Mary Kurian of the Puliyeril family. After his schooling, young George had...',
    image: `${IMAGE_BASE}/H_G_Geevarghese.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-geevarghese-mar-coorilose-metropolitan',
  },
  {
    title: 'H.G. Zachariah Mar Nicholovos Metropolitan',
    excerpt:
      'His Grace, Metropolitan Zachariah Mar Nicholovos was born on August 13, 1959 to the famous Poothicote family in Mepral. His boyhood name was Cheriyachen, and was the fourth of five...',
    image: `${IMAGE_BASE}/H_G_Zachariah.png`,
    internalHref: '/mosc/holy-synod/h-g-zachariah-mar-nicholovos-metropolitan',
  },
  {
    title: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan',
    excerpt:
      'His Grace was born on 15 August 1949 to Mr T. O Cherian Mrs Kunjelyamma Cherian of Aruvidan Pallikal Family, Kallupara. He did his high-schooling at MGD High School, Puthussery...',
    image: `${IMAGE_BASE}/Dr_Yakoob.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-jacob-mar-irenios',
  },
  {
    title: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan',
    excerpt:
      'His Grace was born on 10 February 1948 to Mr CM John and Mrs Aleyamma John, Vadakethazhethil, Kanjickal. He did schooling at St Stephen\'s High School, Pathanapuram. He persued his...',
    image: `${IMAGE_BASE}/Dr_Gabriel.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-dr-gabriel-mar-gregorios',
  },
  {
    title: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
    excerpt:
      'His Grace was born in 1954 to Mr KV Yohannan and Mrs Aleyamma Yohannan, Mannil Puthen Purayil, Kottoor, Thiruvalla. Varghese had his early education in local schools at Kottoor, and...',
    image: `${IMAGE_BASE}/Dr_Yuhanon_Chrisostomos.jpg`,
    internalHref: '/mosc/holy-synod/his-grace-dr-yoohanon-mar-chrysostamus',
  },
  {
    title: 'H.G. Yuhanon Mar Policarpos Metropolitan',
    excerpt:
      'His Grace was born on 30th March 1955 as the son of Mr.P.V.Zachariah and Mrs.Annamma Zachariah of Panniyankara Parakunnil family in Vadakkanchery, Palakkad. His Grace is a member of Mar.Gregorios...',
    image: `${IMAGE_BASE}/H_G_Yuhanon.jpg`,
    internalHref: '/mosc/holy-synod/h-g-youhanon-mar-polycarpus-metropolitan',
  },
  {
    title: 'H. G. Mathews Mar Theodosius Metropolitan',
    excerpt:
      'His Grace was born on 15th September 1955 as the eldest son of Mr.P.M.George and Mrs. Aleyamma George of Punchayil family in Pandankary, Edathua, Alapuzha. His Grace is a member...',
    image: `${IMAGE_BASE}/H_G_Mathews.jpg`,
    internalHref: '/mosc/holy-synod/h-g-mathews-mar-theodosius',
  },
  {
    title: 'H.G. Dr. Joseph Mar Dionysius Metropolitan',
    excerpt:
      'His Grace was born on 15th June 1956 as the son of Mr. T. V. Mathai and Mrs. Aleyamma Mathai of Thekkil Kandathil family in Valanjavattom, Thiruvalla and a member...',
    image: `${IMAGE_BASE}/Dr_Joseph.jpg`,
    internalHref: '/mosc/holy-synod/h-g-joseph-mar-dionysius-metropolitan',
  },
  {
    title: 'H. G. Abraham Mar Epiphanios Metropolitan',
    excerpt:
      'His Grace was born on 17th September 1960 as the son of Mr. V. A. Oommen and Mrs. Gracy Oommen. His Grace is a member of St. Mary\'s Cathedral, Malaysia....',
    image: `${IMAGE_BASE}/H_G_Abraham.jpg`,
    internalHref: '/mosc/holy-synod/h-g-abraham-mar-epiphanios',
  },
  {
    title: 'H. G. Dr. Mathews Mar Thimothios Metropolitan',
    excerpt:
      'His Grace was born on 3rd May 1963 as the eldest son of Mr. P.J. Baby and Mrs. Thankamma Baby of Painuvilla Puthenveettil family. His Grace is a member of...',
    image: `${IMAGE_BASE}/Dr_Mathews.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-mathews-mar-thimothios-metropolitan',
  },
  {
    title: 'H. G. Alexios Mar Eusebius Metropolitan',
    excerpt:
      'His Grace Alexios Mar Eusebius, formerly Rev. Fr. Alex Daniel is a member of St. George Orthodox Church, Puthoor of Kollam Diocese. Thirumeni hails from Vattakkattu family, Puthoor. His...',
    image: `${IMAGE_BASE}/H_G_Alexios.jpg`,
    internalHref: '/mosc/holy-synod/h-g-alexios-mar-eusebius-metropolitan',
  },
  {
    title: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan',
    excerpt:
      'His Grace was born in Kallarackal Kaleelil family on 28 May 1964 as the son of Mr. P. T. Mathunny Panicker & Mrs. Kunjamma Panicker. He is a member of...',
    image: `${IMAGE_BASE}/Dr_Yuhanon_Diascoros.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-yuhanon-mar-dioscoros-metropolitan',
  },
  {
    title: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
    excerpt:
      'His Grace was Born on 18-12-1952 as the son of Palamoottil Mathews and Mercy. Home parish is St. Thomas Orthodox Cathedral, Kollam Diocese. After completing the formal education, His Grace...',
    image: `${IMAGE_BASE}/Dr_Youhanon_Demetrios.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-yuhanon-mar-demetrius-metropolitan',
  },
  {
    title: 'H.G. Dr. Yuhanon Mar Thevodoros Metropolitan',
    excerpt:
      'His Grace was born on 10-02-1953 as the son of hoppil Thekkathil George and Thankamma Mavelikkara Diocese. His Grace is a member of Mavelikkara Vazhuvady Mar Baselios Church.. After taking his...',
    image: `${IMAGE_BASE}/Dr_Yuhanon_Thevodoros.jpg`,
    internalHref: '/mosc/holy-synod/h-g-yuhanon-mar-theodorus-metropolitan',
  },
  {
    title: 'H.G. Yakob Mar Elias Metropolitan',
    excerpt:
      'His Grace was born on 24-02-1953 as the son of Chackaleth Viruthiyath Kizhakkethil Mathai and Mariamma. His Grace is a member of St. Elias Orthodox Church, Budhanoor, Chengannoor Diocese. After taking...',
    image: `${IMAGE_BASE}/H_G_Yakob.jpg`,
    internalHref: '/mosc/holy-synod/h-g-yakoob-mar-elias-metropolitan',
  },
  {
    title: 'H. G. Dr. Joshua Mar Nicodimos Metropolitan',
    excerpt:
      'His Grace was Born on 8th October 1962 as the youngest son of Mr.Philipose Mathai and Mrs.Thankamma Mathai, Sankarathil Nediyavilayil, Kurampala, Pandalam. Home parish is St.Thomas Orthodox Valiyapally Kurampala, Pandalam,...',
    image: `${IMAGE_BASE}/Dr_Joshua.jpg`,
    internalHref: '/mosc/holy-synod/h-g-joshua-mar-nicodemus-metropolitan',
  },
  {
    title: 'H.G. Dr. Zacharias Mar Aprem Metropolitan',
    excerpt:
      'His Grace was born as the son of E.K. Kuriakose and Sossama Kuriakose. His Grace is a member of St. George Valiyapally, Chungathara , Malabar Diocese. After taking his Bachelors...',
    image: `${IMAGE_BASE}/Dr_Zakariah.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-zacharias-mar-aprem-metropolitan',
  },
  {
    title: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan',
    excerpt:
      'His Grace Dr. Geevarghese Mar Yulios, Bishop and Metropolitan in the Malankara Orthodox Syrian Church, was born on May 17, 1967, to Late Mr. P. V. Pavu and Mrs. K....',
    image: `${IMAGE_BASE}/Dr_Geevarghese_Yulios.jpg`,
    internalHref: '/mosc/holy-synod/h-g-dr-geevarghese-mar-julius-metropolitan',
  },
  {
    title: 'H.G. Dr. Abraham Mar Seraphim Metropolitan',
    excerpt:
      'His Grace was born on 28 December 1969 as the son of Mr. V. A. Mathews and Mrs. Annie Mathews,Vaduthala Puthenveedu, Mathoor. He is a member of St. George Orthodox...',
    image: `${IMAGE_BASE}/Dr_Abraham_Ceraphim.png`,
    internalHref: '/mosc/holy-synod/h-g-dr-abraham-mar-seraphim-metropolitan',
  },
  {
    title: 'H.G. Abraham Mar Stephanos Metropolitan',
    excerpt:
      'Born to Late Mr. K. A. Thomas and Mrs. Annamma, Kadakkamannil House, Mylapra in Pathanamthitta on June 11, His Grace belongs to the parish of St. George Orthodox Church (Valiyapalli),...',
    image: `${IMAGE_BASE}/Dr_Abraham_Stephanos.png`,
    internalHref: '/mosc/holy-synod/h-g-abraham-mar-stephanos-metropolitan',
  },
  {
    title: 'H.G. Dr. Thomas Mar Ivanios Metropolitan',
    excerpt:
      'Born to of Late Mr. Thomas Chacko and Mrs. Annamma , in Pulluparampil house, Aleppey on 13 th December 1969, His Grace Thomas Mar Ivanios Metropolitan belongs to the parish...',
    image: `${IMAGE_BASE}/Dr_Thomas_Ivanios.png`,
    internalHref: '/mosc/holy-synod/h-g-thomas-mar-ivanios-metropolitan',
  },
  {
    title: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan',
    excerpt:
      'Born as the son of Mr. P. C. Joshua and Mrs. P. C. Marykutty in Kizhakkemannil House, Chenneerkkara, Thumpamon on 8 th August 1971, His Grace belongs to the parish...',
    image: `${IMAGE_BASE}/Dr_Geevarghese_Thiophilos.png`,
    internalHref: '/mosc/holy-synod/hg-dr-geevarghese-mar-theophilos-metropolitan',
  },
  {
    title: 'H.G. Geevarghese Mar Philoxenos Metropolitan',
    excerpt:
      'H. G. Geevarghese Mar Philoxenos Metropolitan was born in Maleth house, Arattupuzha as the son of Mr. M. G. George and Mrs. Accamma on 30 th May 1972 . His...',
    image: `${IMAGE_BASE}/Geevarghese-Mar-Philaxenos.png`,
    internalHref: '/mosc/holy-synod/h-g-geevarghese-mar-philaxenos-metropolitan',
  },
  {
    title: 'H.G. Geevarghese Mar Pachomios Metropolitan',
    excerpt:
      'Born in Kochuparambil house as the son of Mr. K.M. Elias and Lt. Mrs. Omana on 6 th March 1973 , H. G. Geevarghese Mar Pachomios Metropolitan belongs to the...',
    image: `${IMAGE_BASE}/Geevarghese-Mar-Pachomios.jpg`,
    internalHref: '/mosc/holy-synod/h-g-geevarghese-mar-pachomios-metropolitan',
  },
  {
    title: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan',
    excerpt:
      'Born to Mr. Kochupappi and Mrs. Ammini in Kattuparambil House on April 10, 1973, His Grace belongs to the parish of St. Mary\'s Orthodox Church, Muttam under Mavelikkara diocese. His...',
    image: `${IMAGE_BASE}/Geevarghese-Mar-Barnabas.png`,
    internalHref: '/mosc/holy-synod/h-g-dr-geevarghese-mar-barnabas-metropolitan',
  },
  {
    title: 'H.G. Zachariah Mar Severios Metropolitan',
    excerpt:
      'Born in Chirathilatt House as the son of Very Rev. C. John Cor- Episcopa and Mrs. Lissy on 19 th August, 1978, His Grace belongs to the parish of St....',
    image: `${IMAGE_BASE}/Zakeriah_Mar_severios.jpg`,
    internalHref: '/mosc/holy-synod/h-g-zacharia-mar-severios-metropolitan',
  },
];

const BANNER_DESCRIPTION =
  'The Holy Synod consists of all the bishops of the Malankara Orthodox Syrian Church, serving as the highest governing body under the leadership of the Catholicos.';

const HolySynodPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Holy Synod"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      {/* Content - matches HTML structure and style */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (HTML .synod-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Members of the Holy Synod
          </h3>

          {/* Cards grid (HTML .synod-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {synodMembers.map((member) => (
              <div
                key={member.title}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="mb-5 flex justify-center pt-8">
                  <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                    <Image
                      src={member.image}
                      alt={member.title}
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 280px"
                    />
                  </div>
                </div>
                <div className="p-8 pt-0 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {member.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                    {member.excerpt}
                  </p>
                  {member.internalHref ? (
                    <Link
                      href={member.internalHref}
                      className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  ) : (
                    <a
                      href="https://mosc.in/holysynod/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default HolySynodPage;
