import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Liturgy and Spiritual Practices | Liturgy | MOSC',
  description:
    'The principles of Orthodox worship: transfiguration, five senses, rituals and incense, symbols, fasting and feasting, tradition, communion with the departed, intercession, liturgical hymns, and Biblical basis.',
};

export default async function LiturgyAndSpiritualPracticesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Liturgy and Spiritual Practices"
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
                      alt="Liturgy and Spiritual Practices"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    The Principles of Orthodox Worship
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">1. Transfiguration of the whole being</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Human mind is provided with conscious, subconscious and unconscious layers. Worship is not only the transfiguration of the conscious mind. It transforms the whole being. St. Paul expresses this process as follows: &quot;And we all, with unveiled face beholding the glory of the Lord as in a mirror, are being transformed into the same image from glory to glory, just as by the Spirit of the Lord&quot; (2 Cor. 3:18). The three representatives of the Apostles could experience this glory of the Lord in their Taboric Transfiguration. Christian witness is not only to see the glory of God, but also to become glorified. Human beings, created in the image of God, are transfigured from glory to glory through incessant prayer and worship. This process is not intellectual but experiential. The whole being is involved in this process. In other words, worship is infinite growth in goodness. It is theosis or Deification.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">2. Communication with the five senses</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The five senses help us in human communications. The same is applicable to our communication with God. In real worship we see, hear, smell, taste and experience the divine communion. Preaching the word of God and listening to it are not the exclusive factors of worship. Take the example of the threefold colors by which the Holy Altar is decorated. The red covering at the altar indicates the universe and the solar system. The green coloring denotes the earth with the greenish variety of biological species. The white covering indicates the Church made sanctified and pure through the blood of the unblemished Lamb of God, Jesus Christ. The blood and body of Christ were given to the Church and the whole creation is sanctified through the Church. In worship we listen to the word of God, smell the odor of incense, touch the hands of our brethren in Kiss of Peace and taste from the divine chalice perceiving the mysteries of the liturgical scenario.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">3. Rituals, offerings and incense</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    God became man. He took flesh; matter was used in the redeeming process of incarnation. Rituals, offerings and material objects were given sufficient role in the ministry of Jesus. St. Luke chapter 5 verse 14 states: &quot;And he charged him to tell no one: but go and show yourself to the priest and make an offering for your cleansing as Moses commanded for a proof to the people.&quot; Thus Jesus commanded to give offering and rites of thanksgiving. Jesus is serious towards those who disobeyed the commandments. Jesus taught that offerings and rituals must help to be firm in faith and for the glorification of God. Jesus was respectful towards priesthood, offerings of thanksgiving and vows. Even St. Paul cut his hair at Cenchreae, for he had a vow (Acts 18:18). Bread, wine, water, oil and soil are all seen used in the redemptive process according to the Bible. &quot;Do this in remembrance of me, this is my body and this is my blood,&quot; commanded Jesus. The offering of the incense is practiced in Christian worship (See Rev. 8:3-4, Rev. 5:8, Heb. 9:4, Mt. 2:11). Offering of the incense is to get rid of the plagues, to remove the foul smell of sin, to please the Lord with complete dedication and to keep the Biblical commandments (See Num. 16:46-50, Ex. 35:8, 2 Chron. 2:4, 1 Kgs. 9:25, Malachi 1:11, etc.). With the offering of incense we are mingling with the prayers of all the saints (Rev. 8:4).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">4. Symbolic Representations</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    We have to acknowledge our linguistic limitations. Words and language alone fail to reflect our gratitude to God Almighty. Symbols speak volumes and help us for meaningful communication with God. The early Church developed symbolic art in the Catacombs. Symbols used by early Christians include lamb, dove, fish, shepherd, vine, bread, cross and the like. The dove represents the Holy Spirit; Christ is the Good Shepherd and the Lamb of God. The Greek word &quot;ikhthus&quot; which means fish denotes &quot;Jesus Christ, Son of God, Savior&quot; when alphabetically expanded. This was the creed and declaration of faith used by ancient Christians. The symbolism of salt, lamp, etc. are inspiring and educative for a Christian. They are parts of the Christian devotion. The cross speaks out the sacrificial acts of Jesus. Signing of the cross is also silent, but meaningful worship. The icons first came into existence in Syria and Egypt. The Byzantine Church developed icons and iconostasis with a sound theology of symbols called iconography.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">5. Fasting, Feasting and Festivals</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In worship there are factors beyond human reasoning and intellect. Through the particular cycle of prayers, rites of purification and courses of meditation together with lent, fasting and deeds of charity we find amalgamation with such factors beyond our reason and intellect. In our worship we bow our heads, kneel down and pray to the Lord (See Gen. 24:26, Gen. 24:48, Ex. 4:31, Dan. 6:10, 1 Kgs. 8:54, Mt. 2:11, Rev. 7:11, Ps. 95:6, etc.). Fasting is pleasing to God (Is. 58:6-8); God asked His people to observe fast (Joel 1:12-15). The evil one can be overcome by fasting (Lk. 2:37, Mt. 17:21, Esther 4:16). Moses observed fasting (Ex. 34:28, Mk. 9:29, Acts 14:23); fasting is mentioned in 1 Kgs. 19:8. Also we see 21 days fasting of Daniel (Dan. 10:2-3), 14 days fasting in Acts 27:33-35, 7 days fasting of David in 2 Sam. 12:16, 1 Sam. 31:13, 3 days fasting (Esther 3:13, 4:16, Acts 9:9, Dan. 9:3-21, Ezra 8:3, people of Nineveh Jonah 3:6, etc.). Jesus is the best example (Mt. 4:2). Feasts are observed as days of special honor and reverence (Jn. 7:2, Acts 20:16, 1 Cor. 16:8). The Jews observed feast of Passover (Ex. 12:14-17), Pentecost (Ex. 19:20), Tabernacle (Lev. 23:24), Purim (Esther 9:26), Trumpet (Lev. 23:24). Feasts and Festivals of Christianity commemorate events related to Christ, saints, and martyrs sharing the experiences in and with so great a cloud of witnesses (Heb. 12:1).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">6. Conformity with the mind of the Church</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    We are bound to hold fast the traditions transferred to us through the Church by our Lord, the Apostles and the Church Fathers. The Greek word paradosis used in the Bible means &quot;that which is transferred&quot; or &quot;traditions&quot; (See 2 Thess. 2:15, 3:16, 1 Cor. 11:2, etc.). The continuity and apostolic authority together with the rich spiritual fragrance behind these traditions are to be counted. Tradition is the mind of the Church. It is difficult to write down everything that we see, know and experience. The canons, faith declaration and textual formations of the liturgical practices form the spiritual code of conduct made by the Holy Spirit through the Apostles, gospel-writers and Church Fathers. These traditions (oral and written) act as catalytic agents for our spiritual upbringing. These traditions are not to be ridiculed, misused, and misunderstood (See 1 Cor. 11:34, Phil. 4:9, 2 Tim. 2:2, 2 Tim. 1:13, Heb. 2:1, 3 Jn. 1:13, 2 Pet. 3:16).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">7. Communion with the departed ones</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Church is the communion of all believers in the past, present, and future. Both the living and the departed are members of the Church. A believer never dies (Jn. 11:26). The departed ones stand around us like clouds today (Heb. 12:1). They live (1 Pet. 4:6). They speak (Lk. 9:30-31). They please God (2 Cor. 5:8-9). They pray for the world (Rev. 6:9-10). Death is not capable of separating us from the love of God (Rom. 8:38). The departed Moses and Elijah are seen talking with Jesus (Mt. 17:3). The prayer of a righteous man has great power in its effect (James 5:16). See also Prov. 10:7, 1 Cor. 6:2, Rev. 2:26, Lk. 16:27-28. The departed ones are alive in paradise (Lk. 23:43). St. Paul prayed for the departed Onesiphorus (2 Tim. 1:16-18). We commemorate and unite in prayer with the departed ones who form the larger part of the Church.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">8. Intercession for the whole creation</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Intercession for the living and the departed was practiced in the Church from the very beginning. If it is alright to ask a living person to pray for us without violating the principle of one unique Mediator, it cannot be wrong to ask a departed saint to pray for us. We also pray for them. Even the relics of the departed saints can do miracles (See 2 Kgs. 13:20-21). The rich man in Hades prays for his five brothers who are living (Lk. 16:27-28). The Orthodox Church believes that the range of Christ&apos;s saving activity is the whole creation at large. The creation is based on the will, wisdom and power of God. Purpose of the creation is to glorify God. With our prayers and intercession we transfigure the world for the glorification of God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">9. Liturgical hymns with diversity of tunes</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The highest form of worship is to use hymns with diversity of tunes as in the Psalms. Through liturgical hymns we are getting into the horizon of the fact of incarnation. We are exploring the divine mysteries through our hymns. Music is the human response to divine love. Music transforms human mind. It is the highest form of devotion and the strongest mental shock absorber. With the heavenly angels who stand in rows and repeat the chanting of melodious prayers, the earthly beings participate in the worship with melodious songs. In the book of Psalms there are directions to lift up the voice of the choir. The word &quot;sela&quot; means &quot;lift up&quot;. In the communal worship and singing, the choir members are reminded here to raise and lower down the voices and tunes. Worship is our state of being immersed into the ocean of God. We feel relaxed when our burdens, problems, afflictions and aspirations are submitted before God. Worship is the state of our relaxation before God.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-2">10. Strong Biblical basis</h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The apostles and the early disciples described the mystery of the early Incarnation based on the law of Moses, the prophets and other writings (See Acts 28:23). The worship and liturgical practice of the early Church were developed with the contents of Synagogue worship and Temple worship. The worship in the Jerusalem Temple followed morning and evening sacrifice, offering of the incense and Hanukkah processions with lighted candles. The synagogue worship followed readings from the Old Testament, verses of blessings, singing of Psalms, exegetical sermons by religious scholars and Aaronic benediction. Assimilating these ancient practices of worship, the Church developed and regularized readings from the Old Testament, New Testament, songs, offering of incense and the Holy Eucharist which is the liturgy of the sacrifice (Jn. 6:53, 1 Cor. 11:23-32, Heb. 9:15-22). The worship of the Orthodox Church is saturated with verses from the Holy Bible.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>Fr. Dr. Mathew Vaidyan</strong>
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
