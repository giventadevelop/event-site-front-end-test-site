import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import { SAINTS_SIDEBAR_LINKS } from '../saintsSidebarLinks';

export const metadata = {
  title: 'Other Saints and Martyrs',
  description: 'Cyril of Alexandria and the defense of Orthodoxy',
};

const currentSlug = '/mosc-old/saints/other-saints-and-martyrs';

export default function OtherSaintsAndMartyrsPage() {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Saint">✝</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Other Saints and Martyrs
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Cyril of Alexandria and the champions of Orthodoxy
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="mb-8">
                  <Image
                    src="/images/saints/other-saints-and-martyrs.jpg"
                    alt="Other Saints and Martyrs"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto object-contain"
                    priority
                  />
                </div>
                <div className="prose prose-lg max-w-none font-body text-muted-foreground leading-relaxed space-y-4">
                  <p className="text-justify">
                    Cyril was the nephew of Theophilus of Alexandria, and became the Patriarch of Alexandria in 412 after the death of his uncle. As soon as he became a bishop, Cyril started showing an uncompromising attitude to heresies. He affirmed firmly that the true faith and security of the Church were his important concerns and that he would do anything to protect them. He closed the church of Novatians, a schismatic group that denied the power of the Church to observe those who have lapsed in to idolatry during persecution. He was also involved in the expulsion of the Jews from Alexandria following their attacks upon Christians.
                  </p>
                  <p className="text-justify">
                    In matters related to Church disputes, two things influenced him much. 1. It was Alexandria alone that once gave chief contributions to the study of Christian theology. Alexandria had its own continuous thought too. It was at this time that another centre of Christian thought, with several differences became prominent in Antioch. Gradually there occurred disputes, feuds and rivalry among Christian thinkers because of these two basic traditions. This rivalry, in a way, influenced the attitudes of various groups to the heresies. The toughness that Cyril showed to Nestorius was to some extent due to this rivalry. 2. When Constantinople grew into a Second Rome, the position of the Patriarch of Constantinople also was raised accordingly. What we see in the life of Cyril is the hard attempt to reestablish the vanishing glory of Alexandria.
                  </p>
                  <p className="text-justify">
                    The beginning of Nestorianism and of the theological quarrel that has left its very distinct mark on all subsequent Christianity even to our own time dates to as early as 429 AD, when Nestorius, Patriarch of Constantinople preached that Mary should not be called the Mother of God, but the Mother of Christ. Eusebius, challenged him still a layman but afterwards Bishop of Dorylaeum, who posted on the doors of the Hagia Sophia a rebuttal accusing Nestorius of Adoptionism of Paul of Samosata. Eusebius sent copies of Nestorius&apos; sermons to Celestine, Pope of Rome. Cyril objected the position of Nestorius in a Festal Letter and in an encyclical letter to the monks of Egypt. Pope Celestine of Rome, hearing this news convened a Synod at Rome in 430, condemned the teaching of Nestorius, and warned him of deposition if he will not profess the Orthodoxy. In Alexandria Cyril called a Synod in November 430, at which Nestorius was condemned. Cyril then wrote his famous third letter to Nestorius, to which he attached twelve anathemas for Nestorius&apos; signature. Nestorius&apos; reply was to counter-charge Cyril with being an Apollinarist, and he invited the Emperor to call a council to settle the matter.
                  </p>
                  <p className="text-justify">
                    The third Ecumenical Council met in June 431. Emperor Theodosius II ordered Cyril to preside the Council. Pope Celestine sent three delegates from Rome. Memnon of Ephesus assisted Cyril of Alexandria. The Council started long after the appointed date because John of Antioch and his delegates did not arrive in time. After a period of waiting, the council started in the absence of John of Antioch. Nestorius refused to attend; and in the opening session, one hundred and fifty-three bishops were present. The first day itself, i.e., on 22 June 431 the Council declared, the letters and anathemas of Cyril to Nestorius were Orthodox and they condemned Nestorius as a heretic, deposed and excommunicated. Finally, more than two hundred bishops signed to the deposition of Nestorius. The council proclaimed Holy Virgin Mary as Mother of God. Four days after the first session John of Antioch and his delegates arrived at the city. They protested the Council is having proceeded without them and opened their own synod and deposed Cyril and Memnon. On July 17, the fifth session of Ephesus deposed and excommunicated John. The Emperor Theodosius II recognized and confirmed both assemblies, and imprisoned both Cyril and Nestorius. Cyril was in Prison for almost three months. Then, the Emperor condemned Nestorius and reinstated Cyril. Nestorius was sent back to his monastery in Antioch, while Cyril was permitted to return to Alexandria as Patriarch. However, reconciliation effected between Cyril and John and they together signed a new Creed (Formula of Reunion). Union of the two natures, without mixing and without division and Divine Maternity of Mary was main content of the Creed. Thus, a partial union was achieved in 433 AD. The last fifteen years of Nestorius&apos; life were spent in exile in Arabia, Libya, and finally in the desert of Upper Egypt. Cyril took great care in protecting the true faith. He also spent a lot of time in biblical studies. Gradually he withdrew from his eventful life and died in 444.
                  </p>

                  <h2 className="font-heading font-semibold text-xl text-foreground mt-8 mb-4">Literary works of Cyril of Alexandria</h2>
                  <p className="text-justify">
                    Cyril was a prolific writer and even though many of his works are lost. But the remaining works are very much enough to prove his literary and theological brillians. The following are his main works available.
                  </p>
                  <h3 className="font-heading font-medium text-lg text-foreground mt-6 mb-2">1. Exegetical</h3>
                  <p className="text-justify">
                    Cyril&apos;s exegetical works are from the major portion of his literary production. His Old Testament exegesis was highly influenced by the Alexandrian allegory and typology. His New Testament exegesis was mystical and allegorical.
                  </p>
                  <p className="text-justify">
                    Worship and Adoration in Spirit and in Truth: This lengthy work in seventeen books is in the form of a dialogue between Cyril and Palladius. It presents an allegorical exegesis of various Pentateuch passages.
                  </p>
                  <p className="text-justify">
                    Glaphyra or Polished Comments is complementary to Worship and Adoration in Spirit and in Truth and was written along with or soon after the latter. It includes thirteen books: seven on Genesis, three on Exodus, and one each on Leviticus, Numbers and Deuteronomy.
                  </p>
                  <p className="text-justify">
                    Commentary on the Psalms; Commentary on Isaiah: The work is in five books, written before the outbreak of the Nestorian controversy in 429 AD.; Commentary on the Twelve Minor Prophets: It is in twelve books, one for each of the Minor Prophets, dates from about the same time as his Commentary on Isaiah. There is a prologue to each book and an introduction to whole.; Commentary on Mathew: The work seems to be later than the outbreak of the Nestorian Controversy and is to be dated after 428 AD.; Homilies on the Gospel of Luke; Commentary on John: It is a lengthy work in twelve books.; Commentary on the Epistle to the Romans.
                  </p>
                  <h3 className="font-heading font-medium text-lg text-foreground mt-6 mb-2">2. Dogmatic works</h3>
                  <p className="text-justify">
                    a) Treasury of the Holy and Consubstantial Trinity: It comprises the Arian objections, Their refutation and the lasting results of the Trinitarian controversies of the previous century. It was written in between 423 and 425 AD. b) Dialogues on the Holy and Consubstantial Trinity: It contains seven dialogues against Arians. The first six of the dialogues are concerned with the divinity of the Son, the seventh with that of the Holy Spirit. Scholia on the Incarnation of the Only Begotten: The work begins with an explanation of Christ&apos;s names, and it proceeds to an explanation of the union of the Divine and human in the hypostatic union as being neither a purely external conjunction or association nor yet an indistinguishable mixture resulting in some third nature. It was written after the Council of Ephesus. Memorials on the True Faith: Under this title three separate memorials are included, all belonging to the earlier days of the Nestorian controversy. Against the Blasphemies of Nestorius: Cyril&apos;s Five Books of Contradiction against the Blasphemies of Nestorius was written in the spring of 430 AD. The work refutes selected passages from homilies of Nestorius. Book one concern the Theotokos, refuting Nestorius&apos; denial of the title. Books two through five challenges and refute passages in which Nestorius&apos; defends a duality of persons in Christ. The Twelve Anathemas; Against those who do not wish to confess that the Holy Virgin is the Mother of God; Defence of Christianity against the books of the impious Emperor Julian; Against the Anthropomorphites.
                  </p>
                  <h3 className="font-heading font-medium text-lg text-foreground mt-6 mb-2">3. Letters and Sermons</h3>
                  <p className="text-justify">
                    Letters of Cyril of Alexandria have a considerable importance for the general history of his times and especially for the Nestorian controversy. Eighty-two letters of Cyril are preserved. Twenty-nine festal letters are preserved. They are announcing the date Easter and preceding fast, exhortation of fast, abstinence, vigilance, prayer, almsgiving and the other works of mercy. Some letters are against paganism, Judaism and heresies. About twenty-two of his sermons are extant and some of them are in fragments only. It is in Festal letter 17 for the year 429 AD that Cyril first raises objections to Nestorius. Three were known as Ecumenical letters. Letter no.39, the third of the so-called ecumenical letters, was addressed to John of Antioch in the spring of 433 AD, and to consolidate the newly established peace between the patriarchates of Antioch and Alexandria.
                  </p>
                  <h2 className="font-heading font-semibold text-xl text-foreground mt-8 mb-4">Main Teachings of Cyril of Alexandria</h2>
                  <p className="text-justify">
                    Cyril is known as the chief advocate among the Greek Fathers in defending Christological doctrine. He has been called Seal of the Fathers. He defended and expounded the Trinitarian doctrine of the Greek Fathers especially on the Holy Spirit against the so-called Arian, Macedonian and Eunomian heresies.
                  </p>
                  <p className="text-justify">
                    His chief glory lies in his courageous and brilliant defense and exposition of the union between the divinity and the humanity in the one person Christ. He has the opinion that the union of the nature of God and man in Jesus Christ is beyond human comprehension. However, the incarnate Word of God is one nature of the one person who is the union of the nature of God and man. On his view, the union was real, and he liked to describe it as natural or hypostatic. This formula, he explained, that the nature or hypostasis of the Word, that is, the concrete being of the Word, being truly united to human nature, without any change or confusion, is understood to be, and is, one Christ. He who had existed beyond flesh became embodied. The nature or hypostasis which was the Word became enfleshed; henceforth the Word was incarnate. This does not mean that God the Son changed in to a man, but it affirms that having united to Himself in His own person the flesh animated with a rational soul, God the Son became man and was called Son of Man. Therefore, Immanuel was one, not bi-personal. There was not a single moment in which the divine nature of Jesus existed differently from the human nature. Therefore, Cyril argued that Virgin Mary must be called the Mother of God (in that she gave birth to God on earth, and that was accepted as the official interpretation of the Church.
                  </p>
                  <p className="text-justify">
                    Cyril&apos;s Christology leads one to think of the reality of human salvation. Only if it is the same Christ, who is consubstantial with the Father and with man, can save us, because the meeting point between God and man in the flesh of Christ. When He shed His blood for us, Jesus Christ destroyed death and corruptibility…. For if He had not died for us, we should not have been saved; and if He had not gone down among the dead, death&apos;s cruel empire would never have been shattered (Polished comments in Ex.2). In addition, Cyril saw that the saviour&apos;s death was a sacrifice, the spotless offering obscurely foreshadowed in the Old Testament sacrificial system.
                  </p>
                  <p className="text-justify">
                    According to Cyril, the process of deification, which is our redemption, will attain its climax after the Parousia and the resurrection, when the union of the elect with their Lord will be indissolubility. Our intelligence will then be filled with a divine, ineffable light, and Divine knowledge will fill us with happiness (Comm. Jn.14, 4). Our resuscitated bodies, having discarded their corruptibility and other infirmities, will participate in the life and glory of Christ (Hom. Lk. 5, 27).
                  </p>
                  <p className="text-justify">
                    Baptism cleanses us from all defilements, making us God&apos;s holy temple. Perfect knowledge of Christ and complete participation in Him are only obtained by the grace of baptism and the illumination of the Holy Spirit. The baptismal initiation makes us the image of the archetype, i.e. of Him Who is Son of God by nature, and so sons of God by adoption (Comm. Rom. 1, 3). The rite of Chrismation is the symbol of our participation in the Holy Spirit. It signifies the perfecting of those who have been justified through Christ in Baptism.
                  </p>
                  <p className="text-justify">
                    Christ&apos;s words at the Last Supper, This is my Body, and This is my Blood, (Mt.26:26-28) lest you might suppose the things that are seen are a figure. Rather, by some secret of the all-powerful God the things seen are transformed into the Body and Blood of Christ, truly offered in a sacrifice in which we, as participants, receive the life-giving and sanctifying power of Christ (Comm. Mt. 26:27).
                  </p>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (aligned with holy-synod page) - desktop only in column */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="bg-background rounded-lg sacred-shadow p-6 mb-6">
                <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Saints Categories</h3>
                <nav className="space-y-2">
                  {SAINTS_SIDEBAR_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block px-3 py-2 rounded-md font-body text-sm reverent-transition ${
                        link.href === currentSlug
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-primary hover:bg-muted'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
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
}
