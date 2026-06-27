import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Abraham Mar Seraphim Metropolitan',
  description: 'Biography and information about H.G. Dr. Abraham Mar Seraphim Metropolitan.',
};

const HGDrAbrahamMarSeraphimMetropolitanPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/sera.png"
                        alt="H.G. Dr. Abraham Mar Seraphim Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H.G. Dr. Abraham Mar Seraphim Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 28 December 1969 as the son of Mr. V. A. Mathews and Mrs. Annie Mathews,Vaduthala Puthenveedu, Mathoor. He is a member of St. George Orthodox Valiyapally, Thumpamon Eram, under the Thumpamon Diocese. His academic journey began at Mahatma Gandhi University, where he earned a Bachelor’s Degree in Mathematics. He pursued theological studies at the Orthodox Theological Seminary, Kottayam, obtaining a Graduate Degree in Sacred Theology and a Bachelor of Divinity from the Senate of Serampore University. Furthering his education abroad, he earned a Master of Theology (M.Th.) from Dharmaram Theological College, Bangalore, and a Doctor of Theology (D.Th.) from Chicago Theological Seminary, USA. His writings and radical, spiritually profound speeches reflect his deep theological insight, inspiring audiences with messages of love, compassion, and faith. His Grace has held several key positions in the church, including: General Secretary, Mar Gregorios Orthodox Christian Movement of India Member, Managing Committee, Orthodox Church Member, Governing Board, Thadakam Ashram, Coimbatore Director, Santhinilayam Counselling Centre, Pathanamthitta On 17 February 2010, he was elected as a Metropolitan candidate at the The Malankara Association in Sasthamkotta and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. He served as the first Metropolitan of the Bangalore Diocese from 2010 to 2023 and has been the Metropolitan of the Thumpamon Diocese since 27 September 2023. He currently serves as President of: Mar Gregorios Orthodox Christian Student Movement (MGOCSM) ARDRA Charitable Society Contact Information: Basil Aramana, Makkamkunnu, Pathanamthitta P.O.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: marseraphim@gmail.com, thumpamon2023@gmail.com
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Phone: 9447963528
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          His Grace was born on 28 December 1969 as the son of Mr. V. A. Mathews and Mrs. Annie Mathews,Vaduthala Puthenveedu, Mathoor. He is a member of St. George Orthodox Valiyapally, Thumpamon Eram, under the Thumpamon Diocese. His academic journey began at Mahatma Gandhi University, where he earned a Bachelor’s Degree in Mathematics. He pursued theological studies at the Orthodox Theological Seminary, Kottayam, obtaining a Graduate Degree in Sacred Theology and a Bachelor of Divinity from the Senate of Serampore University. Furthering his education abroad, he earned a Master of Theology (M.Th.) from Dharmaram Theological College, Bangalore, and a Doctor of Theology (D.Th.) from Chicago Theological Seminary, USA. His writings and radical, spiritually profound speeches reflect his deep theological insight, inspiring audiences with messages of love, compassion, and faith. His Grace has held several key positions in the church, including: General Secretary, Mar Gregorios Orthodox Christian Movement of India Member, Managing Committee, Orthodox Church Member, Governing Board, Thadakam Ashram, Coimbatore Director, Santhinilayam Counselling Centre, Pathanamthitta On 17 February 2010, he was elected as a Metropolitan candidate at the The Malankara Association in Sasthamkotta and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. He served as the first Metropolitan of the Bangalore Diocese from 2010 to 2023 and has been the Metropolitan of the Thumpamon Diocese since 27 September 2023. He currently serves as President of: Mar Gregorios Orthodox Christian Student Movement (MGOCSM) ARDRA Charitable Society Contact Information: Basil Aramana, Makkamkunnu, Pathanamthitta P.O. Email: marseraphim@gmail.com, thumpamon2023@gmail.com Phone: 9447963528
                        </p>
                      </div>
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
            <div className="lg:col-span-1">
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

export default HGDrAbrahamMarSeraphimMetropolitanPage;
