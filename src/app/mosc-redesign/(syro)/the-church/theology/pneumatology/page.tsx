import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Pneumatology | Theology | MOSC',
  description:
    'Theology concerning the Holy Spirit. The doctrine of the Holy Spirit in the Old and New Testament, co-equal with the Father and the Son in the Holy Trinity.',
};

export default async function PneumatologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Pneumatology"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Theology', href: '/mosc-redesign/the-church/theology' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/theology.jpg"
                      alt="Pneumatology - Theology concerning the Holy Spirit"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    Theology concerning the Holy Spirit
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    God is Father Son and Holy Spirit. The Trinitarian formula of Baptism introduced by Jesus Christ (Mtt. 28.19) reveals the co-equality, co-essentiality, co-divinity of father son and Holy Spirit. The Baptism of Christ manifested the mystery of this Holy trinity (Mtt. 3.13-17) but even before that event numerous old testament references pointed to the trinity (Gen.1.26, 18.1-16, Is.6.1-4) They all suggest one God in three persons, the father, Son and the Holy spirit. Thus in the scripture there are three who are recognized as God and this three are so described that we are compelled to conceive of them as distinct persons. This tri personality of the divine nature is not merely economic and temporal but is immanent and eternal. It is not tritheism; for while there are three persons, there is but one essence. Thus the term &apos;Trinity&apos; is not a metaphysical one. it is only a designation of the four facts. 1. The Father is God ; 2. the Son is God; 3. the Spirit is God; 4. there is but one God. Our concern here is to describe the Doctrine of the Holy Spirit.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The term &apos;Holy Spirit&apos;
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &apos;Ruah&apos; is Hebrew and &apos;Pneuma&apos; in Greek signify the same &apos;breath&apos; or &apos;wind&apos; that which is living but immaterial. Spirit is used in three ways in scripture. (1). the holy spirit is one of the three persons of the trinity(John.4.24; 20.22) (2).The angels are called spirit.(Ps.104.4). (3)The human spirit possesses the intuitive ability to know and experience god (Rom.8.16; 1Cor. 2.10-12). The word &apos;Holy&apos; literally means &apos;set apart or separated unto god&apos;: hence blessed, righteous or sinless. The word therefore refers primarily to God as the source of holiness.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. The Holy Spirit in the Old Testament
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the earliest understanding of Spirit (Ruah) there was little or no distinction between natural and supernatural. God breathed spirit into man and man became a living soul(Gen.2.7). This indicates spirit as a divine and mysterious vital power, in the ecstatic behavior of prophets or charismatic leaders under God&apos;s authority or exerting force in some directions. Primarily the spirit and the soul in man were identically understood(Ex. 15.8, 10; 2 Sam. 22.16; Ps.18.15; Is.40.7). Later a distinction between spirit and soul emerged in which spirit (Ruah) in man retains its immediate connection with the God denoting &apos;higher&apos; or God ward direction of man&apos;s existence (Eg:-Ezr. 1.1,5; Ps.51.12; Ezek.11.19). Where as the soul (nepesh) tends to stand for the &apos;lower&apos; aspects of man&apos;s consciousness, the seat of his intellect , will power, emotions and appetites. This may be the way prepared for the Pauline distinctions between the physical and the spiritual force (1 Cor. 15.44-46). Possession of the spirit of God conceived later as permanent and capable of being passed on (Num.11.17; Dt. 34.9; 2 Ki. 2.9,15). For example anointing of the king was thought of anointing by the spirit(1 Sam 16.13; Ps.8.20; Is 11.2,61.1). in the exilic and post exilic period the role of divine spirit as inspirer of prophesy was reasserted(Jr. 1.23; Is. 59.21; Ezk. 2.2, 3.1-4, 22-24). The sense that god is present personally through His Spirit began to be emerged through the works of the prophets (Neh.9.20, 30. Zak. 7.12) and in artistic skills and craftsmanship of Bezalel(Ex.28.3, 31.3, 35.31) and others as well as the work of creation(Gen.1.2; Jb.26.13; Ps.33.6; 104.30 ) and spirits cosmic presence(Ps. 139.7) This lead to the conclusion that spirit of the holy and good God is God&apos;s Spirit or Holy Spirit(Ps. 51.13; Is.63.10; Neh.9.20; Ps.143.10) Spirit in the work of eschatological dimension creating a new man was a later development (Is.35.15; 44.3;42.1;61.1; Ezk.36.26,37; Jer.31.31-34). Only in the Dead sea scrolls does &apos;spirit&apos; come back into prominence in speaking of present experience, reflecting a conviction living in the last days not dissimilar to the eschatological consciousness of the first Christians.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Thus in the Old Testament the notions of the &apos;spirit&apos; as an instrument of divine action in nature (Gen.1.2)and in the human hearts (Ex.36.1; Dt.34.9; Jdgs.14.6) to communicating the divine love and truth through prophets and theocratic kings(Is.61.1; Ps.51.11) aimed mainly the moral purity and holiness(Is.11:2; 42:1). It also prefigured the Messianic age in future with a large extension of the spirit&apos;s activities and power(Jr.31.31; Ezek. 36.26) manifesting through intellectual capacities. The devout men receive spiritual understanding (Eccl 39.6) wisdom and religious knowledge (Wisdom 7:7; 9:17)
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. Holy Spirit in the New Testament
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Old Testament teaching on the Holy Spirit finds further development in the New Testament. The common symbolic representations of the Holy Spirit in the Old Testament are given a new meaning in the New Testament. The recognized indication of the Holy Spirit in the scriptures are: Dew (Hose.14:5), Fire (Mtt. 3:11), Water (Jn.3:5; 7;38), Wind (Songs4:16), Oil(Ps.45:7; Mtt.25:34), Rain(Hos.6:3), Dove(Mtt3:16), Voice (Mtt.10:20; Acts.2:3) and Seal(Eph..1:13,14; 4:20). The main title through which the Holy spirit is made known are Paraclete (Jn.14:26). Holy Spirit(Lk.11:13). Breath of Almighty (Jb.33:4, Hez.37:9). Eternal Spirit(Heb9.14), good spirit (Eph.4:30, Gen.1:2), Fathers Spirit(Mtt.10:20), Christ&apos;s Spirit(Rom.8:9) Son&apos;s Spirit (Gal.4:6)Spirit of Promise(Rom.8:2) Spirit of Grace (Zac. 12:10, Heb 10:29), Spirit of Prophesy(Rev.19:10) Spirit of Wisdom (Is.11:2, Eph. 1:17), Spirit of Truth (Jn.14:16, 15:26), Spirit of Holiness (Rom.1:5) , Spirit of Revelation(Eph.1:17), Spirit of Judgment (Ps.4:3, 26:8)Power of High (Lk.1:35), Spirit of Yahweh (Ps.61:1, 11:2, Acts. 5:9 ), Lord (2Thes. 3.5), Spirit (Mt. 4:1). The Spirit understood principally as the spirit of prophecy, and been active in the past inspiring Prophet and truth is poured out as the Divine Person of the Holy Trinity through the life and mission of Jesus Christ revealed in the new Age.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      H.G. Dr. Mathews Mar Severios Metropolitan
                    </p>
                  </div>
                </div>

                <div className="mt-10 hidden lg:block">
                  <QuickLinks />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <TheChurchSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}
