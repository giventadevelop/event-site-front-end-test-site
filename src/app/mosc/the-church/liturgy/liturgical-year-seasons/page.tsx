import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgical Year & Seasons | Liturgy | MOSC',
  description:
    'The Church\'s ecclesiastical year starts with the Feast of Sanctification (Qoodosh Etho). Seven cycles of seven weeks each; Holy Lectionary; the aim of the liturgical year.',
};

export default async function LiturgicalYearSeasonsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgical Year & Seasons"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Liturgy', href: '/mosc/the-church/liturgy-worship' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="Liturgical Year and Seasons"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Liturgical Year and Seasons
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church&apos;s ecclesiastical/ liturgical year starts with the Feast of sanctification (Qoodosh Etho). The Church has decided that the first Sunday that falls between October 30 and November 5 (inclusive) should be celebrated as the Feast of Sanctification. By celebrating this feast, the Church sets in motion the new Liturgical year.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Liturgical Seasons or Cycles
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the Malayalam text of Holy Qurbana, it is mentioned that the liturgical year is divided into six seasons. The first after Qoodosh Etho, the second after Yeldho, the third after Kothine Sunday, the fourth after Qyomtho, the fifth after Pentecost and the sixth after Sleeba. In the Syriac liturgical tradition, there are many liturgical seasons/cycles. There is a need for a clear yet deeper study into these seasons to make sure they are kept uptodate. If we make just a small number of changes to the above seasonal calculation we can have a much better division of the liturgical seasons.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Seven Cycles / Seasons
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    The liturgical year can be updated by having seven seasons consisting of seven weeks each. Most of us are familiar with the first two Sundays of the liturgical year – the Feast of Sanctification (Qoodosh Etho) and the Feast of Dedication (Hoodos Etho). These two Sundays can be considered as a time for preparation for entry into the Liturgical Year. The rest of the liturgical year can be divided into seven cycles of seven weeks each. According to the existing seasonal calculations, the 14 or 15 long weeks shared between the cycles of Pentecost and Sleeba can be divided into 2 seasons – the season of Pentecost and the season of Apostles.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    It is difficult to split this seasons exactly into two. There are two reasons for this. Firstly the weeks before and after the feast of the apostles do vary in number. Secondly, the work of the holy spirit and fulfillment of the duties of the twelve apostles are blended during this two seasons. Therefore without giving them a clear division we can call them the season of Pentecost – apostles. Each other season are approximately seven weeks long, and the season calculation for them is as follows:
                  </p>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-2">
                    <li>Season of Sanctification-Dedication (Shudheekarana-Prathishta Kalam or Orukka kalam)</li>
                    <li>Season of Annunciation (Sooboro kalam)</li>
                    <li>Season of Nativity-Epiphany</li>
                    <li>Season of the Great Lent</li>
                    <li>Season of Resurrection</li>
                    <li>Season of Pentecost – Apostles</li>
                    <li>Season of the Cross (Sleeba)</li>
                  </ol>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In the liturgical year, the calculation of seven weeks for each season could possibly vary due to the occasional blending of fixed feast and moveable feast. For example, the season of annunciation can have forty eight to fifty four days. The season of the cross – from 45 to 51 days. The season of the great lent and the season of resurrection are fixed at 7 weeks. However since Easter is a movable feast, the number of days in the seasons of nativity – epiphany and Pentecost – apostles can increase or decrease. Despite this, it is still possible to practically implement the first two weeks of preparation (season of sanctification – dedication) followed by the seven cycles which are 7 weeks long.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Two things are of fundamental importance for the acceptance of this seasonal calculation: 1) Bible readings 2) Liturgical Texts. The main messages conveyed by both the Bible readings arranged for the whole year and the prayers in the worship books will make it obvious that such a seasonal calculation is proper and acceptable. Kurishumala Ashram&apos;s (Vagamon) Book of Prayer for the whole year, published in English, divides the liturgical year into 7 seasons, each 7 weeks long. In this book, the 6th season is called the Season of transfiguration (Maruroopa kaalam). However, besides the readings selected for this season, we do not see any development of the thoughts related to the topic of transfiguration in the weeks that follow. For this reason, we may have to assume that the Syrian Church Fathers did not desire to elaborate on the &quot;Transfiguration&quot;. To those who believe that the existing Bible readings and the prayers in the liturgical texts are of an adequate standard, the above-recommended seasonal calculation is even more appropriate.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Holy Lectionary (Vishudha Vedavayana Kurippu)
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Before we discuss meditational thoughts based on the Bible readings for the liturgical year, there are two reasons I would like to point out for having such a long introduction to this topic.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    <strong>1.</strong> The lectionaries published by M.O.C Publications in 1988 and 1992 are improved and corrected versions of the old lectionary. Some of the corrections are a welcome change. However, some other corrections have not taken into account the importance of the Liturgical Seasons. This does not mean that one must not make timely changes. However, when making the corrections, one should not forget the ideas and thoughts that are foundational. When replacing Bible readings, which have remained unchanged for long periods, one must consider the appropriateness of the readings for that particular day&apos;s events. For example, let us look at the changes introduced to the Bible readings for the Feasts of Sanctification and Dedication. The Old Testament readings and Pauline Epistle readings are same on both Sundays. The changes introduced to avoid repetition in the Pauline epistle readings are acceptable. However, the readings selected from the Book of Revelations are not suitable. Why were the readings from the Prophetical books of Jeremiah and Ezekiel omitted in the new lectionary? Was not this because of the inability to understand how to link the meaning of the proposed Bible readings to their respective Feast days? The reading from the books of Exodus (33:7-11) is used twice. To prevent repetition, three to four passages from the Old Testament can be suggested: Gen 28:10-22; Ps 45:1-11; Ez 43:1-5; Is 60:1-9. In fact, all of these Bible readings are mentioned in Promeon-Sedra prayers of these two Feast days (Koodosh E&apos;tho and Hoodosh E&apos;tho). In the light of this discussion, it is my opinion that the improved versions of the Lectionary be re-examined and revised.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    <strong>2.</strong> The intention of these meditative thoughts is not to just come up with some brief notes on the Bible readings associated with Feast days. In addition to drawing more attention to Bible readings, especially the Gospel, it is a humble effort to align the Bible readings and prayers with the Liturgical seasons in such a way that the complimentary link between them is understood, and to also highlight the Biblical messages which are revealed as a result of this alignment. It is hoped that this union of a Biblically aligned liturgical year with its liturgical seasons will help the faithful experience a blessed and fulfilling Church Life.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Aim of the Liturgical Year
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    How do we get to know a God who is beyond the boundaries of time and space? How can we experience and know the salvific mystery of the God, who is Christ, these days in this pathetic life? How can the Christ, who came down from heaven and lived with us, be made to dwell in us as the Eternal Emmanuel, a God who lives with us always? This is not something that can be obtained through mere intellect. It is possible to enter into the mysteries of God and experience God&apos;s presence only by approaching the Holy Liturgy and Tradition with attention, purity, meditation and discipline. The Church shows us that is the way to encounter God during our highs and lows, gains and losses, joy and sadness etc. When we hear the terms liturgical year, liturgical seasons, etc time is usually the only thing that comes to our attention. It is not only time, but also space, that is set aside, purified and offered for worship. We are encountering the limitless and indeterminable God right here, right now. To him, we offer just a moment in time, and a small amount of space, purified. This should not be the case. It is not just a particular time and space (that is set aside for worshipping God) that should be filled with God&apos;s presence; rather, it should fill our entire life. Every moment, every place, should be filled with God&apos;s presence.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    With humility, submission and service we must devote our lives to those around us and with us. Through practice of penance such as lent, fasting, etc we can discipline our lives and be &apos;ready&apos; at all times. Take part in liturgical services with ever-increasing, improving preparation and participation. Know the essence of the Bible readings and prayers that have been selected for each day. In addition, experience and know the presence of God by accepting a way of life that sets apart time and space for worshipping God by setting aside things that are worldly. Then come back to that which is worldly by being committed to it with Godly awareness (since all have worldly obligations to fulfil, and they do take up a majority of our time). This way, as we grow more and more in holiness and dedication, the difference between the time and space that is and is not set apart for God will become less and less, and our lives will soon be fully filled with the presence of God. It is this gradual development that is the aim of the practice (and practices) of the liturgical year/season. May this essay satisfy the current journey by generating useful thoughts and reflections.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>H. G. Dr. Gabriel Mar Gregorios Metropolitan</strong>
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
