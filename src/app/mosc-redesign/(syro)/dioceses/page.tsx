import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Dioceses',
  description: 'Explore the dioceses of the Malankara Orthodox Syrian Church across India and worldwide.',
};

const DiocesesPage = () => {
  // All dioceses with excerpt and image (card style like mosc.in/dioceses)
  const dioceseCards = [
    { name: 'Diocese of Thiruvananthapuram', href: '/mosc-redesign/dioceses/diocese-of-thiruvananthapuram-diocese', excerpt: 'On 1978, February 20th, Malankara Syrian Christian managing committee recommended a division in Kollam diocese. According to Committee\'s recommendation, On 1979, January 1st, Kollam diocese was divided into two, namely Kollam diocese and Thiruvananthapuram (Trivandrum) diocese.', image: '/images/dioceses/diocese-of-thiruvananthapuram-diocese.png' },
    { name: 'Diocese of Kollam', href: '/mosc-redesign/dioceses/diocese-of-kollam', excerpt: 'St Thomas, the Apostle of Jesus Christ, is the Father of Christianity in India, landed at Maliankara in Kerala founded seven churches at Maliankara, Palayur, Kottakavu, Niranam, Nilakkel, Kollam and Kokkamangalam.', image: '/images/dioceses/kollam diocese.jpg' },
    { name: 'Diocese of Kottarakara – Punalur', href: '/mosc-redesign/dioceses/diocese-of-kottarakara-punalur', excerpt: 'Kottarakkara Punalur Diocese is one of the 30 dioceses of the Malankara Orthodox Syrian Church. The diocese was created after dividing the then existed Thiruvananthapuram Diocese and Kollam Diocese.', image: '' },
    { name: 'Diocese of Adoor – Kadampanadu', href: '/mosc-redesign/dioceses/diocese-of-adoor-kadampanadu', excerpt: 'One of the fastest growing Diocese of Malankara Orthodox Church which came into existence by the Kalpana of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan.', image: '/images/dioceses/kadampanadu diocese.jpg' },
    { name: 'Diocese of Thumpamon', href: '/mosc-redesign/dioceses/diocese-of-thumpamon', excerpt: 'Flipping through the historical pages of Orthodox Christian community in Kerala, Thumpamon was one of the bastions for Christians during the very first century. Thumpamon Diocese was created after the division of the then existing dioceses.', image: '/images/dioceses/thumpamon_diocese.jpg' },
    { name: 'Diocese of Mavelikara', href: '/mosc-redesign/dioceses/diocese-of-mavelikara', excerpt: 'Mavelikara has an esteemed place in the history of Syrian Christians in Kerala. It is one of the ancient Syrian Christian settlements in Kerala. Its traditional relation with the Christian community is well known.', image: '/images/dioceses/mavelikara_diocese.png' },
    { name: 'Diocese of Chengannur', href: '/mosc-redesign/dioceses/diocese-of-chengannur', excerpt: 'The Diocese of Chengannur came into existence on 10th March 1985 vide Kalpana No. 52/85 of H.H. Moran Mar Baselios Marthoma Mathews I Catholicose of the East and Malankara Metropolitan.', image: '/images/dioceses/chengannur_diocese.png' },
    { name: 'Diocese of Niranam', href: '/mosc-redesign/dioceses/diocese-of-niranam', excerpt: 'Niranam is a beautiful village situated in the delta of rivers Pampa and Manimala: part of Thiruvalla taluk and Pathanamthitta district. This is a typical Keralite agricultural village, full of natural beauty.', image: '' },
    { name: 'Diocese of Nilackal', href: '/mosc-redesign/dioceses/diocese-of-nilackal', excerpt: 'The Diocese of Nilackal came into being on August 15, 2010 under the order issued by H.H Baselios Mar Thoma Didymos I, The Catholicos cum Malankara Metropolitan. H.G. Dr. Joshua Mar Nicodimos is the first Metropolitan.', image: '' },
    { name: 'Diocese of Kottayam', href: '/mosc-redesign/dioceses/diocese-of-kottayam', excerpt: 'As per the decisions of the Mulamthuruthy Synod, Kottayam Diocese was formed initially with 20 churches altogether from Kottayam and nearby places. The first diocesan metropolitan was His Grace Kadavil Paulose Mar Athanasios.', image: '' },
    { name: 'Diocese of Kottayam Central', href: '/mosc-redesign/dioceses/diocese-of-kottayam-central', excerpt: 'The Diocese of Kottayam Central came into existence vide Kalpana No. 110/82 dated April 21, 1982 of His Holiness Moran Mar Baselios Marthoma Mathews I, Catholicose of the East & Malankara Metropolitan.', image: '' },
    { name: 'Diocese of Idukki', href: '/mosc-redesign/dioceses/diocese-of-idukki', excerpt: 'Until 1982, the present churches of the Idukki diocese were part of Kottayam diocese. In 1982 the churches in the eastern part of Kottayam diocese were taken and formed the Idukki Diocese.', image: '' },
    { name: 'Diocese of Kandanad East', href: '/mosc-redesign/dioceses/diocese-of-kandanad-east', excerpt: 'Kandanad Diocese is one of the oldest dioceses of the Orthodox Syrian Church. It was constituted with Kandanad St. Mary\'s Church at its centre along with two scores and odd churches.', image: '' },
    { name: 'Diocese of Kandanad West', href: '/mosc-redesign/dioceses/diocese-of-kandanad-west', excerpt: 'In 1876 Malankara Orthodox Church was divided into 7 Dioceses by Mulanthuruthy synod. Among those seven, one was Kandanad Diocese. At that time the parishes of Kandanad Diocese spread across the region.', image: '' },
    { name: 'Diocese of Ankamaly', href: '/mosc-redesign/dioceses/diocese-of-ankamaly', excerpt: 'History of the Diocese of Angamaly: It was also from the historic synod of Mulanthuruthy in 1876 that the Angamaly Diocese was formed. Metropolitans such as Kadavil Paulose Mar Athanasios have served the diocese.', image: '' },
    { name: 'Diocese of Kochi', href: '/mosc-redesign/dioceses/diocese-of-kochi', excerpt: 'Kochi is one of the most prominent dioceses throughout the history of Malankara Orthodox Church. The Diocese of Kochi was formed in 1876. It has played a significant role in the church\'s growth.', image: '' },
    { name: 'Diocese of Thrissur', href: '/mosc-redesign/dioceses/diocese-of-thrissur', excerpt: 'The diocese was formed in 1982 with parishes in Thrissur and Palakkad districts. At the time of the formation of the diocese there were 32 parishes and 26 priests. The first Metropolitan was His Grace.', image: '/images/dioceses/thrissur_diocese.png' },
    { name: 'Diocese of Kunnamkulam', href: '/mosc-redesign/dioceses/diocese-of-kunnamkulam', excerpt: 'A Brief History Of Kunnamkulam Diocese: Kunnamkulam is the home of the people who bear in their hearts the natural piety of spiritualism, the fragrance of tradition and the legacy of the faith.', image: '' },
    { name: 'Diocese of Malabar', href: '/mosc-redesign/dioceses/diocese-of-malabar', excerpt: 'The Malabar Diocese, which extends across the western districts of Kerala, was formed in 1953. H.G. Paulose Mar Severios and H.G. Pathrose Mar Osthathios (1953–68) have executed its administration.', image: '/images/dioceses/malabar_diocese.png' },
    { name: 'Diocese of Sulthan Bathery', href: '/mosc-redesign/dioceses/diocese-of-sulthan-bathery-diocese', excerpt: 'In 1986, the diocese of Sultan Bathery was formed by organising all the churches from the District of Wayanad, some of the churches from the Nilagiri District of Tamilnadu and some from Karnataka.', image: '/images/dioceses/sulthan_bathery_diocese.png' },
    { name: 'Diocese of Brahamavar', href: '/mosc-redesign/dioceses/diocese-of-brahamavar', excerpt: 'The Diocese of Brahmavar was formed in August 2010 and was announced by His Holiness Baselios Marthoma Didymus I through the Kalpana No.389/2010 dated 3-8-2010. The formation was with the goal of shepherding the faithful in the region.', image: '/images/dioceses/bhramavar_diocese.png' },
    { name: 'Diocese of Madras', href: '/mosc-redesign/dioceses/diocese-of-chennai-diocese', excerpt: 'Madras City, hallowed and blessed by the martyrdom of St. Thomas the Apostle, has been the Headquarters of the Madras Diocese belonging to the Orthodox Church of India for many decades.', image: '/images/dioceses/madras_diocese.jpg' },
    { name: 'Diocese of Bangalore', href: '/mosc-redesign/dioceses/diocese-of-bangalore', excerpt: 'Dioceses in the history of the Malankara Orthodox Syrian Church were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H. Patriarch Mar Peter III divided the Malankara Church into dioceses.', image: '' },
    { name: 'Diocese of Bombay', href: '/mosc-redesign/dioceses/diocese-of-mumbai', excerpt: 'The Diocese of Bombay was carved out of the outside Kerala diocese of the Malankara Orthodox Syrian Church in the year 1976. His Grace Dr. Thomas Mar Makarios was the first Metropolitan of the Diocese.', image: '' },
    { name: 'Diocese of Calcutta', href: '/mosc-redesign/dioceses/diocese-of-calcutta', excerpt: 'Dioceses in the history of the Malankara Orthodox Syrian Church were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H. Patriarch Mar Peter III divided the Malankara Church. Calcutta Diocese serves the faithful in the region.', image: '/images/dioceses/culcutta_diocese.png' },
    { name: 'Diocese of Delhi', href: '/mosc-redesign/dioceses/diocese-of-delhi', excerpt: 'Once the nucleus of the Orthodox Church in north India was formed in the capital of the country, the growth of parishes in adjacent centres was rapid and the establishment of the Delhi Diocese followed.', image: '' },
    { name: 'Diocese of Ahmedabad', href: '/mosc-redesign/dioceses/diocese-of-ahmedabad', excerpt: 'The Diocese of Ahmedabad came into existence vide Kalpana No 93/2009 dated March 2, 2009 of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan.', image: '/images/dioceses/ahmedabad_diocese.jpg' },
    { name: 'Diocese of Northeast America', href: '/mosc-redesign/dioceses/northeast-america', excerpt: 'The history of the Malankara Orthodox Syrian Church of the East in the U.S.A. begins approximately in the mid 20th century. During this period, a number of prominent priests and lay people helped establish the Church in America.', image: '/images/dioceses/northeast_america_diocese.png' },
    { name: 'Diocese of South West America', href: '/mosc-redesign/dioceses/diocese-of-south-west-america', excerpt: 'The Diocese was formed by order number 145/2009 signed by the then Catholicos of the Apostolic Throne of St. Thomas and Malankara Metropolitan, His Holiness Baselios Mar Thoma Didymos I.', image: '/images/dioceses/southwest_america_diocese.jpg' },
    { name: 'Diocese of UK Europe and Africa', href: '/mosc-redesign/dioceses/diocese-of-uk-europe-and-africa', excerpt: 'Diocese of the Indian Orthodox Church, UK Europe and Africa is acting as the umbrella organisation for various Indian Orthodox parishes in the UK, Rest of Europe and African Continent.', image: '' },
    { name: 'Diocese of Asia Pacific', href: '/mosc-redesign/dioceses/asia-pacific', excerpt: 'The Asia Pacific diocese serves the faithful in the Asia Pacific region with its office in Canberra, Australia.', image: '/images/dioceses/asia-pacific-diocese.webp' },
    { name: 'Diocese of Canada', href: '/mosc-redesign/dioceses/canada', excerpt: 'The Canada diocese serves the Malankara Orthodox Syrian Church community across Canada with its office in Hamilton, Ontario.', image: '/images/dioceses/canda-diocese.webp' }
  ];

  const BANNER_DESCRIPTION =
    'The Malankara Orthodox Syrian Church is organized into dioceses that serve communities across different regions, ensuring spiritual care and administrative support for all members.';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Dioceses"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Our Dioceses
          </h3>

          {/* Cards grid (matches administration .admin-card) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {dioceseCards.map((card) => (
              <div
                key={card.href}
                className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="relative w-full h-48 shrink-0">
                  {card.image ? (
                    <Image
                      src={card.image}
                      alt={card.name}
                      fill
                      className="object-contain object-center"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-burgundy/80">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-burgundy/10 ring-1 ring-burgundy/30">
                        <svg
                          className="w-12 h-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M12 10v6m-3-3h6"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                    {card.name}
                  </h3>
                  <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
                    {card.excerpt}
                  </p>
                  <Link
                    href={card.href}
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

          {/* Diocese Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16">
            <div>
              <h2 className="text-2xl font-light text-[#798daf] pl-8 border-l-[7px] border-syro-red mb-6">
                About Our Dioceses
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  Each diocese in the Malankara Orthodox Syrian Church is led by a Metropolitan or Bishop
                  who provides spiritual guidance and administrative oversight to the parishes within their jurisdiction.
                </p>
                <p>
                  Our dioceses are organized geographically to serve the spiritual needs of our members,
                  whether they are in Kerala, other parts of India, or in international communities
                  around the world.
                </p>
                <p>
                  Each diocese maintains its own administrative structure while remaining united with
                  the central church authority, ensuring both local autonomy and global unity in our faith.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                Diocese Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-dark-gray">Total Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-dark-gray">Kerala Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">21</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-dark-gray">Indian Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-dark-gray">International Dioceses</span>
                  <span className="font-syro-display font-semibold text-syro-blue">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-syro-primary text-syro-dark-gray">Total Parishes</span>
                  <span className="font-syro-display font-semibold text-syro-blue">2000+</span>
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

export default DiocesesPage;














