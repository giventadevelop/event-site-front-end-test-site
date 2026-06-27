import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Deification | Spirituality | MOSC',
  description:
    'Deification (theosis) as the goal of spirituality. Becoming like God through communion with Christ, the process of becoming, virtues to imbibe, synergy, and eternal progress.',
};

export default async function DeificationPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Deification"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Spirituality', href: '/mosc/the-church/spirituality' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/spirituality.jpg"
                      alt="Deification - Malankara Orthodox Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    Deification as the Goal of Spirituality
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    In normal circumstances all travels and constructions start with a clear picture of destination or end in mind. What is the supreme goal in our spiritual journey or formation of life? The Church who brings us up with great love and care gives also a clear picture about the major goal of spiritual progress which is nothing but deification or theosis. As St. Irenaeus wrote in second century, God the Father uses his two hands namely Christ and Holy Spirit to reconstruct human beings in the Church in His image. Lives of the saints are articles which illustrate the beauty of the progress in this reconstruction or deification.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Greek word &apos;theos&apos; means God. Theosis means becoming like God (or becoming God) or deification. It means acquiring the qualities of God. Human beings, created in God&apos;s image, by having communion with the Source and Perfecter of life, are supposed to progress in this process till the end of their life and even in the life after life. This theme taught by the Orthodox churches all over the world of all ages seems to be in tune with the Indian spirituality also.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Imitation of Stars and that of God
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    It is quite natural for a child to imitate its parents. In the passing of time s/he may be trying to imitate friends, film stars, sports stars, priests, thirumenis, teachers or other dignitaries. One of the driving force for such an imitation may be love of glory or name and fame and social acceptance. Imitation of a hero or an ideal human being may contribute to the fulfillment of some of the potentialities or talents. But to lead our human creation to its fullness, we need to look to God as a yardstick and ideal model. The ultimate ideal figure for our imitation is the most perfect God only. To put it more concretely &apos;theosis&apos; is becoming like Christ, the absolutely unique icon of God in History. He is not merely the object of our imitation but also the subject or facilitator of this dynamic process of deification or Theosis. Teachers of the Orthodox Churches of all ages and all places highlight theosis or deification as the existential necessity of all human beings.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Theosis rather than theoria
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    In the western tradition it seems that the intuitive vision of God (theoria) is the highest goal of Christian life and that of all spiritual exercises. Even Karl Rahner the great Catholic theologian of the 20th century affirms this. Though the great scholastic catholic theologian Thomas Aquinas admits that God&apos;s essence cannot be comprehended by human knowledge, he thinks that the human mind can have a direct unmediated intuitive vision of the essence of God.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Almost all fathers of the eastern tradition agree that God is incomprehensible in His essence and He can not be seen as He is. But the creation can participate in his creative energies. So their emphasis is on Theosis rather than theoria. St. Athanasius wrote in 4th century with regard to incarnation: &quot;He became man that we might become divine&quot; (On Incarnation 54). Fathers like St. Irenaeus, Origen, St. Basil the Great, St. Gregory Nazianzen, St. Gregory of Nyssa, St. Ephrem, St. Cyril of Alexandria, Pseudo Dionysius etc were the great exponents of this theme. Some of them distinguish the &quot;image and likeness of God&quot; in humans (Gen 1:26) and teach that image is the potentiality of which the goal is likeness of God. Gregory Nazianzen puts it rightly: &apos;man has been created in the image of God and is therefore expected to become &apos;similar to God&apos;… God is to the intellect what the Sun is to material nature. A purified soul alone can acquire knowledge of God. Speaking about God is great undertaking, but is an even greater undertaking to purify ourselves for God, for only in this way will God be revealed.&apos;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    This teaching is based on insights from the Scripture and the experience in church and life. The five very important scriptural passages which describe the significance of deification are 1. Then God said, &apos;Let us make man in our image, after our likeness&apos;; (Gen 1:26) 2. &quot;Be perfect as your heavenly father is perfect&quot; (Mathew 5:48) 3. &quot;Become partakers of divine nature&quot; (II Peter 1:4) 4. &quot;And we all, with unveiled face, beholding the glory of the lord, are being changed into his likeness from one degree of glory to another.&quot; (2 Corinthians 3:18). 5. &quot;The fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self –control&quot; (Galatians 5:22).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The process of &apos;becoming&apos;
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Be or become is a very significant word in the above mentioned passages. Raw materials become special products in factories. An embryo becomes a child and a full human being through a long process. Bread and wine offered in Qurbana become Holy body and blood of Christ. Likewise humans are supposed to progress in the process of becoming like God, that is deification or theosis.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    The theme is also a reminder of the very purpose of all human creation. Being created in the image and likeness of God (Gen.1:26) all human beings have the potentiality to be like God. The Hebrew words for image and likeness of God in Gen 1:26 (Selem and Demuth) are taken from the Egyptian Royal Theology. Emperors used to place their statues in various corners of the country which were known as his images. Likewise human beings are appointed to represent and manifest the invisible God in all the spheres of life, in schools, colleges, offices, homes, parishes etc. All human beings have this basic calling.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Jesus Christ is the one who manifested God most perfectly and showed the fullness of humanity in history. So to be like God means to be like Christ, the perfect image of God (Colossians 2:9; II Corinthians 4:4). By acquiring the qualities of God as reflected in the life of Christ we can be perfect being. This is why the church is always highlighting the life of Christ in her feasts, fasts, sacraments especially in the Holy Qurbana and calls for a constant communion with Him. All saints have acquired this holiness. And joining with St. Paul they exhort us: &quot;Imitate me, just as I also imitate Christ&quot; (1 Cor 11:1). There are many references to becoming like Christ e.g. 2 Cor 3:18; 1 Jn.2:6, Phil.2:5, Jn.12:26 etc. Becoming like Christ is salvation.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Some of the virtues of God to be imbibed
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    There are communicable and incommunicable attributes in God. In other words some attributes like omniscience, infinity etc of God can not be acquired by humans whereas the following are some of the virtues of God which humans can have:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray space-y-4 mb-6">
                    <li>
                      <strong>God is forgiveness.</strong> Though God hates and opposes evil, He forgives evildoers and longs for their change. Christ advises to become like God who &quot;is kind to the ungrateful and the selfish&quot; (Lk 6:35) This is the means to human perfection, happiness and peace of the world which is fragmented by communalism, war and terrorism.
                    </li>
                    <li>
                      <strong>God is wider ecumenism.</strong> God&apos;s concern and compassion is not limited to one church, one religion, or one country. It pervades and encompasses the entire creation. The welfare of the Global community and the whole creation need to be the concern of all human beings also. It is noteworthy that Jesus explains God in relation to Sun which lightens the whole creation (Mt.5:45). By being rooted in one tradition (eg. Orthodox Christianity) we can be open to all churches as well as to people belonging to other religions and join hands with them to shape a better world of peace, justice and love.
                    </li>
                    <li>
                      <strong>God is compassion to the least and the suffering.</strong> God is specifically merciful to those who are marginalized, exploited and suffering. We become like God by taking a stand for the victims of injustice and exploitation, the dalits, tribals, the children who are denied even primary education, the mentally challenged, otherly abled and all the sick and the suffering. Christ led a perfect selfless life by extending merciful hand to all the suffering.
                    </li>
                    <li>
                      <strong>God is community.</strong> In his very being itself He is not an individual or a single person but a community. The Holy Trinity or Satchitananda is a perfect fellowship where Father, Son and Holy Spirit are caring and loving each other absolutely. Being created in the image of the Holy Trinity, human beings will not become perfect without being in solidarity with others. Fellowship or Community is not a luxury but an existential necessity. Each family, local churches and institutions must become incarnation of this fellowship.
                    </li>
                    <li>
                      <strong>God is freedom.</strong> Humans can also become like God who is free from evil and egoism and always free to do good. Deification is a process of liberation from passions like hatred, lust, pride, jealousy which blocks the self actualization of humans and suppress the seeds of virtues in human being. Such a freedom brings happiness and makes the person more active in humanizing works. Progress in freedom means to live like Jesus doing good for society without any external pressure.
                    </li>
                  </ol>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Deification as Humanisation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Becoming like God does not mean suppressing our humanity, physical needs, and social and cultural life. Deification refers to the fulfillment of the human potentiality divinely deposited in human creation. In other words it is self realization of humanity or becoming a perfect human being. Based on the theology of Gregory of Nyssa, H. G. Paulose Mar Gregorios presents deification as humanization: &quot;the very nature of humanity is to be like God, for that is what it means to be created in the image of God. The more humanity becomes like God, the more it becomes itself. Divinization is humanization. Theosis is anthropesis.&quot; (Cosmic Man, 230).
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Theosis and Golden rule
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    &apos;Golden rule&apos; is an ethical demand for human moral perfection: &quot;Whatever you want people to do to you, do also to them&quot; (Matt.7.12; Luke 6.31) This teaching of Christ is a key verse to understand theosis and fullness of life. We find this Golden Rule of Humanity in all the great religious and ethical traditions. People of all religious traditions having an experience of God who is sensitive to the needs His creation are stimulated to be sensitive and empathetic to the rest of the human kind and non human creation. Here are some of its formulations which can become one of the foundations of a Global Ethic:
                  </p>
                  <ul className="list-disc list-inside font-syro-primary text-syro-dark-gray space-y-2 mb-6">
                    <li>Confucius (551-489BCE) &quot;What you yourself do not want, do not do to another person&quot; (Analects 15.23)</li>
                    <li>Hinduism: &quot;One should not behave towards others in a way which is unpleasant for oneself.: that is the essence of morality&quot; (Mahabharata XIII,114,8).</li>
                    <li>Buddhism: &quot;A state which is not pleasant or enjoyable for me will also not be so for him; how can I impose on another a state which is not pleasant or enjoyable for me&quot; (Samyutta Nikaya V,353,35-342,2).</li>
                    <li>Jainism: &quot;Human beings should be indifferent to worldly things and treat all creatures in the world as they would want to be treated themselves&quot; (Sutrakritanga I, 11, 33)</li>
                    <li>Islam: &quot;None of you is a believer as long as he does not wish his brother what he wishes himself&quot; (Forty Hadith of an –Nawawi, 13)</li>
                    <li>Rabbi Hillel (60 BCE -10 CE) &quot;Do not do to others what you would not want them to do to you&quot; (Sabbat 31a).</li>
                  </ul>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Synergy for Theosis
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The process of becoming like a celebrity is mainly based on the effort and initiative of the person who imitate. But deification is possible mainly by a Synergy or co-operation between God and human being. Creation itself is grace or gift from God. Being created in God&apos;s image, humans can make use of grace in creation to progress in divinization. Added to this grace in creation, grace in sacraments and prayers also help those who avail them. &quot;Abide in me, I will abide in you.&quot; (Jn 15.4) God is giving the necessary grace or Spirit through the sacraments and spiritual exercises. Those who are in Christ, need to grow in Him by making use of various spiritual exercises like confession, H. Qurbana, Prayer, silence, meditation of scripture and reflection on one&apos;s own death, exposure to the weak and suffering which facilitate purification and constant communion with God and thus theosis. This is not &apos;Marjara Nyaya&apos; but &apos;Markada Nyaya&apos;. In the case of Monkeys, both the mother and its child co- operate to move forward. As the child holds on to the stomach of the mother monkey, in this divinization process, God and human beings cooperate. God uses the church as the most efficient agent for the deification of His children.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    The eternal progress in deification
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Based on the scriptures and the teaching of the fathers, St. Gregory of Nyssa works out his doctrine of theosis as an infinite process which he calls Epektasis. In his Life of Moses he brilliantly presents his principal doctrine that human goodness is a continual progression towards an infinite God. It is precisely in this context that the spiritual idealism of Philippians 3:13-14 is realized. The virtuous life in this work is full of paradoxes; it is a mixture of standing on the rock which is Christ and forever moving forward, a mixture of running and standing still. Though we are already in Christ we are summoned to an ever increasing truth. In contrast to the Creator, &apos;change&apos; is one of the distinguishing marks of creation. According to Nyssa this capacity for constant change in humans is a guarantee for progress in deification: &quot;let no one be grieved if he sees in his nature a penchant for change…. Become greater through daily increase… For this is truly perfection: never to stop growing toward what is better and never placing any limit on perfection.&quot; (On Perfection) Perfection is an ongoing progress. Even in the eternal abode it is not a static experience but an infinite advance. There the journey goes on, with the eternal Bridegroom, into greater and greater delights, joys and beauties.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    Conclusion
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &apos;Be perfect as your heavenly father is perfect.&apos; Setting this ladder of a supreme goal in life, Christ liberates our mind which is quite often caught up in the tunnel of low and petty goals. We can no more be satisfied fully with a good profession, education, health, wealth, and good family. Also we need to overcome the temptation to think of the goals of maximum wealth, pleasures, luxury, fame, consumerism, individualism as the only means of success as propagated by the Consumerist culture and Globalization. We worship and pray to God not merely for these or for emotional satisfaction or even for a vision of God or for social status. Ultimate goal is nothing but deification or Theosis. Continuously we have to progress in the process of deification, i.e. becoming like God. He has given the potentiality for it in our being. In addition to that He gives the Holy Spirit, the Spirit of perfection to proceed in this dynamism. Saints like St. Gregorios of Parumala have proved the authenticity of this teaching through their lives. &quot;Save yourself, and thousands around you will be saved&quot;: saints of all time repeat these famous words of St. Seraphim of Sarov, the 19th century Russian saint.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Malankara Orthodox Syrian Church
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
