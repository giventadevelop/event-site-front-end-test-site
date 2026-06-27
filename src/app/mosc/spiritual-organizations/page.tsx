import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Spiritual Organizations | MOSC',
  description: 'Discover the various spiritual organizations and ministries of the Malankara Orthodox Syrian Church.',
};

const SpiritualOrganizationsPage = () => {
  const organizations = [
    {
      title: 'Orthodox Syrian Sunday School Association of the East',
      description: 'Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the...',
      href: '/mosc/spiritual-organizations/orthodox-syrian-sunday-school-association-of-the-east',
      image: '/images/spiritual/ossae.jpg',
      icon: '📚'
    },
    {
      title: 'Ecological Commission',
      description: 'President H. G. Dr. Joseph Mar Dionysius Metropolitan Secretary Rev. Fr. Dr. Michael Zachariah (Mount Tabore Dayara, Pathanapuram)',
      href: '/mosc/spiritual-organizations/ecological-commission',
      icon: '🌱'
    },
    {
      title: 'Divyabodhanam (Theological Education Programme for the Laity)',
      description: 'The Divyabodhanam is a theological training programme for laity in the Church. It was founded in 1984 by the late HH Baselius Marthoma Mathews I by the initiative of the...',
      href: '/mosc/spiritual-organizations/divyabodhanam-theological-education-programme-for-the-laity',
      icon: '🎓'
    },
    {
      title: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies",
      description: "President H.G. Dr. Yuhanon Mar Thevodoros Metropolitan Office Address St.Paul's M.T.C , Mavelikara Ph- 0479 2302473, 2342709 Email- stpaulsmtc@yahoo.com",
      href: '/mosc/spiritual-organizations/st-pauls-st-thomas-suvishesha-sangam-national-association-for-mission-studies',
      icon: '✟'
    },
    {
      title: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music',
      description: 'Director  H. G. Dr. Zacharias Mar Aprem Metropolitan Email- sruthischoolofmusic89@rediffmail.com',
      href: '/mosc/spiritual-organizations/orthodox-sabha-gayaka-sangham-co-sruthi-school-of-liturgical-music',
      icon: '🎵'
    },
    {
      title: 'Malankara Orthodox Baskiyoma Association',
      description: 'President H. G. Dr. Mathews Mar Thimothios Metropolitan Vice Presidents Fr. Solu Koshy Raju Smt. Jessy Varghese Secretary Rachel P Jose +91 9497675787',
      href: '/mosc/spiritual-organizations/malankara-orthodox-baskiyoma-association',
      icon: '👥'
    },
    {
      title: 'The Servants of the Cross',
      description: 'President H. G. Geevarghese Mar Coorilos Metropolitan General Secretary Fr. Somu K. Samuel Ph- +91 9447933220 Office Address Carmel Dayara. Kandanad, Ph- 0484 2792159',
      href: '/mosc/spiritual-organizations/the-servants-of-the-cross',
      icon: '✝️'
    },
    {
      title: 'Ardra Charitable Society',
      description: 'Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India, irrespective of caste, creed or community. Etymologically derived from the Sanskrit...',
      href: '/mosc/spiritual-organizations/ardra-charitable-trust',
      image: '/images/spiritual/ARDRA.png',
      icon: '🤝'
    },
    {
      title: 'Akhila Malankara Prayer Group Association',
      description: 'The Akhila Malankara Prayer Group Association has been constituted to monitor and streamline the prayer and reading habits of congregations in different prayer groups functioning in the various parishes under...',
      href: '/mosc/spiritual-organizations/akhila-malankara-prayer-group-association',
      image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
      icon: '🙏'
    },
    {
      title: 'Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)',
      description: 'AMOSS is a movement working on the following objectives: To give instructions to the altar boys of all parishes in the Malankara Church to make uniformity in the worship of the...',
      href: '/mosc/spiritual-organizations/akhila-malankara-orthodox-shusrushaka-sangham-amoss',
      image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
      icon: '⛪'
    },
    {
      title: 'Mission Board and Mission Society',
      description: 'Orthodox Church which has been existing in India for the last two thousand years has started the mission society and mission board to fulfil its mission in India and hence...',
      href: '/mosc/spiritual-organizations/mission-board',
      image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
      icon: '🌍'
    },
    {
      title: 'Ministry of Human Empowerment',
      description: 'MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore ,enlighten and empower the human potential of the society  through various awareness campaigns. The main thrust of...',
      href: '/mosc/spiritual-organizations/ministry-of-human-empowerment',
      image: '/images/logos/Current_Edits/MOSC-Logo-only.png',
      icon: '💪'
    },
    {
      title: 'Akhila Malankara Balasamajam',
      description: 'AKHILA MALANKARA BALASAMAJAM is the student portion of the Malankara Orthodox Syrian Church. Balasamajam aims at the integrated personal development of the youth in the Church. The main objectives are worship, study and virtuous...',
      href: '/mosc/spiritual-organizations/akhila-malankara-bala-samajam',
      image: '/images/spiritual/BALASAMAJAM.png',
      icon: '👶'
    },
    {
      title: 'St. Thomas Orthodox Vaidika Sanghom',
      description: 'The antecedents of the St.Thomas Orthodox Vaidhika Sanghom can be traced back to the period of St.Gregorios of Parumala. The Saint, whose organizational skills and vision for the Malankara Orthodox...',
      href: '/mosc/spiritual-organizations/st-thomas-orthodox-vaidika-sanghom',
      image: '/images/spiritual/vaidika-sanghom.jpg',
      icon: '📖'
    },
    {
      title: "Marth Mariam Vanitha Samajam (Women's Wing of Orthodox Church of India)",
      description: "A Brief History Marth Mariam Vanitha Samajam is the Women's wing of the Malankara Orthodox Church of India. It is one of the major spiritual organization of the church combining...",
      href: '/mosc/spiritual-organizations/marth-mariam-vanitha-samajam-womens-wing-of-orthodox-church-of-india',
      image: '/images/spiritual/MMVS.png',
      icon: '👩'
    },
    {
      title: 'Mar Gregorios Orthodox Christian Student Movement (MGOCSM)',
      description: 'Mar Gregorios Orthodox Christian Student Movement (MGOCSM) is the student wing of the Malankara Orthodox Syrian Church. The students and senior leaders of our church who were residing in Madras...',
      href: '/mosc/spiritual-organizations/mar-gregorios-orthodox-christian-student-movement-mgocsm',
      image: '/images/spiritual/mgocsm.jpg',
      icon: '🎓'
    },
    {
      title: 'The Orthodox Christian Youth Movement',
      description: 'The Orthodox Christian Youth Movement (OCYM), the Youth-wing of the Malankara Orthodox Syrian Church is in its 77th year of active leadership and Christian witness in the Church and society....',
      href: '/mosc/spiritual-organizations/the-orthodox-christian-youth-movement',
      image: '/images/spiritual/OCYM-ahmedabad.png',
      icon: '🌟'
    },
    {
      title: 'NAVAJYOTHI MOMS CHARITABLE SOCIETY',
      description: 'The Navajyothi MOMS Charitable Society is an organization for poor, self- employed women workers in the community. Established in 2009, it is a registered charitable organization owned by Malankara Orthodox...',
      href: '/mosc/spiritual-organizations/navajyothi-moms-charitable-society',
      icon: '💝'
    }
  ];

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Spiritual Organizations"
        breadcrumbFrom="home"
        description="Each organization plays a vital role in nurturing faith, providing education, and serving the community through various ministries and programs."
      />

      {/* Content - same layout and style as administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Spiritual Organizations &amp; Ministries
          </h3>

          {/* Cards grid (matches administration .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="relative w-full h-48 bg-syro-bg-gray shrink-0 flex items-center justify-center p-4">
                  {index === 0 ? (
                    <div className="relative w-full h-full min-h-0">
                      <Image
                        src="/images/spiritual/OSSSAE.png"
                        alt={org.title}
                        fill
                        className="object-contain object-center"
                        style={{ backgroundColor: 'transparent' }}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : index >= 8 && index <= 11 ? (
                    <div className="relative w-28 h-28 flex-shrink-0">
                      <Image
                        src={org.image!}
                        alt={org.title}
                        fill
                        className="object-contain object-center"
                        style={{ backgroundColor: 'transparent' }}
                        sizes="112px"
                      />
                    </div>
                  ) : org.image ? (
                    <div className="relative w-full h-full min-h-0">
                      <Image
                        src={org.image}
                        alt={org.title}
                        fill
                        className="object-contain object-center"
                        style={{ backgroundColor: 'transparent' }}
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center">
                      <span className="text-3xl" role="img" aria-label={org.title}>{org.icon}</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {org.title}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
                    {org.description}
                  </p>
                  <Link
                    href={org.href}
                    className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                  >
                    <span>Read More</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* About Spiritual Organizations - extra content kept */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            <div>
              <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
                The Role of Spiritual Organizations
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  Spiritual organizations within the Malankara Orthodox Syrian Church serve as vital
                  instruments of faith, education, and community service. Each organization is dedicated
                  to specific aspects of spiritual growth and social welfare.
                </p>
                <p>
                  These organizations provide structured programs for different age groups and interests,
                  from children's ministries to adult education, from charitable work to theological
                  training. They help maintain the rich traditions of our Orthodox faith while adapting
                  to contemporary needs.
                </p>
                <p>
                  Through their various activities, these organizations strengthen the bonds within
                  our community and extend the love of Christ to those in need, both within and
                  outside our church family.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                Key Areas of Ministry
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Education">📚</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Education & Formation</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Sunday schools, theological training, and spiritual education</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Youth">🌟</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Youth & Student Ministries</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Programs for young people and students</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Women">👩</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Women's Ministries</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Organizations supporting women's spiritual growth</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Charity">🤝</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Charitable Work</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Serving the community and those in need</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Mission">🌍</span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Mission & Outreach</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">Spreading the Gospel and serving globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
};

export default SpiritualOrganizationsPage;

