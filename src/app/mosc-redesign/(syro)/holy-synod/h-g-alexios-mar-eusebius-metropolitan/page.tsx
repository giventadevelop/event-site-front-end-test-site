import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Alexios Mar Eusebius Metropolitan',
  description: 'His Grace Alexios Mar Eusebius, Metropolitan of Calcutta Diocese. Former first Metropolitan of South-west America; Old Testament scholar and author of Vachanathejas.',
};

const HGAlexiosMarEusebiusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Alexios Mar Eusebius Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <Image src="/images/holy-synod/eusebius.jpg" alt="H. G. Alexios Mar Eusebius Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Alexios Mar Eusebius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace Alexios Mar Eusebius, formerly Rev. Fr. Alex Daniel is a member of St. George Orthodox Church, Puthoor of Kollam Diocese. Thirumeni hails from Vattakkattu family, Puthoor. His Grace was born on 5th September, 1964 as the fourth son of late Sri Y. Daniel and Smt. Chinnamma Daniel. The late Rev. Fr. V.J. Jacob Vattakkattu is his paternal uncle.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace graduated from Kerala University with Bachelor’s degree in Science. He then joined Bangalore University for legal studies and secured LL.B. After completing his secular studies, he devoted himself for theological studies and joined the Orthodox Theological seminary, Kottayam. He completed Graduation in Sacred Theology from Orthodox Theological seminary and Bachelor of Divinity from Serampore University, Calcutta. Pursuing his post-graduation, he secured Master’s Degree in Theology from St. Peter’s Pontifical Institute of Theology, Bangalore. He acquired a Diploma in Biblical Geography from Tantur Ecumenical Institute, Jerusalem and conducted his Doctoral Research Study in Old Testament from Friedrich Alexander University, Germany. He also practiced as a Civil Lawyer in the District Court of Kollam in 1994-95.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        On May 15,1993 he was ordained as a deacon and on 4th May 1995, H.H. Baselios Marthoma Mathews II ordained him to the priesthood. As a priest he has served the parishes in Bangalore, Germany and in the Calcutta diocese.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        In 1997, His Grace was appointed as the faculty of Old Testament in St. Thomas Orthodox Theological Seminary, Nagpur. During the period as the faculty (1997-2008) he served in different capacities like Warden, Director of Fieldwork and Bursar of the seminary.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        He has also served as the treasurer of the Orthodox Sunday School Association of the East (Outside Kerala Region), Director of Akhila Malankara Orthodox Shushrushaka Sangam (AMOSS - OKR), Director of OVBS (OKR) and as Treasurer of Prerana School for Mentally Challenged Children, Nagpur.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace handled the regular columns in the Malankara Sabha, Sahayatra, Parish Mission Literatures for the Outside Kerala Region. He has authored a book in Malayalam named “Vachanathejas”, a compilation of Sunday Sermons for a complete liturgical year. His Grace has served and represented the Church in Ecumenical Conferences in India as well as abroad.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        The Malankara Syrian Christian association held at Pampakuda on 2008 September 11 elected him with six others to be metropolitans of the church. On 2009 February 19 H.H. Baselios Marthoma Didymos I Catholicos with the assistance of the holy Episcopal synod, ordained him as Metropolitan along with the six other candidates at Puthupally St. George Orthodox Church.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        When the Diocese of South-west America was formed in 2009, His Grace was appointed as the first Metropolitan of that Diocese from April 1, 2009. He took leadership in building the Diocese from scratch. The beautiful diocesan center at Beasley, Houston in 100 Acres is one of the greatest achievements in his time. A Liturgical Resource Development Committee was formed and initiated to translate all our liturgical books to English Language. About 15 new churches and congregations were established in the cities where the Malankara Orthodox church Mission had not yet started.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        From 2022 November onwards, His Grace is serving as the Metropolitan of the Calcutta Diocese. Apart from the administrative responsibilities of the diocese H.G. Mar Eusebius currently holds the office of the vice president of Kerala Council of Churches.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>St Thomas Ashram, Kailash Nagar, Bhilai, Chhattisgarh – 490 001</p>
                        <p>Telephone: +91 8547058607</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:mareusebius@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mareusebius@gmail.com
                        </a>
                      </p>
                      </div>
                    </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HGAlexiosMarEusebiusMetropolitanPage;
