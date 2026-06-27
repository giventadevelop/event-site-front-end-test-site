import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican',
  description:
    'Speech of His Holiness Baselios Marthoma Paulose II at the meeting with Pope Francis at Vatican. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const CatholicosSpeechVaticanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Catholicos Speech at Vatican" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/rm.jpg"
                    alt="Meeting with Pope Francis at Vatican"
                    width={175} height={175}
                    className="rounded-lg w-auto h-auto object-contain max-w-full block mx-auto"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-6">
                    <p>
                      Your Holiness, most Venerable Brother in Christ, Praising the Triune God, let
                      me humbly greet Your Holiness in the name of the Bishops, Clergy and the
                      Faithful of the Malankara Orthodox Syrian Church of India. I thank God for
                      this occasion for us to meet each other in the first year of your blessed
                      pontificate, in this city sanctified by the martyrdom of the holy Apostles
                      Peter and Paul. People of goodwill everywhere are rejoicing in the gracious
                      words of Your Holiness and the way in which you exemplify the pastoral
                      ministry of Christ our Good Shepherd.
                    </p>

                    <p>
                      Your Holiness. The Malankara Orthodox Church, faithfully rooted in the
                      apostolic tradition of the holy Apostle Thomas in India, is committed to the
                      true unity of our churches as willed by Jesus Christ our Lord and Saviour. In
                      the broader frame of unity of all Christians, I have a special dream for the
                      unity of Christians in the St Thomas tradition. Wherever possible and
                      appropriate, we are willing to cooperate with our sister churches in
                      ministering to the pastoral needs of the people, particularly the poor and the
                      marginalised. Some of the present pastoral issues may be resolved on the basis
                      of the common tradition that existed before the unfortunate division in the
                      Indian church in the 16th century.
                    </p>

                    <p>
                      Although Christians are a small minority in India and Asia in general we
                      have the great task of witnessing to the life giving Gospel of Christ by
                      caring for the poor and the downtrodden, by nurturing peace, justice and
                      communal harmony and by working with and learning from the great
                      spiritual-ethical traditions of India. In all this the Indian Catholic and
                      Orthodox churches can fruitfully cooperate in the bond of love.
                    </p>

                    <p>
                      My venerable Elder Brother in Christ, I gladly join Your Holiness in your
                      deep prayer for peace in our world, especially in Syria, the Middle East, and
                      Asia. With great joy and hope, we invite Your Holiness to visit India, and we
                      offer our humble prayers to God our Father that your blessed ministry may
                      continue to inspire our churches in the power of the Holy Spirit and bring
                      new hope for humanity at large. Glory be to the Father, the Son and the Holy
                      Spirit, One true God, now and for evermore. Amen.
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

export default CatholicosSpeechVaticanPage;
