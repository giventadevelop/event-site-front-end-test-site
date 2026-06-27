import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Oriental Orthodox',
  description: 'Learn about the oriental orthodox relations of the Malankara Orthodox Syrian Church.',
};

const orientalorthodoxPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Oriental Orthodox" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/ecumenical/oriental-orthodox.jpg"
                    alt="Oriental Orthodox"
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Relation between Orthodox Churches
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Malankara Orthodox Church has always tried to cooperate with the communities which encircled her absorbing the imitable things from them. From the very inception, she also cooperated with the ecumenical movement formed to foster love and fellowship among the Christian Churches of the world. Malankara Church was one of the founder members of the World Council of Churches formed in 1948. There are many milestones in its long history which deserve special mention. The Church has conducted many dialogues and consultations consequently many agreements with the CSI, Marthoma Churches and Roman Catholic, Lutheran and Byzantine Orthodox Churches have been arrived at. Besides this, many prelates and ecclesiastical delegates from various Churches have visited Malankara and in turn His Holiness The Catholicos and official delegates have received their hospitalities as well.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The relation with the other Orthodox Churches has been galvanized by faithful dialogues and mutual visits. To strengthen our relations with the Oriental orthodox Churches we are partakers in dialogues and cooperative initiatives though all belong to the Orthodox family. Consequent on the unofficial consultations with the Byzantine Orthodox Churches in 1969, both these family of Churches have come closer and the dialogues have progressed to the official level. Things have come to a stage where both families acknowledge that there are no theological impediments for a union between them. The list of the prelates and the holy fathers from Oriental and Byzantine Orthodox Churches who visited Malankara is rather too long. The list includes the Armenian Orthodox Church heads Vazgen, Karekin, Aram, the Ethiopian Patriarch Abune Paulose, the Romanian Patriarchs Justinian, Theoktis, the Ecumenical PatriarchBartholomew, the Patriarch of Russian Orthodox Church Pimen I, the Patriarch of the Georgian Orthodox Church .
                    </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <EcumenicalSidebar />
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

export default orientalorthodoxPage;