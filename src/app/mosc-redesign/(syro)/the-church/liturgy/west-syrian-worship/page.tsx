import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'West Syrian Worship | Liturgy | MOSC',
  description:
    'Introduction to West Syrian worship: liturgical rites, Eucharistic liturgy, anaphorae, liturgy of incense, Sedro, communion practice, and select bibliography.',
};

export default async function WestSyrianWorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="West Syrian Worship"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Liturgy', href: '/mosc-redesign/the-church/liturgy-worship' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/liturgy-worship.jpg"
                      alt="West Syrian Worship"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Introduction
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian Church, known to many as &quot;Jacobite&quot; (after Jacob Baradeus, the 6th century reorganizer of the West Syrian Church) and as Monophysite (after the erroneous idea prevailing in Byzantium and the Latin West that the West Syrians believed only in the divine nature of Christ), historically inherited the Semitic, Palestinian tradition of Christianity, though not uninfluenced by the Hellenic milieu in which they lived.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Syrian tradition broke up soon into four families—the East Syrian (Edessa), the West Syrian (Antioch), the Melchite (Greek) and the Maronite (Lebanon).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Liturgical rites
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The West Syrian Church has probably the richest and most diverse heritage in the matter of eucharistic anaphorae and canonical offices. In addition to these are the rites of baptism and Chrismation of which three different forms are known. Ordination rites also vary substantially; the whole liturgical corpus also includes rites of matrimony (separate rites for first and second marriages), burial (different for clergy, laymen, women and children), anointing of the sick (not extreme unction—again different for clergy and laity), profession of monks, consecration of churches and altars, translation of relics, etc.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Eucharistic Liturgy
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The liturgy is nowadays celebrated mostly in the vernacular—Arabic in the Middle East, English in America, Malayalam in India and so on—though certain portions may still be said by the priest in Syriac. The officiating priest and the people alternate in practically all the prayers, and the deacon plays an important part, admonishing and directing the people to stand with fear, pray and understand the nature of the event that is going on in the Liturgy. Choirs have not been allowed to usurp the place of the congregation as in certain other liturgies.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Some scholars have spoken of a hundred different West Syrian anaphorae, though only about 70 can be traced by the present writer. Some of these, especially the principal anaphora of St. James, goes back in its basic structure to the Jerusalem Church of Apostolic times. Other anaphorae come from the 2nd (Ignatius of Antioch) to the 14th centuries, if we take the names of the anaphorae at face value. New liturgies continued to be created in every century up to the 14th, though production was most prolific from the 4th to the 7th. The twelfth century produced at least six new anaphorae and about the same number was produced by the 13th. With the 13th century the development reached its peak in Gregory Bar Hebroyo and has remained more or less static ever since.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Two peculiarities of the West Syrian rite are (a) the liturgy of Incense between the liturgy of the word and the liturgy of the Eucharist proper; and (b) the prayer of adieu to the altar at the end of the liturgy. The liturgy of incense which recalls the offering of incense in the Temple (Exodus 30:1-10) seems to have replaced the dismissal of the Catechumens, and comprises a general absolution of the priest and people before the offering of the Eucharistic sacrifice. It also represents a sort of offertory, for incense symbolizes the good works and prayers which are well-pleasing to God. It symbolizes also the prayers of the departed saints which mix with those of the congregation, as a true spiritual offering of praise and adoration.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The epiclesis occurs in all the 70 known liturgies, though the form of the epiclesis varies verbally from anaphora to anaphora, as also does the verbal content of the &quot;words of institution.&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Not all the 70 anaphorae are in common use. The ones most commonly used in India are St. James (on all principal feasts, for the first Eucharist offered by a priest, or offered at a new altar), Dionysius Bar Salibhi, St. John Chrysostom and St. John the Evangelist.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The canonical office for ordinary days is called the Shehimo, and has recently been translated into English by the Benedictine Fr. Griffiths. The more elaborate office, the Fenqitho, has not yet been translated into English or Malayalam and is rarely used even in the Syriac. The Syriac text of the Fenqitho is available in our Indian edition as in a Moran edition (1886-1896).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    One major feature of the Eucharistic liturgy and the daily offices is the Sedro, a long meditative-homiletical prayer, preceded by a proemion which seems to be an elaborated form of the Gloria. These prayers are rich in theological content, and play a considerable role in the religious education of the faithful, especially in the absence of biblical preaching.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    An introduction and critical text of the Syriac anaphorae with Latin translation have been published by the Pontifical Oriental Institute in Rome (Anaphorae Syriacae, 1953). The 9th century commentary of Moses Bar Kepha on the Syrian liturgies was published with an English translation by R. H. Connolly and H. W. Codrington (Two commentaries on the Jacobite Liturgy).
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The people communicate rather rarely, the legal minimum of once per year being observed by most, usually on Holy Thursday. Communion is in both kinds, usually by intinction for the laity. The priest usually administers, though the deacon is allowed to serve communion to the laity.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Reservation of the sacrament for adoration is forbidden; it may be reserved in case of need for the sick, and for those who fast till the evening.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Confession before communion is often demanded, though this is not necessary for those who communicate frequently. Fasting from the previous midnight is required.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The lections during the liturgy of the word are three: one from the Acts or Catholic epistles (representing the twelve), then from the Pauline epistles, and then finally the Gospel which is read with great ceremony by the officiating priest. Sermons had gone out of use, but are coming back more recently as priests become better trained.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The creed recited is the Niceno-Constantinopolitan, introduced into the liturgy by Peter the Fuller in the 5th century as an anti-Chalcedonian measure.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Two of the West Syrian anaphorae lack the actual words of institution—Matthew the Shepherd and Sixtus of Rome. The latter says simply: &quot;He, when he was prepared for his saving passion, by the bread which by him was blessed, broken and divided among his holy Apostles, gave us his propitiatory body for life eternal; in a like manner, also by the cup etc.&quot;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The canon of the mass, with words of institution, anamnesis and epiclesis is said aloud by the priest, with responses from the people.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Select Bibliography
                  </h3>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-2">
                    <li>Fortescue, A., <em>The Lesser Eastern Churches</em>, London, 1913.</li>
                    <li>de Vries, W., <em>Sakramententheologie bei den Syrischen Monophysiten</em>, Rome, 1940.</li>
                    <li>Ziade, I., article on Syrienne (église) in <em>Dictionnaire de Théologie Catholique</em>, Paris, 1914, vol. 14, pp. 3017-3088.</li>
                  </ol>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>H. G. Dr. Paulose Mar Gregorios, Metropolitan</strong>
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
