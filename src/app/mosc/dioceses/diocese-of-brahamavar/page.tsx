import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Brahamavar',
  description: 'Learn about the Diocese of Brahamavar of the Malankara Orthodox Syrian Church.',
};

const dioceseofbrahamavarPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Brahamavar" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/bhramavar_diocese.jpg"
                    alt="Diocese of Brahamavar"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Brahamavar
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Brahmavar was formed in August, 2010 and was announced by His Holiness Baselios Marthoma Didymus I through the Kalpana No.389/2010 dated 3-8-201. The formation was with the counsel of the Malankara Syrian Christian Association Managing Committee held on 3-8-2010 and with the recommendation of the Holy Episcopal Synod held on 3-8-2010.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Metropolitan.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Metropolitan H G Yakob Mar Elias was appointed as the Metropolitan of this newly constituted Diocese, with it's head quarters at Mangalore, by His Holiness Baselios Marthoma Didymus I through the Kalpana No.396/2010 dated 4-8-2010.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Features of the Diocese
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Smallest in size and weakest in financial background, this Diocese is growing and developing by the Grace of God and through the prayers and help of faithful priests and people of all the parishes, especially of St. George Orthodox Cathedral Abu Dhabi, and with the help of many well-wishers and friends. This Diocese is unique in terms of diversities of culture, language and region. It is spread over Cannoor and Kasaragod in Kerala, Dakshina Kannada, Uduppi, Chikmangalore and Coorg in Karnataka, Goa and Abu Dhabi in UAE. Languages used are Malayalam, Konkani, Kannada, Tulu, English and Hindi. Brahmavar Diocese is very unique also because of our Konkani Orthodox Community with our Konkani Priests. Konkani Community is the only non Malayali community in our Church .Konkani Orthodox members are with the Malankara Orthodox Church due to the vision and mission of two saintly and dedicated Roman Catholic priests, 125 years ago, who accepted our Church and faith. They were Revd. Fr. Antonio Franscico Xavier Alvaris who was consecrated later as Metropolitan Alvares Mar Julius I and Revd. Fr. Roque Zephrin Noronah.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Parishes, Chapels, Congregations, Students Centres.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Parishes. Brahmavar Diocese is blessed with 35 parishes: 16 in Kerala; 16 in Karnataka; 2 in Goa; 1 in UAE. Only 11 Parishes have more than 50 families. Total number of families is 2800 of these parishes special mention should be made about: St. Mary's Orthodox Church, Panaji, Goa, where Blessed Metropolitan St. Alvares Mar Julius I is entombed; St. George Orthodox Church, Georgian Pilgrim Centre Ichilampady; Brahmavar Orthodox Cathedral; St. George Orthodox Cathedral, Abu Dhabi;
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Of the 9 Chapels 6 belong to Konkani Community and 3 to Malayali Community. We have 5 very active Konkani congregations at Mandya, Bangalore, Mumbai, Kuwait and UAE.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      This Diocese is blessed with a good number of professional students. Students' ministry is progressing and developing at different centres including, Mangalore, Manipal, Moodubidri, Shimoga, Kasarsgod,and Sullia.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Priests, Deacons and Seminarians
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Priests. 29 Priests are in the Diocese including one Cor- Episcopa and one Ramban. Two Deacons have finished Seminary training and education. Three students are in the Seminary. The Diocese is in need of the services of 15 more priests for it's efficient and full fledged ministry. Priests are taking special interest in the Spiritual Organizations and charitable services.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Teaching Ministry.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese is very keen in keeping it as a very Oriental orthodox Christian Green Zone in it's understanding and practice of the Holy Church, Ministry and Mysteries or Sacraments. The Metropolitan is taking special interest in teaching and spreading the Orthodox Christian Way of Life, understanding of Holy Tradition including H. Bible and H. Faith. It is available and accessible in You Tube with the caption; Learning Orthodoxy with Mar Elias, both Malayalam and English.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Vision
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      We pray to God that He may help us develop Mangalore as the administrative centre, Brahmavar as the Spiritual and Monastic Centre and Goa as the Pilgrim Centre.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Prayer and Thanks
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Priests, faithful People, Diocesan General Assembly, Brahmavar Diocese Development Commitees, including one in Abu Dhabi, Malankara Association Managing Committee members, Diocesan Council Members and Many well wishers and friends are praying and helping for the development of this Diocese. We remember with prayer and thanks all of them. The Diocese is ever thankful to God ,and grateful to all the members of the Holy Church, to His Holiness Bava Thirumeni and to all the members of the Holy Episcopal Synod. We prayerfully remember all Our departed Metropolitans and priests who had served all the parishes in this Diocese. We beseech the prayers and intercessions of Holy and Blessed Virgin Mary, The Theotokos, St. Thomas, St. Gregorios of Parumala, St. Dionysius, St. Yeldho Mar Baselios and all other saints and the late Blessed Arch Bishop St. Alvares Mar Julius I.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Contact Address:Â Office : Mount Horeb Bishop's House,
Balikashram Road,Â Kankanady,
Mangalore - 575 002
Karnataka, India
Ph: 0824 2210018 & 09483530018
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Website:http://www.moscdob.com/index.php
                    </p>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofbrahamavarPage;