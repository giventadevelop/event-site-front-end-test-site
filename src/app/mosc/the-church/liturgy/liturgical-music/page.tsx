import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgical Music | Liturgy | MOSC',
  description:
    'Liturgical music tradition of the Malankara Orthodox Syrian Church: West Syrian music, Syriac language and music, Beth Gazzo, syllabic structure, and the canon of the eight modes.',
};

export default async function LiturgicalMusicPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgical Music"
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
                      alt="Liturgical Music"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Liturgical Music Tradition of the Malankara Orthodox Syrian Church
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Malankara Orthodox Syrian Church is proud of its worshipping heritage. It is through the worship that the faith, tradition, and practice of our fathers are passed down through the generations. The West Syrian form of worship, language, and music was introduced to the Church in the latter half of the nineteenth century, and we continue to practice this tradition in our Church today. Until 1875, viz. up to the arrival of the Patriarch of Antioch, H.H. Peter III, the Malankara Church was practicing the East Syrian language and music. Unscientific method of singing has altered Syriac Music from its original form. Liturgical Music that was passed down through the generations was not through musical notations but through oral traditions. Many Malpans (Teachers) introduced their own style of singing through their teachings, further increasing the number of variations. In addition to this, the influence of local music and mode of singing has transformed Syriac Music into a different form.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Religions are the treasure houses of music. All Churches have their own liturgy, faith and music. There is not a &quot;Said Liturgy&quot; that exists. The Malankara Orthodox Church also has the traditional form of faith and mode of worship. Even though this is an Indian Church which upholds the tradition of Apostle St. Thomas, it is known as the Orthodox Syrian Church. This is due to the influence of the language and liturgy used by the Antiochene Syrian Orthodox Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Importance of the use of Syriac Liturgy and Music
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Syriac is considered as one of the most important and enduring among ancient languages. It is well known for its style of presentation, mode of construction as well as its musical tradition. &apos;Syriac&apos; is the official language of Syrian Christians in India. Why do the Indian Syrian Christians still preserve it? It is basically because of the solemnity of Syriac music, the nobility of its contents and vitality of its elements (Bhakti) in worship. Writings of the Syrian Fathers are considered as the basis of the theology and worship of the Church. Syriac or the renamed name of Aramaic language could contribute much to Christian literature since the second century A.D. Ancient writers like Bardaisan and Shemvoon Bar Saboe in the 2nd and 3rd centuries are not accepted in the Indian churches. But 4th century is considered as the golden period of the Christian Church, both in faith and theology, liturgy and music. In the 4th century, fathers like St. Ephraim, Jacob of Serog, Mar Baalai of Alleppo, Shemvoon Kookkoyo (Simon the Potter), Severios of Antioch, Aphrahat and Narzai etc. are considered as the pioneers of Syriac literature and poetry. Their writings are focused on three dimensions:
                  </p>
                  <ul className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-disc pl-6 space-y-2">
                    <li><strong>Theological dimension:</strong> Syriac literature was written mainly as poetry in structure. It was the need of the time to propagate the orthodox faith against major heresies. Deep theological ideas were expressed through simple melodies. Thus they founded the Eastern Theology and undefiled faith, which are considered as the basis of the latter theologians of different Christian denominations.</li>
                    <li><strong>Social dimension:</strong> Apart from spiritual homilies, the Syrian fathers wrote homilies for secular and popular use. Their writings had an impact on the social life of the people.</li>
                    <li><strong>Spiritual dimension:</strong> Major part of the writings of the fathers were aimed for propagation of faith, prayer, meditation and corporate worship. Many of the homilies and Bovoothos are enriched in its contents for meditation which leads to edification.</li>
                  </ul>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Syriac Language
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Syriac is the language which is the renamed form of Aramaic language, i.e. the language of Our Lord Jesus Christ. Since the 2nd century A.D., the language became the central part of the Christian Church. As a spoken language it is the mother tongue of Persia (East) and of Palestine (West). Thus it was later identified as Eastern and Western Syriac. Both of these languages are the same in its principles but differ in its forms and vowel systems. The language reached up to its zenith between the 4th to the 8th century A.D. This was the period of the great Syrian Fathers. Their writings became as a fort of the Orthodox faith. Thus the language flowed to the neighboring countries and later, to the entire globe. Those who wish to learn Theology and Orthodox faith, should compulsorily learn Syriac properly.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Syriac Music
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Syriac was popular not only in the field of literature but in music also. Like Byzantine or any other music systems, Syriac music also has a classical basis. The East Syriac Music system is based on Hudra, which is monophonic as well as melismatic in form and structure. It is still the official chant of the churches that follow the East Syriac system in liturgy in India like Syro Malabar and Chaldean Churches. (Today, the Syro Malabar Church is in a pale form and it may be by the impact of enculturation.)
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    West Syriac Music (WSM)
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    West Syriac Music is one of the most ancient ecclesiastical music systems, which is unique in richness both in literature and music. This is the official chant of the Orthodox Church in India and it became popular after the coming of H.H. Patriarch Peter III in 1875. The soul of Syriac Liturgy is its melodious music. By the relationship with the Orthodox Church in Syria, the Malankara Orthodox Church has imbibed this music system into its common worship and liturgy. The Malankara Church eventually witnessed many divisions which led to the formation of various denominations still known under the name &apos;Syrian&apos;—e.g. Orthodox Syrian, Jacobite Syrian, Mar Thoma Syrian, Syro Malankara, Syro Malabar etc. Why do the Indian Syrian Churches still preserve it? It is basically because of the solemnity of Syriac Music, the nobility of its contents and vitality of its spiritual elements (Bhakti) in worship.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    WSM is based on the classical system known as Beth Gazzo (in Syriac, meaning treasury). The concept is equivalent to the Greek word Octoechoes, meaning singing a melody in different eight modes. It may be from the European Modal music system viz. identifying the four Authentic and four Plagal Modes, which was considered as a Pre-Renaissance Classical system. The Byzantine Church Music is also based on Eight Modes. Eight Mode systems were also known to the Arabic Music System, known as Makkam. &apos;Octoechoes&apos;, in the Byzantine concept can be compared with the Syriac term &apos;Kintho&apos; (sing). Its plural form is Kinotho. The concept may be the same; but the term cannot be interpreted as the same. Makkam in Arabic Music or in the Modal Music system of Europe differs from the concept of Kintho in Syriac Music. It cannot be compared with the Diatonic scale of Western Music. The word can be identified with the term &apos;Color&apos;. Kintho is not a scale or Mode or Raga, in the Indian concept. It is because, according to music theory, a Diatonic scale or mode is a combination of two Tetra Chords viz. C D E F / G A B C or Do Re Mi Fa / Sol La Ti Do—i.e. it should have two Tonics. None of the Syriac melodies may cover the eight notes in an octave. It may often cover three or four or five notes. Unless the melody covers the higher Tonic, it cannot be identified with a scale. So Kintho is neither a scale nor a mode. Here, the word Octoechoes is used only for the purpose of identification. It is the duty of a Music student to hear the color and feel sweetness of the Syriac melodies.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The word &apos;Ekkara&apos;, stands as a pseudo name for Octoechoes or Kintho in the Churches in Kerala. The rules for the use of Ekkara is known as Ekkara Canon. The text or guide to learn Ekkara is known as Ktobo d&apos;Beth Gazzo and it is taught by Malpans (Teachers) through the aural tradition. Students learn the hymns in the Ktobo d&apos; Beth Gazzo by heart and use it according to the Ekkara Canon. Lack of classical notations has affected uniformity of Beth Gazzo. As it is taught through oral method, it chiefly depends on the method of subject approach of the Malpan. This eventually resulted in the disunity of the Syriac music from time to time. The use of Ekkara in Kerala began, as cited above, after the visit of H.H. Peter III, the Patriarch of Antioch in 1875 A.D. Though it was practiced widely in the last century, its favor has grown pale presently because of the deterioration of Monasticism and the growth of Protestantism and Sectarianism. But now as a part of curriculum, theological seminaries are giving importance to Ekkara.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There lingers an argument amongst historians on the matter of the origin of Beth Gazzo. Many of them believe that Mar Severios of Antioch, the great theologian and writer founded the methodology cited in the Syriac Music. Although he was Syrian, he had a Greek background. He adopted the Octoechoes system into Syriac Music. Thus he arranged Mavurbo (Magnificat, or praise, which is used in the Lelio or Midnight prayer) into eight different tunes. John of Damascus, a Syrian father and writer says that there exists no evidence of the usage of Beth Gazzo before 6th century A.D. It is believed that the writings of Mar Severios in Greek was translated to Syriac by Paul of Edessa. Assemani says that the grouping of Syriac poetry was done in the 11th century though he does not mention the country or place. Historians are of the view that the use of Beth Gazzo began in the 11th century A.D. But it grew in a wider form only in the middle ages viz. the golden period of Monastical movement. The contributions of Mar Severios of Antioch should be highly honored than that of any other Syrian writers. In the &apos;Hoothomo&apos; or the concluding hymn of the West Syrian Liturgy, there can be found a mention about Mar Severios as &quot;…. Sangeethathal Sabhaye Uyarthia Severios….&quot;, meaning, &quot;….Severios who had nourished the Church through music….&quot; There are three traditions mainly common now in the Malankara Churches. They are the Tur Abdin, Mousul (Iraq), and Edessan. The former two are western and the third is Eastern. The Tur Abdin and the Mousul traditions are theoretically the same but practically differ in its presentation. (In personal view, in Kerala, it is the Pampakuda Malpans that propagated the Tur Abdin tradition and, the Syrian delegates who taught in the Manjanikkara Dayara i.e., the Dayara where the Patriarch of Antioch, H.H. Elias III was buried, propagated the Mousul tradition.) This is why in Kerala, the Churches in North and South have differences in tunes.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Is there any Original Syriac Music that exists at present?
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    To me, it appears that there is no any ancient or original Syriac melody existing. If so, how could this have happened? (1) As mentioned, Syriac music was taught and learned by oral tradition and this is still continuing now. The same music may differ from person to person, from country to country and tradition to tradition. Majority of the music learners may not reproduce the exact note even after learning. It may differ according to one&apos;s age and the level of one&apos;s mind. So, this variation in the transfer of music down the centuries has caused deviation of the original melody composed by the Fathers. (2) <strong>Lack of music notations:</strong> Ancient chants like Byzantine or Gregorian etc. had been properly notated and used centuries back. But Syriac music is not yet properly notated. Lack of notations caused the change of melody through centuries. (3) <strong>Influence of the popular music:</strong> Popularity of a certain kind of music can influence a musician. Traditional music, folklore, and other music traditions influence an individual. In Syria, Syriac Music has been mixed with the popular music viz. the Arabic Music. Beth Gazzo has been changed from its original form due to the Islamic influence. In India, the Indian musical elements have been mixed with the Syriac music. Mother tongue and the local music system has also influenced the Syriac music to a large extent causing the deprival of its original form. The same hymn sung by an Indian and a Syrian, sounds differently. In this way, Syriac Music has lost its original form.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Syllabic Structure of Syriac Music
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Syriac music follows the methodology of Hebrew Music viz. writing music in the syllabic structure and in the metrical style. Syllabic means the number of syllables and vowels used in one line. The following are the examples:
                  </p>
                  <ul className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-disc pl-6 space-y-3">
                    <li><strong>1. Tetra Syllabic:</strong> Four syllables in one line. Harmonius, the great composer first wrote the tetra syllabic structure.</li>
                    <li><strong>2. Penta Syllabic:</strong> Penta means five—five syllables in one line. Bardaisan was the first writer who wrote the penta syllabic structure followed later by Mar Baalai. This is very commonly used in the daily worship viz. Sh&apos;heemo. Mar Baalai is considered as the pioneer of Penta syllabic structure. e.g. &quot;Hadeth m`leh rahmeh&quot; (Ha-deth-m`leh-rah-meh), &quot;B`reethok b`noohomo&quot; (Bree-thok-b`noo-ho-mo).</li>
                    <li><strong>3. Hepta Syllabic:</strong> Seven syllables in a line. This is very common in Syriac poetry. Most of the compositions of Mar Aprem are in the Hepta syllabic structure. e.g. &quot;Moran ethrahamelain&quot; / &quot;Moran kabel theshmeshthan&quot; (Mo-ran-eth-ra-ham-a-lain).</li>
                    <li><strong>4. Do Decca Syllabic:</strong> Twelve syllables in a single line. Jacob of Serog promoted the Do Decca syllabic structure into Syriac poetry. e.g. &quot;Korenan lok Moryo Moran Tho l`udaronain&quot; (Ko-re-nan-lok-Mor-yo-Mo-ran-tho-l`ud-ro-nain).</li>
                  </ul>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The Canon of Beth Gazzo
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Beth Gazzo has certain specific rules which is known as Canon of Beth Gazzo. The book Ktobo d&apos;Beth Gazzo explains how to use Beth Gazzo in the yearly cycles. There are melodies which have eight tunes, single tune melodies, as well as melodies especially for Passion week (Hasha). In the Modal music system, the Authentic and Plagal modes are inter related. Likewise in the Beth Gazzo, the Modes are related as: 1 and 5, 2 and 6, 3 and 7, and 4 and 8. Two modes are alternatively used in a week. The mode begins with the evening prayer (Ramsho) of Sundays and continues in the seven timely prayers (Canona Namaskaram). Common Prayer in a day, according to Orthodox tradition, is divided into seven times: Ramsho (Sandhya), Soothara, Lelio (Midnight), Saphro (Morning), Tlosh shloyeen (Third hour), Sheth Shoyeen (Sixth Hour), and T&apos;sha Shoyeen (Ninth Hour). The Common prayer in Syriac is known as Sh&apos;heemo prayer and starts by the evening prayer and ends in the Ninth hour. &apos;Seven times&apos; is a concept adopted by the Fathers on the basis of Psalm 119:164. According to the Church calendar, the Liturgical year begins with the great feast Koodosh Eetho, approximately on the first Sunday of November. Beth Gazzo also begins with Koodosh Eetho. According to the Canon of Beth Gazzo, the beginning of Mode occurs six times in a single year: from Koodosh Eetho up to Yaldho (Christmas); from Sunday after Yaldho to Nineveh Lent; from Nineveh Lent to Kyomtho (Easter); from Easter to New Sunday; from New Sunday to Feast of the Cross; and after Feast of the Cross to Koodosh Eetho.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Modes are assigned for important Festivals (e.g. Yaldo/Christmas—1, Denho/Epiphany—2, Mayaltho—3, Sooboro—4, Soolokko—5, Feast of Tabernacle—6, Shoonoyo—7, Feast of the Cross—8), for Intercessions (St. Mary, Communion of Saints, Prayer for Departed, Veneration of the Cross), for Common Prayer (Sh&apos;Heemo) with fixed modes for Ramsho, Soothoro and Saphro according to the theme of each day, for Sacraments (Baptism—2, Marriage, Anointing of the Sick—6), and for Funeral Services (Men and Women: 5, 6, 7, 8 in four parts; Children: 1, 2, 3, 8).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The names of the Syriac melody
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Syriac poetry is entirely different from the other poetic traditions. But it bears similarity to Hebrew poetry. The syllabic structure is the soul of the Syriac poetry. It contains Theology, doctrines, spiritual discourses, praise and petitions. The following are the poetical works included in the eight mode pattern (exceptions to the Oktoechoes system or the monophonic hymns):
                  </p>
                  <ul className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4 list-disc pl-6 space-y-2">
                    <li><strong>Madrosho:</strong> Writings in the melodies mainly spiritual advice and exhortation. St. Ephrem was the first among the Syrian writers who composed Madrosho, which is very common in the West Syrian liturgy.</li>
                    <li><strong>Memro:</strong> Discourses or homilies in verse. This was the main weapon of St. Ephrem to defend the true faith.</li>
                    <li><strong>Sogito:</strong> It means additional. It gives a different mood in worship. It is a dramatical presentation with practical exaggeration containing Biblical narrations as well as spiritual messages. During continuous prayers Sogito plays an important role in bringing the mind of a devotee to a different stage.</li>
                    <li><strong>Eniyono:</strong> It means responsaria. The congregation responds or gives answer to the Priests or Deacons. e.g. Ps 136.</li>
                    <li><strong>Manito, Mabartho, Takshepto:</strong> These all are hymns of praises. Sometimes the poetry is arranged in an acrostic form.</li>
                  </ul>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2 mt-4">
                    <strong>Hymns based on Okto Echoes:</strong>
                  </p>
                  <ul className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4 list-disc pl-6 space-y-2">
                    <li><strong>Bovootho:</strong> It means petition or request. Usually the canonical prayers as well as every sacrament ends in Bovoothos.</li>
                    <li><strong>Kukkilion:</strong> It is included in the category of Litanies. &apos;Kukkilion&apos; is a Greek word adopted to Syriac which means cycle or cyclical structure of prayers. The structure: Pethgomo (verse from Psalms) follows an Ekbo (feet or base); then Prumeon (Introductory prayer) and Sedro; after Sedro a Qolo follows the prayer of incense and a Bovootho. The main themes are the basis faith of the Church: intercession of St. Mary, Communion of saints, Veneration of the Cross, prayer for the departed and for the departed priests.</li>
                    <li><strong>Qolo:</strong> The Syriac word means sound. In music it refers to a special or important group of melodies. The Qolo is very important in Syrian worship. It is the continuation or connection of many similar stanzas, having the same music. There are forty Qolos but only thirty of these are used in West Syrian liturgy.</li>
                    <li><strong>Khadeeshat Aloho (Trisagion):</strong> During common prayers the prayer begins with Trisagion in prose. But in order to give importance to Trisagion it is mainly used on Sunday evenings and morning prayers, as well as on festival days.</li>
                    <li><strong>Mavurbo:</strong> It means Magnificat or praise. The idea may be taken from the song of St. Mary in Luke 1:46-56. Its main theme is praising the Trinity. It includes intercession of St. Mary, communion of Saints and prayer for the departed souls.</li>
                  </ul>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>Fr. M.P. George, Sruti, School of Liturgical Music, Orthodox Seminary, Kottayam-1</strong>
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
