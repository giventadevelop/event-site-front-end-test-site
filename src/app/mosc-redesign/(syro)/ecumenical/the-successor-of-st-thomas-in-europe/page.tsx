import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'The Successor of St. Thomas in Europe',
  description:
    'A grand reception accorded to His Holiness Baselios Marthoma Paulose II by the U. K. Europe Africa Diocese and Lambeth Palace, London — September 2013. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const SuccessorOfStThomasInEuropePage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Successor of St. Thomas in Europe" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-6">
                    <p>
                      A grand reception was accorded to His Holiness Baselios Marthoma Paulose II
                      by the U. K. Europe Africa Diocese and the Lambeth Palace of the Anglican
                      Church jointly on 9th September 2013 at Lambeth Palace, London, the
                      headquarters of the Anglican Church.
                    </p>

                    <p>
                      The special highlight during this ecclesiastical visit was an exhibition in
                      honour of the Catholicos of the letters written by the supreme heads of
                      Malankara Orthodox Church to the Arch Bishops of Canterbury from time to
                      time from 1939 on the backdrop of the mutual relationship between these two
                      Churches. The credit of this exhibition goes to Mr. Gines Mantel Brott, the
                      Lambeth Librarian.
                    </p>

                    <p>
                      The Catholicos discussed with Bishop Jeffrey Rowell, the co-chairman of
                      Anglican-Oriental Orthodox Dialogue and Christopher Chessun, the Bishop of
                      Southwark Diocese, London about need, possibilities and arrangements of
                      resuming the Dialogue between Oriental Orthodox and Anglican Church which
                      halted temporarily in 2003. Discussions were also made to explore the
                      possibilities and opportunities for higher studies and research in history
                      and theology. It was decided to discover platforms for studies and dialogue
                      between these two Churches by the respective ecumenical departments.
                    </p>

                    <p>
                      Following this, Bishop Angelos (the Bishop of the Coptic Orthodox Church in
                      London), Abba Seraphim (the supreme head of the British Orthodox Church under
                      the Coptic Orthodox Church), Bishop Vahan (President of the Council of
                      Oriental Orthodox Churches in England and the Bishop of the Armenian
                      Orthodox Church), Bishop Antonios (Ethiopian Orthodox Church), the Bishop
                      of the Eritrean Orthodox Church met the Catholicos as a group at Lambeth
                      Palace. Nearly sixty distinguished leaders representing various Christian
                      ecumenical bodies in England and Wales attended the historic meeting.
                    </p>

                    <p className="font-syro-primary text-sm text-syro-dark-gray pt-4 border-t border-syro-table-border">
                      Dr. Mathews Mar Thimotheos Metropolitan, Diocese of U. K., Europe and Africa
                    </p>
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

export default SuccessorOfStThomasInEuropePage;
