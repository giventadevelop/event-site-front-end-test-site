import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'Theology',
  description:
    'The main Doctrines of the Church. The Malankara Orthodox Church has pillars of Mystery through which it teaches and demonstrates its basic religious belief, with Biblical foundation.',
};

export default async function TheologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Theology" breadcrumbFrom={breadcrumbFrom} />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained */}
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/theology.jpg"
                      alt="Theology - Main Doctrines of the Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
                    The Main Doctrines of the Church
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    The Malankara Orthodox Church has pillars of Mystery through which it teaches
                    and demonstrates its basic religious belief. They are called pillars due to the
                    fact that they support and strengthen the faithful in their life as a pillar
                    supports a roof. These pillars have Biblical foundation.
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    Scripture and Tradition
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Tradition constitutes the Christian faith. It can be denoted as the act by which
                    something is handed down from ancestors to posterity. The Orthodox churches hold
                    the view that apart from the Holy Scripture, other sources of divine revelation
                    manifested through the incarnate Jesus also form part of what churches believe
                    and practice today. As social creatures, human beings depend not only on a
                    contemporary group or literal writings, but also on earlier generations and their
                    living conditions. They receive a heritage from a rich and diversified heritage,
                    which may be called tradition. However, when we assume the terminology
                    ecclesiologically, the concept has deeper and wide meanings. There could be a
                    fundamental difference between tradition and traditions even. When traditions
                    cover the concepts and practices which were handed down from ancestors,
                    tradition embodies the integral part of everything—it includes all the
                    socio-economic and religious background in its integrity. When we transfer this
                    aspect into ecclesiology, we reach the point that &quot;the Church itself is
                    in the traditions.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    What is Holy Scripture?
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Scripture is the sacred book that reveals the divine plan of Salvation
                    in Jesus, which God the Father began in the Old Testament times. The Holy
                    Scripture relates the history of salvation revealed to Israel (OT) and the
                    church (NT) for the benefit of the whole humanity.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The OT and NT are Holy Scripture. The OT predicted and expected a Saviour, the
                    Messiah, in the fullness of time. In the incarnation of Jesus, the prediction of
                    the OT—one part of the Holy Scripture—was fulfilled. This fulfilment was
                    recorded and preserved in literary form, which is the NT.
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    Why the Holy Scripture?
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Thus, since the NT reveals God through Jesus Christ, the Bible is holy scripture.
                    According to the Church, God inspires the Holy Scripture. Therefore, the
                    scripture is true, sacred, infallible and normative. In this sense, the Holy
                    Scripture is a divine book.
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    Divine Inspiration of the Scripture
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Scripture has divine origin. The inspired men of God under divine
                    direction speak God&apos;s word or write it (cf. Ezekiel 3:4; Acts 1:16, 4:25;
                    Rev. 2:1, 8, 15). The divine mysteries were revealed by God to persons who were
                    then under spiritual compulsion to speak or to write. Consequently, the
                    creative intuition of the writer is reflected in the Holy Scripture. In other
                    words, the scripture reflects divine charisma by which the inspired words of God
                    are written.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The divine inspiration is stated in the Bible as St. Peter, the chief of the
                    apostles, says: &quot;First of all you must understand this, that no prophecy
                    of scripture is a matter of one&apos;s own interpretation, because no prophecy
                    ever came by human will, but men and women moved by the Holy Spirit spoke from
                    God&quot; (II Pt. 1:20–21).
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    The Formation of OT and NT
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The formation of both OT and NT has a long history. The primitive Church
                    recognised the OT as divinely inspired and the Church needed the same for the
                    expectation of Jesus as the promised Messiah. The preaching in Acts testifies to
                    this fact. This means that the NT is the image and vision of the shadow in the
                    OT.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The NT scripture contains a variety of writings: gospels, narration of the
                    apostles&apos; acts, letters, apocalypse, church orders, etc. The Christian
                    community was in essence not a &quot;bookish&quot; one. It was called into
                    existence by a series of events well remembered. The Church made use of the OT
                    scripture for the benefit of the Christian community. The apostle Paul says,
                    &quot;All scripture is inspired by God and is useful for teaching, for reproof,
                    for correction and for training in righteousness, so that everyone who belongs to
                    God may be proficient, equipped for every good work&quot; (2 Tim 3:16–17).
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Hence, Holy Scripture is a development within the living community, that is, the
                    Church. The community is the apostolic community. They had used the OT to
                    explain the holy tradition and to explain Jesus. Likewise, we rely on the
                    apostolic teaching and their tradition. The Church&apos;s way of outlook is
                    cyclic, and hence the tradition comes within the Church and not from any
                    outside source. When we gather everything in its integrity, we understand that
                    the Church itself is the tradition.
                  </p>

                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                    Tradition and Traditions
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Tradition is, to be exact, a bond between the present and the past. The Greek
                    word used is <em>parodosis</em>, meaning handing down, or to hand over, to
                    deliver. Since it is a bond, there is certainly a relation within the Church—a
                    cyclic one. Apostolic teachings are there which substantiate the concept of
                    tradition and its need in the Church.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-6 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      <strong>I Cor. 11:2</strong> says: &quot;I commend you because you remember me
                      in everything and maintain the traditions just as I handed them on to you.&quot;
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                      <strong>II Thes. 2:15</strong> says: &quot;So then, brothers and sisters, stand
                      firm and hold fast to the traditions that you were taught by us, either by word
                      of mouth or by our letter.&quot;
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Hence, tradition includes tradition of mouth also. The advice by words that was
                    observed by posterity may not be found in the Holy Scripture. This does not mean
                    that the Holy Scripture is imperfect. It is perfect in itself, but the Church has
                    the responsibility to observe and hand over the tradition in the Church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    However, in traditions, all minute observances and ceremonies may arise. There
                    could be certain factors that are set apart. Tradition includes all traditions,
                    but the tradition may not include every tradition in its integrity. What Paul
                    meant in II Thes. 2:15 and in I Cor. 11:2 about &apos;traditions&apos; is its
                    integral aspect—that is, the Church itself. It is within this
                    &apos;tradition&apos;, and all &quot;traditions&quot; in their integral aspect,
                    that the Holy Scripture was formulated, and not the Holy Scripture that formed
                    the Church. Behind every literal work, there lies an oral or written tradition.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The &apos;rabbis&apos; in the NT made a distinction between the written Torah
                    and oral tradition. The NT designates this unwritten tradition as the
                    &quot;tradition of the elders&quot; (Mt. 15:2). Paul&apos;s expression
                    &quot;the tradition of my fathers&quot; (Gal. 1:14) refers to both written and
                    unwritten. Again, &quot;the custom of our fathers&quot; (Acts 28:17; 6:14; 15:1;
                    21:21) and &quot;the law of our fathers&quot; (Acts 23:3) have the same meaning.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center">
                      Our Church gives equal importance to both the Holy Scripture and the tradition.
                      The Church believes that it is dangerous and wrong to give too much importance
                      to any one of them while neglecting concern for the other.
                    </p>
                  </div>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
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

