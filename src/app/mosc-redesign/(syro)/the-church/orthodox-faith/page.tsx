import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import TheChurchSidebar from '../TheChurchSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Orthodox Faith',
  description: 'Understanding the Orthodox Christian faith and tradition.',
};

export default async function OrthodoxFaithPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Orthodox Faith" breadcrumbFrom={breadcrumbFrom} />

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
                    src="/images/church/orthodox-faith.jpg"
                    alt="Orthodox Faith"
                    width={125}
                    height={125}
                    className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain"
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    The Main Doctrines of the Church
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Orthodox Church has pillars of Mystery through which it teaches and 
                    demonstrates its basic religious belief. They are called pillars due to the fact 
                    that they support and strengthen the faithful in their life as a pillar supports 
                    a roof. These pillars have Biblical foundation.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Scripture and Tradition
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Tradition constitutes the Christian faith. It can be devoted as the act, by which 
                    something, which is handed down from ancestors of posterity. The Orthodox churches 
                    hold the view that apart from the Holy Scripture, other sources of divine revelation 
                    manifested through the incarnating Jesus also form part what churches believe and 
                    practice today. As social creatures, human beings depend not only on a contemporary 
                    group or literal writings, but also on earlier generations and their living conditions. 
                    They receive a heritage from a rich and diversified heritage, which may be called as 
                    tradition. However, when we assume the terminology ecclesiologically, the concept has 
                    deeper and wide meanings. There could be fundamental difference between tradition and 
                    traditions even. When traditions cover the concept and practices, which were handed down 
                    from ancestors, tradition, imbibe the integral part of everything that is it includes 
                    all the socio economic religion background in its integrity. When we transfer this aspect 
                    in ecclesiology, we will reach to the point that "Church itself in the traditions".
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    What is Holy Scripture?
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Scripture is the sacred book that reveals the divine plan of Salvation in Jesus, 
                    which God the Father has began in the Old Testament times. The Holy Scripture relates 
                    the history of salvation revealed to Israel (OT) and the church (NT) for the benefit 
                    of the whole humanity.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The OT and NT are Holy Scripture. The OT predicted and expected a saviour, the Messiah 
                    in the fullness of time. In the incarnation of Jesus, the prediction of OT, one part 
                    of the Holy Scripture was fulfilled. This fulfilment was recorded and preserved in 
                    literary form, which is the NT.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Why the Holy Scripture?
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Thus, since the NT reveals the God through Jesus Christ, the Bible is a holy scripture. 
                    According to the church, God inspires the Holy Scripture. Therefore, the scripture is 
                    true, Sacred and infallible and normative. In this sense, the Holy Scripture is a divine book.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Divine Inspiration of the Scripture
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Holy Scripture has divine origin. The inspired men of God under divine directions 
                    speak God's word or write it (cf. Ezekiel 3:4; Acts 1:16, 4:25; Rev. 2:1, 8, 15). 
                    The divine mysteries revealed by God to persons who then were under spiritual compulsion 
                    to speak or to write. Consequently, the creative intuition of the writer is reflected 
                    in the Holy Scripture. In other words, the scripture reflects divine charisma by which 
                    inspired words of God is written.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The divine inspiration is uttered in the Bible as St. Peter, the chief of the apostle 
                    says "First of all you must understand this, that no prophesy or scripture is a matter 
                    of ones own interpretation, because no prophesy ever come by human will, but men and 
                    women moved by Holy Spirit spoke from God" (II Pt. 1:20-21).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    The Formation of OT and NT
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The formation of both OT and NT has a long history. The primitive church realised the 
                    OT as divinely inspired and the church need the same for expectation of Jesus as the 
                    promised Messiah. The preaching in Acts testifies to this fact. This means that NT 
                    is the image vision of the shadow in OT.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The NT scripture continues variety of scripture as gospels, narration of apostles acts, 
                    letters, apocalypse, church orders etc. The Christian community was in essence not a 
                    "bookish" one. It was called into existence by a series of events well remembered. 
                    The church made use of the OT scripture for the benefit of the Christian community. 
                    The apostle Paul says, "All scripture is inspired by God and is useful for teaching, 
                    for reproof, for correction and for training in righteousness, so that everyone who 
                    belongs to God may be proficient, equipped for every good work".
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Hence, Holy Scripture is a development within the living community, that is, the church. 
                    The community is the apostolic community. They had used the OT to explain the holy 
                    tradition to explain Jesus. Likewise, we rely on the apostolic teaching and their 
                    tradition. The church's way of outlook is cyclic and hence the tradition comes within 
                    the church and not from any outside source. When we gather everything in its integrity, 
                    we understand that church itself is the tradition.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                    Tradition and Traditions
                  </h3>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Tradition is, to be exact, a bond between the present and the past. The Greek word used 
                    is "parodosis" means to handing down, or to hand over, deliver. Since it is a bond, 
                    there could be certainly a relation within the church – a cyclic one. Apostolic teachings 
                    are there which substantiate the concept of tradition and its need in the church.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-6">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      <strong>I Cor. 11:2</strong> says "I command you because you remember me in everything 
                      and maintain the traditions just as I handed them on to you."
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                      <strong>II Thes. 2:15</strong> says "So then brothers and sisters stand firm and hold 
                      fast to the traditions that you were taught by us, either by word of mouth or by our letter".
                    </p>
                  </div>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Hence, tradition includes tradition of mouth also. The advices by words that were observed 
                    by the posterity may not be found in the Holy Scripture. This does not mean that the Holy 
                    Scripture is imperfect. It is perfect in itself, but the church has the responsibility 
                    to observe and hand over the tradition in the church.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    However, in traditions, all minute observances and ceremonies may arise. There could be 
                    certain factors that are set apart. Tradition include all traditions, but the tradition 
                    may not include tradition in its integrity, what Paul meant in Thes 2:15 and in II Cor 11:2 
                    about 'traditions' is its integral aspect, that is, the church itself. It is within this 
                    'tradition', all "traditions" (in its integral aspect) that the Holy Scripture was formulated 
                    and not the Holy Scripture formed the church. Behind every literal works, there lies an 
                    oral or written tradition.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The 'rabbis' in the NT made distinction between written Torah and oral tradition. The NT 
                    designates this unwritten tradition as the "tradition of elders" (Mt. 15:2). Paul's 
                    expression "the tradition of my fathers" (Gal. 1:14) refers to both written and unwritten. 
                    Again "the custom of our fathers" (Acts 28:17; 6:14; 15:1; 21:21) and "the law of our 
                    fathers" (Acts 23:3) have the same meaning.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center">
                      Our church gives equal importance to both the Holy Scripture and the tradition. 
                      The church believes that it is dangerous and wrong to give too much importance 
                      to any one of their neglecting concerns for other.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />

              {/* Quick Links */}
              <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
                  Quick Links
                </h3>
                <nav className="space-y-2">
                  <Link 
                    href="/mosc-redesign/downloads/kalpana" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Kalpana
                  </Link>
                  <Link 
                    href="/mosc-redesign/downloads" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Downloads
                  </Link>
                  <Link 
                    href="/mosc-redesign/institutions" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Institutions
                  </Link>
                  <Link 
                    href="/mosc-redesign/training" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Training
                  </Link>
                  <Link 
                    href="/mosc-redesign/publications" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Publications
                  </Link>
                  <Link 
                    href="/mosc-redesign/spiritual" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Spiritual Organisations
                  </Link>
                  <Link 
                    href="/mosc-redesign/theological" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Theological Seminaries
                  </Link>
                  <Link 
                    href="/mosc-redesign/lectionary" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Lectionary
                  </Link>
                  <Link 
                    href="/mosc-redesign/gallery" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Gallery
                  </Link>
                  <Link 
                    href="/mosc-redesign/contact-info" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    Contact Info
                  </Link>
                  <Link 
                    href="/mosc-redesign/faqs" 
                    className="block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300"
                  >
                    FAQs
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

