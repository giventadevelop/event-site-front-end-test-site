import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import EcumenicalSidebar from '../../components/EcumenicalSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican',
  description:
    'Speech of His Holiness Pope Francis at the meeting with the Catholicos at Vatican. Ecumenical relations of the Malankara Orthodox Syrian Church.',
};

const PopeFrancisSpeechVaticanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Pope Francis Speech at Vatican" breadcrumbFrom="ecumenical" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/mosc/ecumenical/rm1.jpg"
                    alt="Meeting with Pope Francis at Vatican"
                    width={175} height={175}
                    className="rounded-lg w-auto h-auto object-contain max-w-full block mx-auto"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-6">
                    <p>
                      Your Holiness, It is a joy for me to meet Your Holiness and the distinguished
                      delegation of the Malankara Orthodox Syrian Church. Through you, I greet a
                      Church that was founded upon the witness, even to martyrdom, that Saint Thomas
                      gave to Our Lord Jesus Christ. The apostolic fraternity which united the
                      first disciples in their service of the Gospel, today also unites our
                      Churches, notwithstanding the many divisions that have arisen in the
                      sometimes sad course of history, divisions which, thanks be to God, we are
                      endeavouring to overcome in obedience to Lord&apos;s will and desire (cf. Jn
                      17:21). The Apostle Thomas exclaimed, &quot;My Lord and my God!&quot; (Jn 20:28)
                      with one of the most beautiful confessions of faith in Christ handed down by
                      the Gospels, a faith which proclaims the divinity of Christ, his lordship in
                      our lives, and his victory over sin and death through his resurrection. This
                      event is so real that Saint Thomas is invited to touch for himself the actual
                      marks of the crucified and risen Jesus (cf. Jn 20:27). It is precisely in
                      this faith that we meet each other: it is this faith that unites us, even if
                      we cannot yet share the Eucharistic table; and it is this faith which urges
                      us to continue and intensify the commitment to ecumenism, encounter and
                      dialogue towards full communion.
                    </p>

                    <p>
                      With deep affection I welcome Your Holiness and the members of your delegation
                      and I ask you to convey my cordial greetings to the Bishops, clergy and
                      faithful of the Malankara Orthodox Syrian Church. I also greet the
                      communities you are visiting in Europe. I wanted to recall some of the steps
                      in these 30 years of the growing closeness between us, because I believe that
                      on the ecumenical path it is important to look with trust to the steps that
                      have been completed, overcoming prejudices and closed attitudes which are
                      part of a kind of &quot;culture of clashes&quot; and source of division, and
                      giving way to a &quot;culture of encounter&quot;, which educates us for mutual
                      understanding and for working towards unity. Alone however, this is
                      impossible; our weaknesses and poverty slow the progress. For this reason,
                      it is important to intensify our prayer, because only the Holy Spirit with
                      his grace, his light and his warmth can melt our coldness and guide our
                      steps towards an ever greater brotherhood.
                    </p>

                    <p>
                      Prayer and commitment in order to let relationships of friendship and
                      cooperation grow at various levels, in the clergy, among the faithful, and
                      among the various churches born from the witness given by St Thomas. May the
                      Holy Spirit continue to enlighten us and guide us towards reconciliation and
                      harmony, overcoming all causes of division and rivalry which have marked our
                      past. Your Holiness, let us walk this path together, looking with trust
                      towards that day in which, with the help of God, we will be united at the
                      altar of Christ&apos;s sacrifice, in the fullness of Eucharistic communion.
                      Let us pray for one another, invoking the protection of Saint Peter and
                      Saint Thomas upon all the flock that has been entrusted to our pastoral
                      care. May they who worked together for the Gospel, intercede for us and
                      accompany the journey of our Churches.
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

export default PopeFrancisSpeechVaticanPage;
