import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Dioceses',
  description: 'Explore the dioceses of the Malankara Orthodox Syrian Church across India and worldwide.',
};

const DiocesesPage = () => {
  // All dioceses with excerpt and image (card style like mosc.in/dioceses)
  const dioceseCards = [
    { name: 'Diocese of Thiruvananthapuram', href: '/mosc-old/dioceses/diocese-of-thiruvananthapuram-diocese', excerpt: 'On 1978, February 20th, Malankara Syrian Christian managing committee recommended a division in Kollam diocese. According to Committee\'s recommendation, On 1979, January 1st, Kollam diocese was divided into two, namely Kollam diocese and Thiruvananthapuram (Trivandrum) diocese.', image: '/images/dioceses/diocese-of-thiruvananthapuram-diocese.jpg' },
    { name: 'Diocese of Kollam', href: '/mosc-old/dioceses/diocese-of-kollam', excerpt: 'St Thomas, the Apostle of Jesus Christ, is the Father of Christianity in India, landed at Maliankara in Kerala founded seven churches at Maliankara, Palayur, Kottakavu, Niranam, Nilakkel, Kollam and Kokkamangalam.', image: '/images/dioceses/kollam diocese.jpg' },
    { name: 'Diocese of Kottarakara – Punalur', href: '/mosc-old/dioceses/diocese-of-kottarakara-punalur', excerpt: 'Kottarakkara Punalur Diocese is one of the 30 dioceses of the Malankara Orthodox Syrian Church. The diocese was created after dividing the then existed Thiruvananthapuram Diocese and Kollam Diocese.', image: '/images/dioceses/diocese-of-kottarakara-punalur.jpg' },
    { name: 'Diocese of Adoor – Kadampanadu', href: '/mosc-old/dioceses/diocese-of-adoor-kadampanadu', excerpt: 'One of the fastest growing Diocese of Malankara Orthodox Church which came into existence by the Kalpana of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan.', image: '/images/dioceses/kadampanadu diocese.jpg' },
    { name: 'Diocese of Thumpamon', href: '/mosc-old/dioceses/diocese-of-thumpamon', excerpt: 'Flipping through the historical pages of Orthodox Christian community in Kerala, Thumpamon was one of the bastions for Christians during the very first century. Thumpamon Diocese was created after the division of the then existing dioceses.', image: '/images/dioceses/thumpamon_diocese.jpg' },
    { name: 'Diocese of Mavelikara', href: '/mosc-old/dioceses/diocese-of-mavelikara', excerpt: 'Mavelikara has an esteemed place in the history of Syrian Christians in Kerala. It is one of the ancient Syrian Christian settlements in Kerala. Its traditional relation with the Christian community is well known.', image: '/images/dioceses/mavelikara_diocese.jpg' },
    { name: 'Diocese of Chengannur', href: '/mosc-old/dioceses/diocese-of-chengannur', excerpt: 'The Diocese of Chengannur came into existence on 10th March 1985 vide Kalpana No. 52/85 of H.H. Moran Mar Baselios Marthoma Mathews I Catholicose of the East and Malankara Metropolitan.', image: '/images/dioceses/chengannur_diocese.jpg' },
    { name: 'Diocese of Niranam', href: '/mosc-old/dioceses/diocese-of-niranam', excerpt: 'Niranam is a beautiful village situated in the delta of rivers Pampa and Manimala: part of Thiruvalla taluk and Pathanamthitta district. This is a typical Keralite agricultural village, full of natural beauty.', image: '/images/dioceses/diocese-of-niranam.jpg' },
    { name: 'Diocese of Nilackal', href: '/mosc-old/dioceses/diocese-of-nilackal', excerpt: 'The Diocese of Nilackal came into being on August 15, 2010 under the order issued by H.H Baselios Mar Thoma Didymos I, The Catholicos cum Malankara Metropolitan. H.G. Dr. Joshua Mar Nicodimos is the first Metropolitan.', image: '/images/dioceses/diocese-of-nilackal.jpg' },
    { name: 'Diocese of Kottayam', href: '/mosc-old/dioceses/diocese-of-kottayam', excerpt: 'As per the decisions of the Mulamthuruthy Synod, Kottayam Diocese was formed initially with 20 churches altogether from Kottayam and nearby places. The first diocesan metropolitan was His Grace Kadavil Paulose Mar Athanasios.', image: '/images/dioceses/diocese-of-kottayam.jpg' },
    { name: 'Diocese of Kottayam Central', href: '/mosc-old/dioceses/diocese-of-kottayam-central', excerpt: 'The Diocese of Kottayam Central came into existence vide Kalpana No. 110/82 dated April 21, 1982 of His Holiness Moran Mar Baselios Marthoma Mathews I, Catholicose of the East & Malankara Metropolitan.', image: '/images/dioceses/diocese-of-kottayam-central.jpg' },
    { name: 'Diocese of Idukki', href: '/mosc-old/dioceses/diocese-of-idukki', excerpt: 'Until 1982, the present churches of the Idukki diocese were part of Kottayam diocese. In 1982 the churches in the eastern part of Kottayam diocese were taken and formed the Idukki Diocese.', image: '/images/dioceses/diocese-of-idukki.jpg' },
    { name: 'Diocese of Kandanad East', href: '/mosc-old/dioceses/diocese-of-kandanad-east', excerpt: 'Kandanad Diocese is one of the oldest dioceses of the Orthodox Syrian Church. It was constituted with Kandanad St. Mary\'s Church at its centre along with two scores and odd churches.', image: '/images/dioceses/diocese-of-kandanad-east.jpg' },
    { name: 'Diocese of Kandanad West', href: '/mosc-old/dioceses/diocese-of-kandanad-west', excerpt: 'In 1876 Malankara Orthodox Church was divided into 7 Dioceses by Mulanthuruthy synod. Among those seven, one was Kandanad Diocese. At that time the parishes of Kandanad Diocese spread across the region.', image: '/images/dioceses/diocese-of-kandanad-west.jpg' },
    { name: 'Diocese of Ankamaly', href: '/mosc-old/dioceses/diocese-of-ankamaly', excerpt: 'History of the Diocese of Angamaly: It was also from the historic synod of Mulanthuruthy in 1876 that the Angamaly Diocese was formed. Metropolitans such as Kadavil Paulose Mar Athanasios have served the diocese.', image: '/images/dioceses/diocese-of-ankamaly.jpg' },
    { name: 'Diocese of Kochi', href: '/mosc-old/dioceses/diocese-of-kochi', excerpt: 'Kochi is one of the most prominent dioceses throughout the history of Malankara Orthodox Church. The Diocese of Kochi was formed in 1876. It has played a significant role in the church\'s growth.', image: '/images/dioceses/diocese-of-kochi.jpg' },
    { name: 'Diocese of Thrissur', href: '/mosc-old/dioceses/diocese-of-thrissur', excerpt: 'The diocese was formed in 1982 with parishes in Thrissur and Palakkad districts. At the time of the formation of the diocese there were 32 parishes and 26 priests. The first Metropolitan was His Grace.', image: '/images/dioceses/thrissur_diocese.jpg' },
    { name: 'Diocese of Kunnamkulam', href: '/mosc-old/dioceses/diocese-of-kunnamkulam', excerpt: 'A Brief History Of Kunnamkulam Diocese: Kunnamkulam is the home of the people who bear in their hearts the natural piety of spiritualism, the fragrance of tradition and the legacy of the faith.', image: '/images/dioceses/diocese-of-kunnamkulam.jpg' },
    { name: 'Diocese of Malabar', href: '/mosc-old/dioceses/diocese-of-malabar', excerpt: 'The Malabar Diocese, which extends across the western districts of Kerala, was formed in 1953. H.G. Paulose Mar Severios and H.G. Pathrose Mar Osthathios (1953–68) have executed its administration.', image: '/images/dioceses/malabar_diocese.png' },
    { name: 'Diocese of Sulthan Bathery', href: '/mosc-old/dioceses/diocese-of-sulthan-bathery-diocese', excerpt: 'In 1986, the diocese of Sultan Bathery was formed by organising all the churches from the District of Wayanad, some of the churches from the Nilagiri District of Tamilnadu and some from Karnataka.', image: '/images/dioceses/sulthan_bathery_diocese.jpg' },
    { name: 'Diocese of Brahamavar', href: '/mosc-old/dioceses/diocese-of-brahamavar', excerpt: 'The Diocese of Brahmavar was formed in August 2010 and was announced by His Holiness Baselios Marthoma Didymus I through the Kalpana No.389/2010 dated 3-8-2010. The formation was with the goal of shepherding the faithful in the region.', image: '/images/dioceses/bhramavar_diocese.jpg' },
    { name: 'Diocese of Madras', href: '/mosc-old/dioceses/diocese-of-chennai-diocese', excerpt: 'Madras City, hallowed and blessed by the martyrdom of St. Thomas the Apostle, has been the Headquarters of the Madras Diocese belonging to the Orthodox Church of India for many decades.', image: '/images/dioceses/madras_diocese.jpg' },
    { name: 'Diocese of Bangalore', href: '/mosc-old/dioceses/diocese-of-bangalore', excerpt: 'Dioceses in the history of the Malankara Orthodox Syrian Church were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H. Patriarch Mar Peter III divided the Malankara Church into dioceses.', image: '/images/dioceses/diocese-of-bangalore.jpg' },
    { name: 'Diocese of Bombay', href: '/mosc-old/dioceses/diocese-of-mumbai', excerpt: 'The Diocese of Bombay was carved out of the outside Kerala diocese of the Malankara Orthodox Syrian Church in the year 1976. His Grace Dr. Thomas Mar Makarios was the first Metropolitan of the Diocese.', image: '/images/dioceses/diocese-of-mumbai.jpg' },
    { name: 'Diocese of Calcutta', href: '/mosc-old/dioceses/diocese-of-calcutta', excerpt: 'Dioceses in the history of the Malankara Orthodox Syrian Church were formed for the first time in 1876 consequent to the Mulanthuruthy Synod. H.H. Patriarch Mar Peter III divided the Malankara Church. Calcutta Diocese serves the faithful in the region.', image: '/images/dioceses/culcutta_diocese.jpg' },
    { name: 'Diocese of Delhi', href: '/mosc-old/dioceses/diocese-of-delhi', excerpt: 'Once the nucleus of the Orthodox Church in north India was formed in the capital of the country, the growth of parishes in adjacent centres was rapid and the establishment of the Delhi Diocese followed.', image: '/images/dioceses/diocese-of-delhi.jpg' },
    { name: 'Diocese of Ahmedabad', href: '/mosc-old/dioceses/diocese-of-ahmedabad', excerpt: 'The Diocese of Ahmedabad came into existence vide Kalpana No 93/2009 dated March 2, 2009 of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan.', image: '/images/dioceses/ahmedabad_diocese.jpg' },
    { name: 'Diocese of Northeast America', href: '/mosc-old/dioceses/northeast-america', excerpt: 'The history of the Malankara Orthodox Syrian Church of the East in the U.S.A. begins approximately in the mid 20th century. During this period, a number of prominent priests and lay people helped establish the Church in America.', image: '/images/dioceses/northeast_america_diocese.jpg' },
    { name: 'Diocese of South West America', href: '/mosc-old/dioceses/diocese-of-south-west-america', excerpt: 'The Diocese was formed by order number 145/2009 signed by the then Catholicos of the Apostolic Throne of St. Thomas and Malankara Metropolitan, His Holiness Baselios Mar Thoma Didymos I.', image: '/images/dioceses/southwest_america_diocese.jpg' },
    { name: 'Diocese of UK Europe and Africa', href: '/mosc-old/dioceses/diocese-of-uk-europe-and-africa', excerpt: 'Diocese of the Indian Orthodox Church, UK Europe and Africa is acting as the umbrella organisation for various Indian Orthodox parishes in the UK, Rest of Europe and African Continent.', image: '/images/dioceses/diocese-of-uk-europe-and-africa.jpg' }
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Dioceses">🗺️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Dioceses of the Malankara Orthodox Syrian Church
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our church is organized into dioceses across India and worldwide, each serving local communities
              while maintaining unity with the global Orthodox family.
            </p>
          </div>
        </div>
      </section>

      {/* Dioceses cards - like mosc.in/dioceses (image, title, excerpt, Read More) */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Dioceses
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The Malankara Orthodox Syrian Church is organized into dioceses that serve communities
              across different regions, ensuring spiritual care and administrative support for all members.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {dioceseCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-background rounded-lg sacred-shadow p-0 overflow-hidden hover:sacred-shadow-lg reverent-transition group flex flex-col"
              >
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {card.name}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-4">
                    {card.excerpt}
                  </p>
                  <div className="mt-auto pt-4">
                    <span className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary">
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

      {/* Diocese Information */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
                About Our Dioceses
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
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

            <div className="bg-card rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-4">
                Diocese Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Total Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">30</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Kerala Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">21</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Indian Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">International Dioceses</span>
                  <span className="font-heading font-semibold text-foreground">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-body text-muted-foreground">Total Parishes</span>
                  <span className="font-heading font-semibold text-foreground">2000+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiocesesPage;














