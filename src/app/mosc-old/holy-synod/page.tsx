'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const HolySynodPage = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we should scroll to the Catholicos section
    const hash = window.location.hash;
    const shouldScroll = hash === '#catholicos-section' || searchParams?.get('scroll') === 'catholicos';
    
    if (shouldScroll) {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        const section = document.getElementById('catholicos-section');
        if (section) {
          section.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [searchParams]);
  const synodMembers = [
    {
      name: 'H.H. Baselios Marthoma Mathews III',
      href: '/mosc-old/holy-synod/his-holiness-baselios-marthoma-mathews-iii',
      title: 'The Ninth Catholicos of the East in Malankara',
      image: '/images/holy-synod/hh-scaled.jpg',
      description: 'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October...',
      special: true
    },
    {
      name: 'H. G. Dr. Thomas Mar Athanasius Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-dr-thomas-mar-athanasius',
      title: 'Metropolitan',
      image: '/images/holy-synod/ath.jpg',
      description: 'His Grace was born on 28 June 1952 at Arikuzha, Thodupuzha, to Rev. Fr Yohannan Puttanil and Mrs Mariam. He did his schooling at Government UPS School Arikuzha and NSS...'
    },
    {
      name: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-yuhanon-mor-meletius-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/milithios.jpg',
      description: 'His Grace was born at Elakkaranadu, a typical village in the Ernakulam District of Kerala, to a social worker Mr Markose and Mrs Saramma, Murimakkil. He had his primary education...'
    },
    {
      name: 'H.G. Kuriakose Mar Clemis Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-kuriakose-mar-clemis',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-clemis.jpg',
      description: 'His Grace was born in 1936 at Nellikkal, Koipram Village in Thiruvalla Taluk as the second son to Perumethmannil Mr PK Mathai and Mrs Sosamma. He has one brother and...'
    },
    {
      name: 'H.G.Geevarghese Mar Coorilos Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-geevarghese-mar-coorilose-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/coor.jpg',
      description: 'His Grace was born on 7 October 1949 at Kollad, near Kottayam, to Mr PK Kurian and Mrs Mary Kurian of the Puliyeril family. After his schooling, young George had...'
    },
    {
      name: 'H.G. Zachariah Mar Nicholovos Metropolitan',
      href: '/mosc-old/holy-synod/h-g-zachariah-mar-nicholovos-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/nico.png',
      description: 'His Grace, Metropolitan Zachariah Mar Nicholovos was born on August 13, 1959 to the famous Poothicote family in Mepral. His boyhood name was Cheriyachen, and was the fourth of five...'
    },
    {
      name: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-jacob-mar-irenios',
      title: 'Metropolitan',
      image: '/images/holy-synod/irne.jpg',
      description: 'His Grace was born on 15 August 1949 to Mr T. O Cherian Mrs Kunjelyamma Cherian of Aruvidan Pallikal Family, Kallupara. He did his high-schooling at MGD High School, Puthussery...'
    },
    {
      name: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-dr-gabriel-mar-gregorios',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-gregorios.jpg',
      description: "His Grace was born on 10 February 1948 to Mr CM John and Mrs Aleyamma John, Vadakethazhethil, Kanjickal. He did schooling at St Stephen's High School, Pathanapuram. He persued his..."
    },
    {
      name: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
      href: '/mosc-old/holy-synod/his-grace-dr-yoohanon-mar-chrysostamus',
      title: 'Metropolitan',
      image: '/images/holy-synod/chris.jpg',
      description: 'His Grace was born in 1954 to Mr KV Yohannan and Mrs Aleyamma Yohannan, Mannil Puthen Purayil, Kottoor, Thiruvalla. Varghese had his early education in local schools at Kottoor, and...'
    },
    {
      name: 'H.G.Yuhanon Mar Policarpos Metropolitan',
      href: '/mosc-old/holy-synod/h-g-youhanon-mar-polycarpus-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/poly.jpg',
      description: 'His Grace was born on 30th March 1955 as the son of Mr.P.V.Zachariah and Mrs.Annamma Zachariah of Panniyankara Parakunnil family in Vadakkanchery, Palakkad. His Grace is a member of Mar.Gregorios...'
    },
    {
      name: 'H. G. Mathews Mar Theodosius Metropolitan',
      href: '/mosc-old/holy-synod/h-g-mathews-mar-theodosius',
      title: 'Metropolitan',
      image: '/images/holy-synod/thevo.jpg',
      description: 'His Grace was born on 15th September 1955 as the eldest son of Mr.P.M.George and Mrs. Aleyamma George of Punchayil family in Pandankary, Edathua, Alapuzha. His Grace is a member...'
    },
    {
      name: 'H.G.Dr. Joseph Mar Dionysius Metropolitan',
      href: '/mosc-old/holy-synod/h-g-joseph-mar-dionysius-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/cul.jpg',
      description: 'His Grace was born on 15th June 1956 as the son of Mr. T. V. Mathai and Mrs. Aleyamma Mathai of Thekkil Kandathil family in Valanjavattom, Thiruvalla and a member...'
    },
    {
      name: 'H. G. Abraham Mar Epiphanios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-abraham-mar-epiphanios',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-ephipanios.jpg',
      description: "His Grace was born on 17th September 1960 as the son of Mr. V. A. Oommen and Mrs. Gracy Oommen. His Grace is a member of St. Mary's Cathedral, Malaysia."
    },
    {
      name: 'H. G. Dr. Mathews Mar Thimothios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-mathews-mar-thimothios-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/thimothios.jpg',
      description: 'His Grace was born on 3rd May 1963 as the eldest son of Mr. P.J. Baby and Mrs. Thankamma Baby of Painuvilla Puthenveettil family. His Grace is a member of...'
    },
    {
      name: 'H. G. Alexios mar Eusebius Metropolitan',
      href: '/mosc-old/holy-synod/h-g-alexios-mar-eusebius-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/eusebius.jpg',
      description: 'His Grace Alexios Mar Eusebius, formerly Rev. Fr. Alex Daniel is a member of St. George Orthodox Church, Puthoor of Kollam Diocese. Thirumeni hails from Vattakkattu family, Puthoor. His...'
    },
    {
      name: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-yuhanon-mar-dioscoros-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/pani.jpg',
      description: 'His Grace was born in Kallarackal Kaleelil family on 28 May 1964 as the son of Mr. P. T. Mathunny Panicker & Mrs. Kunjamma Panicker. He is a member of...'
    },
    {
      name: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-yuhanon-mar-demetrius-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/del.jpg',
      description: 'His Grace was Born on 18-12-1952 as the son of Palamoottil Mathews and Mercy. Home parish is St. Thomas Orthodox Cathedral, Kollam Diocese. After completing the formal education, His Grace...'
    },
    {
      name: 'H.G. Dr.Yuhanon Mar Thevodoros Metropolitan',
      href: '/mosc-old/holy-synod/h-g-yuhanon-mar-theodorus-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-thevodoros.jpg',
      description: 'His Grace was born on 10-02-1953 as the son of hoppil Thekkathil George and Thankamma Mavelikkara Diocese. His Grace is a member of Mavelikkara Vazhuvady Mar Baselios Church.. After taking his...'
    },
    {
      name: 'H.G. Yakob Mar Elias Metropolitan',
      href: '/mosc-old/holy-synod/h-g-yakoob-mar-elias-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-eliyas.jpg',
      description: 'His Grace was born on 24-02-1953 as the son of Chackaleth Viruthiyath Kizhakkethil Mathai and Mariamma. His Grace is a member of St. Elias Orthodox Church, Budhanoor, Chengannoor Diocese. After taking...'
    },
    {
      name: 'H. G. Dr.Joshua Mar Nicodimos Metropolitan',
      href: '/mosc-old/holy-synod/h-g-joshua-mar-nicodemus-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-nicodimos.jpg',
      description: 'His Grace was Born on 8th October 1962 as the youngest son of Mr.Philipose Mathai and Mrs.Thankamma Mathai, Sankarathil Nediyavilayil, Kurampala, Pandalam. Home parish is St.Thomas Orthodox Valiyapally Kurampala, Pandalam,...'
    },
    {
      name: 'H.G. Dr. Zacharias Mar Aprem Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-zacharias-mar-aprem-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/mar-aprem.jpg',
      description: 'His Grace was born as the son of E.K. Kuriakose and Sossama Kuriakose. His Grace is a member of St. George Valiyapally, Chungathara , Malabar Diocese. After taking his Bachelors...'
    },
    {
      name: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-geevarghese-mar-julius-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/yulios.jpg',
      description: 'His Grace Dr. Geevarghese Mar Yulios, Bishop and Metropolitan in the Malankara Orthodox Syrian Church, was born on May 17, 1967, to Late Mr. P. V. Pavu and Mrs. K....'
    },
    {
      name: 'H.G. Dr. Abraham Mar Seraphim Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-abraham-mar-seraphim-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/sera.png',
      description: 'His Grace was born on 28 December 1969 as the son of Mr. V. A. Mathews and Mrs. Annie Mathews,Vaduthala Puthenveedu, Mathoor. He is a member of St. George Orthodox...'
    },
    {
      name: 'H.G. Abraham Mar Stephanos Metropolitan',
      href: '/mosc-old/holy-synod/h-g-abraham-mar-stephanos-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Abraham-Mar-Stephanos.png',
      description: 'Born to Late Mr. K. A. Thomas and Mrs. Annamma, Kadakkamannil House, Mylapra in Pathanamthitta on June 11, His Grace belongs to the parish of St. George Orthodox Church (Valiyapalli),...'
    },
    {
      name: 'H.G. Dr. Thomas Mar Ivanios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-thomas-mar-ivanios-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Thomas-Mar-Ivanios.png',
      description: 'Born to of Late Mr. Thomas Chacko and Mrs. Annamma , in Pulluparampil house, Aleppey on 13 th December 1969, His Grace Thomas Mar Ivanios Metropolitan belongs to the parish...'
    },
    {
      name: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan',
      href: '/mosc-old/holy-synod/hg-dr-geevarghese-mar-theophilos-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Dr-Geevarghese-Mar-Theophilos.png',
      description: 'Born as the son of Mr. P. C. Joshua and Mrs. P. C. Marykutty in Kizhakkemannil House, Chenneerkkara, Thumpamon on 8 th August 1971, His Grace belongs to the parish...'
    },
    {
      name: 'H.G. Geevarghese Mar Philoxenos Metropolitan',
      href: '/mosc-old/holy-synod/h-g-geevarghese-mar-philaxenos-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Geevarghese-Mar-Philaxenos.png',
      description: 'H. G. Geevarghese Mar Philoxenos Metropolitan was born in Maleth house, Arattupuzha as the son of Mr. M. G. George and Mrs. Accamma on 30 th May 1972 . His...'
    },
    {
      name: 'H.G. Geevarghese Mar Pachomios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-geevarghese-mar-pachomios-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Geevarghese-Mar-Pachomios-300x193-1.jpg',
      description: 'Born in Kochuparambil house as the son of Mr. K.M. Elias and Lt. Mrs. Omana on 6 th March 1973 , H. G. Geevarghese Mar Pachomios Metropolitan belongs to the...'
    },
    {
      name: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan',
      href: '/mosc-old/holy-synod/h-g-dr-geevarghese-mar-barnabas-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/Geevarghese-Mar-Barnabas.png',
      description: "Born to Mr. Kochupappi and Mrs. Ammini in Kattuparambil House on April 10, 1973, His Grace belongs to the parish of St. Mary's Orthodox Church, Muttam under Mavelikkara diocese."
    },
    {
      name: 'H.G. Zachariah Mar Severios Metropolitan',
      href: '/mosc-old/holy-synod/h-g-zacharia-mar-severios-metropolitan',
      title: 'Metropolitan',
      image: '/images/holy-synod/zaker.jpg',
      description: 'Born in Chirathilatt House as the son of Very Rev. C. John Cor- Episcopa and Mrs. Lissy on 19 th August, 1978, His Grace belongs to the parish of St....'
    }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Holy Synod">👥</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Holy Synod
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Holy Synod consists of all the bishops of the Malankara Orthodox Syrian Church,
              serving as the highest governing body under the leadership of the Catholicos.
            </p>
          </div>
        </div>
      </section>

      {/* Current Catholicos */}
      <section id="catholicos-section" className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              His Holiness the Catholicos
            </h2>
          </div>

          {synodMembers.filter(member => member.special).map((member) => (
            <div key={member.name} className="bg-background rounded-lg sacred-shadow p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Image - Full display without cropping */}
                <div className="flex justify-center md:justify-start">
                  <div className="relative w-48 h-72 md:w-56 md:h-96 rounded-lg overflow-hidden sacred-shadow">
                    <Image
                      src={member.image || '/images/holy-synod/hh-scaled.jpg'}
                      alt={`Portrait of ${member.name}, ${member.title}`}
                      fill
                      sizes="(max-width: 768px) 192px, 224px"
                      className="object-cover object-top"
                      style={{
                        objectPosition: 'center 15%'
                      }}
                      priority
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <h3 className="font-heading font-semibold text-2xl text-foreground mb-2">
                    {member.name}
                  </h3>
                  <p className="font-body text-lg text-primary mb-4">
                    {member.title}
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={member.href}
                      className="inline-flex items-center px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 reverent-transition"
                    >
                      <span className="mr-2" role="img" aria-label="Biography">📋</span>
                      Biography
                    </Link>
                    <Link
                      href="/mosc-old/photo-gallery/reception-to-his-holiness-baselios-marthoma-mathews-iii"
                      className="inline-flex items-center px-4 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 reverent-transition"
                    >
                      <span className="mr-2" role="img" aria-label="Photos">📸</span>
                      Photos
                    </Link>
                    <Link
                      href="/mosc-old/speeches"
                      className="inline-flex items-center px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 reverent-transition"
                    >
                      <span className="mr-2" role="img" aria-label="Speeches">🎤</span>
                      Speeches
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Synod Members */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Synod Members
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The bishops and metropolitans who serve as spiritual leaders and administrators
              of their respective dioceses within the church.
            </p>
          </div>

          {/* Centered Flex Grid - Cards expand from center outward, last row auto-centers */}
          <div className="flex flex-wrap gap-6 justify-center items-stretch max-w-7xl mx-auto">
            {synodMembers.filter(member => !member.special).map((member) => (
              <Link
                key={member.name}
                href={member.href}
                className="bg-card rounded-lg sacred-shadow p-4 hover:sacred-shadow-lg reverent-transition group w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex-shrink-0 flex flex-col"
                style={{ maxWidth: '400px' }}
              >
                <div className="text-center flex flex-col h-full">
                  {/* Image Container - Full image display without cropping */}
                  <div className="relative w-full aspect-[3/4] mx-auto mb-3 rounded-lg overflow-hidden sacred-shadow-sm group-hover:sacred-shadow reverent-transition">
                    <Image
                      src={member.image || '/images/holy-synod/placeholder.jpg'}
                      alt={`Portrait of ${member.name}, ${member.title}`}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top group-hover:scale-105 reverent-transition"
                      style={{
                        objectPosition: 'center 15%'
                      }}
                    />
                  </div>

                  {/* Content Section - Flex grow to fill remaining space */}
                  <div className="flex flex-col flex-1">
                    <h3 className="font-heading font-semibold text-base text-foreground mb-1.5 group-hover:text-primary reverent-transition">
                      {member.name}
                    </h3>
                    <p className="font-body text-sm text-primary font-medium mb-2">
                      {member.title}
                    </p>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                      {member.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary mt-auto">
                      Read More
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HolySynodPage;














