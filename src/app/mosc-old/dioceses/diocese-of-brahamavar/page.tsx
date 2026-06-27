import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DiocesesQuickLinksNav from '../DiocesesQuickLinksNav';

export const metadata = {
  title: 'Diocese of Brahamavar',
  description: 'Learn about the Diocese of Brahamavar of the Malankara Orthodox Syrian Church.',
};

const dioceseofbrahamavarPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Diocese">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Diocese of Brahamavar
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kerala Diocese of the Malankara Orthodox Syrian Church
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/dioceses/bhramavar_diocese.jpg"
                    alt="Diocese of Brahamavar"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
                    Diocese of Brahamavar
                  </h2>

                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese of Brahmavar was formed in August, 2010 and was announced by His Holiness Baselios Marthoma Didymus I through the Kalpana No.389/2010 dated 3-8-201. The formation was with the counsel of the Malankara Syrian Christian Association Managing Committee held on 3-8-2010 and with the recommendation of the Holy Episcopal Synod held on 3-8-2010.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Metropolitan.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Metropolitan H G Yakob Mar Elias was appointed as the Metropolitan of this newly constituted Diocese, with it's head quarters at Mangalore, by His Holiness Baselios Marthoma Didymus I through the Kalpana No.396/2010 dated 4-8-2010.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Features of the Diocese
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Smallest in size and weakest in financial background, this Diocese is growing and developing by the Grace of God and through the prayers and help of faithful priests and people of all the parishes, especially of St. George Orthodox Cathedral Abu Dhabi, and with the help of many well-wishers and friends. This Diocese is unique in terms of diversities of culture, language and region. It is spread over Cannoor and Kasaragod in Kerala, Dakshina Kannada, Uduppi, Chikmangalore and Coorg in Karnataka, Goa and Abu Dhabi in UAE. Languages used are Malayalam, Konkani, Kannada, Tulu, English and Hindi. Brahmavar Diocese is very unique also because of our Konkani Orthodox Community with our Konkani Priests. Konkani Community is the only non Malayali community in our Church .Konkani Orthodox members are with the Malankara Orthodox Church due to the vision and mission of two saintly and dedicated Roman Catholic priests, 125 years ago, who accepted our Church and faith. They were Revd. Fr. Antonio Franscico Xavier Alvaris who was consecrated later as Metropolitan Alvares Mar Julius I and Revd. Fr. Roque Zephrin Noronah.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Parishes, Chapels, Congregations, Students Centres.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Parishes. Brahmavar Diocese is blessed with 35 parishes: 16 in Kerala; 16 in Karnataka; 2 in Goa; 1 in UAE. Only 11 Parishes have more than 50 families. Total number of families is 2800 of these parishes special mention should be made about: St. Mary's Orthodox Church, Panaji, Goa, where Blessed Metropolitan St. Alvares Mar Julius I is entombed; St. George Orthodox Church, Georgian Pilgrim Centre Ichilampady; Brahmavar Orthodox Cathedral; St. George Orthodox Cathedral, Abu Dhabi;
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Of the 9 Chapels 6 belong to Konkani Community and 3 to Malayali Community. We have 5 very active Konkani congregations at Mandya, Bangalore, Mumbai, Kuwait and UAE.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      This Diocese is blessed with a good number of professional students. Students' ministry is progressing and developing at different centres including, Mangalore, Manipal, Moodubidri, Shimoga, Kasarsgod,and Sullia.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Priests, Deacons and Seminarians
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Priests. 29 Priests are in the Diocese including one Cor- Episcopa and one Ramban. Two Deacons have finished Seminary training and education. Three students are in the Seminary. The Diocese is in need of the services of 15 more priests for it's efficient and full fledged ministry. Priests are taking special interest in the Spiritual Organizations and charitable services.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Teaching Ministry.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Diocese is very keen in keeping it as a very Oriental orthodox Christian Green Zone in it's understanding and practice of the Holy Church, Ministry and Mysteries or Sacraments. The Metropolitan is taking special interest in teaching and spreading the Orthodox Christian Way of Life, understanding of Holy Tradition including H. Bible and H. Faith. It is available and accessible in You Tube with the caption; Learning Orthodoxy with Mar Elias, both Malayalam and English.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Vision
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      We pray to God that He may help us develop Mangalore as the administrative centre, Brahmavar as the Spiritual and Monastic Centre and Goa as the Pilgrim Centre.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Prayer and Thanks
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      The Priests, faithful People, Diocesan General Assembly, Brahmavar Diocese Development Commitees, including one in Abu Dhabi, Malankara Association Managing Committee members, Diocesan Council Members and Many well wishers and friends are praying and helping for the development of this Diocese. We remember with prayer and thanks all of them. The Diocese is ever thankful to God ,and grateful to all the members of the Holy Church, to His Holiness Bava Thirumeni and to all the members of the Holy Episcopal Synod. We prayerfully remember all Our departed Metropolitans and priests who had served all the parishes in this Diocese. We beseech the prayers and intercessions of Holy and Blessed Virgin Mary, The Theotokos, St. Thomas, St. Gregorios of Parumala, St. Dionysius, St. Yeldho Mar Baselios and all other saints and the late Blessed Arch Bishop St. Alvares Mar Julius I.
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Contact Address: Office : Mount Horeb Bishop's House,
Balikashram Road, Kankanady,
Mangalore - 575 002
Karnataka, India
Ph: 0824 2210018 & 09483530018
                    </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                      Website:http://www.moscdob.com/index.php
                    </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                  Dioceses
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-old/dioceses" 
                    className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                  >
                    Dioceses Overview
                  </Link>
                  <div className="border-t border-border my-2"></div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Kerala Dioceses
                  </div>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thiruvananthapuram-diocese" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thiruvananthapuram
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kollam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kollam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottarakara-punalur" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottarakara – Punalur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-adoor-kadampanadu" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Adoor – Kadampanadu
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thumpamon" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thumpamon
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-mavelikara" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Mavelikara
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-chengannur" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Chengannur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-niranam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Niranam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-nilackal" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Nilackal
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottayam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottayam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kottayam-central" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kottayam Central
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-idukki" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Idukki
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kandanad-east" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kandanad East
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kandanad-west" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kandanad West
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-ankamaly" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Ankamaly
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kochi" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kochi
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-thrissur" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Thrissur
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-kunnamkulam" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Kunnamkulam
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-malabar" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Malabar
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-sulthan-bathery-diocese" 
                      className="block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Sulthan Bathery
                    </Link>
                  <Link 
                      href="/mosc-old/dioceses/diocese-of-brahamavar" 
                      className="block px-3 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm reverent-transition"
                    >
                      Diocese of Brahamavar
                    </Link>
                </nav>
              </div>

              {/* Quick Links - desktop only in sidebar */}
              <div className="hidden lg:block">
                <DiocesesQuickLinksNav />
              </div>
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <DiocesesQuickLinksNav />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofbrahamavarPage;