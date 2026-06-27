import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'St. Thomas Orthodox Vaidika Sanghom | MOSC',
  description: 'St. Thomas Orthodox Vaidhika Sanghom (STOVS) is the clergy association of the Malankara Orthodox Church. President H. G. Dr. Mathews Mar Thimothios Metropolitan.',
};

const StThomasOrthodoxVaidikaSanghomPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="St. Thomas Orthodox Vaidika Sanghom">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              St. Thomas Orthodox Vaidika Sanghom
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The antecedents of the St. Thomas Orthodox Vaidhika Sanghom can be traced back to the period of St. Gregorios of Parumala. It was revived and formally organized in 1983 as the clergy association of the Malankara Orthodox Church.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                    The Saint, whose organizational skills and vision for the Malankara Orthodox Church were exceptional, called together the first meeting of the Church&apos;s priests into an association. It was revived again during the days of Joseph Mar Dionysius II, the founder of the M.D. Seminary. The more recent chapter can be placed in 1983 when the clergy were formally called together and proposed the name The St. Thomas Orthodox Vaidhika Sanghom (The St. Thomas Orthodox Clergy Association). Its first meeting was held at the St. Peter&apos;s & St. Paul&apos;s Church, Parumala under the guidance of H.G.Dr. Paulos Mar Gregorios and was presided over by the then Catholicos, H.H. Moran Mar Baselios Marthoma Mathews I.
                  </p>
                  <p>
                    The meeting formally adopted a constitution. The Association would be constituted of all the ordained priests of the Malankara Orthodox Church in good standing. A Clergy Endowment would be instituted. STOVS would hold a general assembly meeting once every three years, and it would print a magazine &quot;The Purohithan&quot; thrice a year. The working of STOVS was to be guided by the President, two Vice-Presidents, the General Secretary, Joint Secretary and a Council.
                  </p>
                  <p>
                    STOVS conducts Triennial General Assembly, Regional Meetings, publishes The Purohithan journal, and maintains the Clergy Welfare Fund for medical relief of priests and their immediate family members.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    Contact Address
                  </h3>
                  <h4 className="font-heading font-semibold text-lg text-foreground mt-4">President</h4>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Mathews Mar Thimothios Metropolitan
                  </p>
                  <p className="font-body text-muted-foreground">
                    STOVS Office, PB No. 98, Kottayam, 686001
                  </p>

                  <h4 className="font-heading font-semibold text-lg text-foreground mt-6">General Secretary</h4>
                  <p className="font-body text-muted-foreground">
                    Rev. Fr. Dr. Ninan V. George
                  </p>
                  <p className="font-body text-muted-foreground">
                    Mob: +91 9447471641
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:admin@orthodoxvaidikasanghom.org" className="text-primary hover:underline">
                      admin@orthodoxvaidikasanghom.org
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    Website:{' '}
                    <a href="https://www.orthodoxvaidikasanghom.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.orthodoxvaidikasanghom.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/st-thomas-orthodox-vaidika-sanghom" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default StThomasOrthodoxVaidikaSanghomPage;
