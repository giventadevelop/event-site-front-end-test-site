import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'As an independent Church | History | The Church | MOSC',
  description:
    'The Orthodox Thomas Christians after 1653 till the end of the 18th century: Mar Thoma bishops, West Syrian connection, West Syrianization, East Syrian identity, and the strength of the Orthodox.',
};

export default async function After1653Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="As an independent Church"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'History', href: '/mosc/the-church/church-history' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                      alt="Church History – After 1653"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Orthodox Thomas Christians After 1653 Till the End of the 18th Century
                  </h2>
                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-6 mb-3">
                    Introduction
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Thomas Christians as a whole who had freed themselves in 1653 from their enforced enslavement under Rome stood for some time together under their leader Mar Thoma, who was elevated by the community to the status and function of bishop. But the Portuguese–Roman Catholics were not willing to accept the defeat and were not ready to allow the Thomas Christians to move so freely as they desired. As a result they tried to disturb the Thomas Christians invariably from then onwards till now, primarily intending their resubmersion ultimately under Roman Catholicism. But the Thomas Christians who strongly stood with Mar Thoma, even after the defection of a larger section from among them to Rome, desisting all such submersion attempts from time to time strengthened more and more in their stand as an independent church—and they are the Orthodox Church of India now. From 1663 though the political change was decidedly unfavourable, the political climate was helpful to them because during the time of the Dutch there remained no custom of colonial and royal powers entering into the religious field and forcing people to embrace one way or the other, as had happened under the Portuguese. It is a fact that during the Dutch the Roman Catholics were powerful and the Dutch had promised to support them rather than their opponents like Mar Thoma and his adherents. Though the Dutch did not openly persecute Mar Thoma and followers, on the whole the Dutch policy was to ignore that section as a neglected community. Out of such situation the Roman side took much more advantage.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    With the arrival of the Dutch the Padroado rule of Portugal ended; then onwards the Propaganda missionaries who came directly under the jurisdiction of the papacy began to dominate the ecclesiastical scenario in Malabar. All of them had only one aim with reference to the Thomas Christians: not to bring them closer to the early culture and history and make them a strong community in India, but to make them owe allegiance to Rome and Roman Catholicism with or without the Portuguese Crown. Although the Dutch rule did not allow the Portuguese to continue their government for long, it did not allow the growth of a free church tradition in Kerala that rejected Roman supremacy.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It was in such a contrary political situation that the Orthodox Thomas Christians under a series of bishops known as Mar Thoma stepped in to defend their freedom as a church against all undoings of the Roman Catholics. Among the Mar Thoma bishops, Mar Thoma I, IV, V and VI were great leaders of this church and indeed builders of it.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 1665 under Mar Thoma I a relationship with the West Syrian Patriarchate was established when at their request a certain Gregorios arrived. Again in 1685 two bishops of that persuasion came. From 1751 also three bishops were present from there. These West Syrian bishops&apos; presence was helpful to preserve and strengthen the Malankara Orthodox Church&apos;s desire for Syrian identity and internal freedom as an Indian church against the encounters of Roman Catholicism and Romanization. But on the other hand this relation in the course of time became harmful to that church, similar to what had happened during the Portuguese period through Roman Catholicism. That church since 1653, which was continuing in East Syrian ecclesiastical qualities, was damaged and taken over to West Syrianization through the presence and actions of the West Syrian bishops. Moreover the West Syrian Patriarch, seeing the plightful condition of this church, tried several times to have control over it like the papacy, especially in church jurisdiction, thus endangering its desire to preserve national freedom and administrative independence. But till 1876 the leaders of this Indian church were able to desist all such attempts. As a result from time to time there were divisions and quarrels. Therefore the West Syrian connection of the Malankara Orthodox Church did not help much the latter to develop and strengthen as a free church in Kerala with its own national identity. The West Syrian church too, due to its centuries of oppressed conditions under Muslim rule, had lost appropriate vision of Christianity. Hence all the troubles in their relation with the Indian Orthodox church. Now we shall brief the various conditions of this church particularly under the Mar Thoma bishops.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Orthodox Church Under Mar Thoma
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 1653 till 1816 the Orthodox Church was led by eight bishops with the
                    common name Mar Thoma. They were indigenous leaders from the Pakalomattam
                    family, archdeacons by heredity and tradition, and “the Gate of All India.”
                    They were deadly against Roman Catholic supremacy and allowed no compromise on
                    church autonomy. Mar Thoma I (1653–1673) fulfilled the Coonen Cross Oath’s aim,
                    sought confirmation of his episcopal office from the West Syrian bishop Mar
                    Gregorios (1665), and thus began a new relationship with West Syrian
                    Christianity that in time made this section Orthodox and part of the Oriental
                    Orthodox family. Mar Thoma I is esteemed as the “greatest soldier” and founder
                    of the Malankara Orthodox Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    West Syrianization
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian bishops who came from 1665 gradually introduced their church
                    traditions. Mar Thoma V and VI refused to submit to the Patriarch’s jurisdictional
                    claims; when the Patriarch sent bishops in 1751 to reconsecrate Mar Thoma V under
                    the Patriarch with the title Dionysius, he refused. A rival metropolitan was
                    consecrated against him, but Mar Thoma V did not yield. Mar Thoma VI later
                    underwent a confirmation ceremony (1772) and was given the Episcopal title
                    Dionysius—he is known as Dionysius the Great. The residence of the Orthodox
                    bishop moved from Angamaly to Kandanad and later to Kottayam (1816).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Strength of the Orthodox
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Orthodox were estimated at about 50,000 in the 18th century. By the
                    beginning of the 19th century, Richard Kerr and Claudius Buchanan reported
                    between 30,000 and 80,000 faithful and about 55 churches. Many churches were
                    in decay; some were shared with the Romo-Thomas Christians. Despite divisions,
                    a common community consciousness among the Thomas Christians could not be
                    fully broken—marriages between the sections and shared cultural and church
                    heritage continued.
                  </p>
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
