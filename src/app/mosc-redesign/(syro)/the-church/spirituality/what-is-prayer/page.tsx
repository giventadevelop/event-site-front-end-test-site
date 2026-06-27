import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'What is Prayer? | Spirituality | MOSC',
  description:
    'Prayer is communion with God. What prayer is, why we pray, and how to pray—posture, focus, gestures, ejaculatory prayer, and the Jesus Prayer for Orthodox Christians.',
};

export default async function WhatIsPrayerPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="What is Prayer?"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Spirituality', href: '/mosc-redesign/the-church/spirituality' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/spirituality.jpg"
                      alt="What is Prayer? - Malankara Orthodox Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    1. What is Prayer?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Prayer is like breathing. Without breathing we cannot live. When we breathe, air enters our lungs, cleanses the blood in our veins by relieving it of the carbon dioxide, and supplying it with oxygen. If I do not breathe for a few minutes I die. When I have hard physical work to do, I need more air than when I am sleeping or sitting in a chair. Fortunately God has so ordained that we do not die spiritually just because we have failed to pray for sometime. But where there is no prayer sin accumulates and the proper functioning of the spiritual life becomes obstructed. And if you have important spiritual work to do you need more prayer than otherwise. Only those who pray constantly are exercising their spiritual muscles. Prayer is communion or communication with God -opening ourselves to Him and receiving His love. It is by living consciously in this relationship of love that we can be transformed into the image of God. By prayer we become more like God, more loving, more wise, more powerful, more kind and good. In prayer we are cleansed of the accumulated impurities of our life and we are supplied with power to live a good, kind and holy life. Prayer is not a matter of asking God for all kinds of things. Some teen-agers speak to their earthly father only when they need money. We should not become like them in relation to our heavenly Father - going to Him only when we need something. The relationship is valuable in itself, as in all true love. It is not what we get out of it that matters, but the fact that we are in communion with our loving Heavenly Father.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    2. Why Pray?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Does not God know what we need, even before we ask him? Why does He want us to ask? Does prayer change God&apos;s will in any way? Can my prayer change the future that God has already determined? These are legitimate questions that need to be answered. The Bible says clearly &apos;your Father knows what you need before you ask Him&apos; (St. Mathew 6:8). But God wants that we know what is good for others as well as for ourselves. God wants that our will should not incline towards evil, but desire the good with deep yearning. Prayer is therefore a way of training the will to desire the good, as well as of turning our wills towards the highest concentration of all good, namely God. Prayer is thus a way of becoming good by using our freedom to turn towards the good and to will the good. By prayer we become like God. God is good and wills the good. We should also become like God in willing and desiring what is good. By communion with God we also learn to desire the good which God also desires. God said: &apos;Let there be light&apos; and there was light. And God saw that the light was good (Gen. 1:3-4). What God willed became reality. We are to become like God. So we must also acquire the capacity to will the good, and it will happen as we desire, when we become more and more like God. Prayer is an expression of our will in desiring the good and realising it. When we are delivered from selfishness, pride, and evil desires, our prayers will become more like the creative Word of God, which merely by saying &apos;let there be light&apos; can create light.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    God has made us partakers of His own divine nature. He has called us to share in God&apos;s own glory and excellence (2 Pet. 1:4). When we trust in God and live a life of discipline, prayer, worship, virtue, knowledge, godliness, brotherly affection and love (2 Pet. 1:5-8), we are transformed into God&apos;s likeness and share in His divine power. God wants us to have a part in the task of shaping this world through prayer and knowledge and work. By prayer we do change reality. God has given us that power. But this power is not available to us until we become more godlike. That is why the prayers of the saints are more effective than our own prayer - because they are more god like than we are. If the power to change the world by our will is in the hands of evil men, they will make the world evil. We have to grow in the capacity for prayer by developing the habits of prayer and loving service. And our prayers should not be selfish. In prayer the first focus is God. The second focus is other people. Only in the third place should we ask things for ourselves. In the Lord&apos;s Prayer all the first petitions are focused on God - His name, His kingdom, His will. This is the way our prayer should also be. We pray that God&apos;s purposes may be established in the lives of all people, that evil may be banished from the earth, that all men may live together in peace and justice, praising God the centre and source of all good. Even in the prayers that ask for daily food, for forgiveness and for protection from evil, the first person singular (I, me) is not used in the Lord&apos;s Prayer. We ask things for us, for all men. When we all pray with love and faith, without selfishness or pride, our prayer changes things. God has more laws than the laws of physical science. He can make prayer achieve &apos;miracles&apos; of healing and transformation which cannot be explained by medical science. Our science knows only some of God&apos;s laws. Prayer is also subject to certain laws. It is the same power of God which operates in the scientific realm, and in the realm of prayer. In prayer, we are never alone. Not even alone with God. Especially in group prayer, we commemorate all those who are members of the Body of Christ, for it is as a member of the Body that we pray, and the other members are always with us. This is why we commemorate the Prophets, Apostles, the Blessed Virgin Mary, the Martyrs, the Saints, the great Teachers and all the faithful departed and all the faithful living.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-8 mb-4">
                    3. How Pray?
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    Prayer has to be learned. It is like swimming. When you are first thrown into the water, you may sink. You then may think that the law of gravity is final and cannot be changed. But there are other laws, like those of buoyancy and motion. The mere knowledge of these laws cannot teach you to swim. One jumps in and slowly, by repeated practice, acquires the skills of remaining afloat and of moving on the surface of or under the water. And some people are more skillful swimmers than others, because they have learned the rules and acquired the skills by constant practice. The first rule in prayer as in swimming, is not to give up just because you do not succeed in the first three or four attempts. Prayer is a spiritual skill to be acquired by constant practice. The second rule, again as in swimming is to &apos;let go&apos;, to let the water support you, to be unanxious and relaxed. In prayer also we have to let ourselves go, relax, trust in God to support you and teach you how to pray. The third rule is to keep up the practice, even if you do not feel like it, or enjoy it. In the life of prayer, our inherent love of sensual pleasures and our selfish love of laziness and comfort, will interfere to make us reluctant to keep up the practice, finding various excuses for not praying. There is no use saying &apos;I don&apos;t feel like praying&apos; or &apos;I do not get anything from it.&apos; It will take years before you get the habit of prayer and really begin to enjoy it. One must strengthen the will to have control over the laziness of the body and the desires of the flesh if one is to make progress in the art and skill of prayer. There is nothing like regular practice which can teach you to pray.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    A fourth rule, closely connected with the third, is: develop the discipline of prayer through fasting and self-control. Man does not become free and good like God until he learns to control his own inner drives and passions. Restraint of hunger and thirst, of anger and jealousy, of sexual passion, of the desire for glory and flattery, of the desire for bodily excitement and for sensual stimulation, and of all inner turbulences which make us do things against our own free will, is a necessary preparation for prayer. As good athletes competing for the Olympic Games go through very rigorous self discipline in order to keep their body, muscles and nerves in good condition, so should the man of prayer keep his body, mind and spirit in good condition and under conscious control.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    A fifth rule is to use our whole body and even material things in the service of prayer. Prayer is an act of the whole man, body, soul and spirit - not simply an act of the mind. The body can participate in prayer through posture, speech, and acts:
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    (a) <strong>Posture</strong> - In our Eastern tradition, the posture for prayer is standing, facing east, with arms uplifted or folded in adoration and worship.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    (b) <strong>Focus</strong> - It is good to have a focal point outside - a cross with two candles on each side, icons or pictures of Christ, of the Blessed Virgin Mother and of the Saints, or even a more elaborate prayer - altar fixed in some part of the house, where the whole family assembles for prayer. Crucifixes, i.e. crosses with the representation of the crucified body of Christ on it, belong to the Western tradition and are not to be encouraged in our tradition. In choosing pictures, it is best to use eastern icons. Pictures with the sacred heart of Christ or of the Virgin Mother are to be avoided, because these belong to a particular period in Latin piety and are not helpful for a balanced spirituality.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    (c) <strong>Lips and Mouth</strong> - The body must pray - not merely the mind. Let your lips and mouth sing the praises of God, even if your mind does not always follow. The act of the lips and mouth is also your act of prayer, even without the concentration. Singing is better than saying your prayers, for in the very music certain human attitudes and aspirations are expressed.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    (d) <strong>Wandering of the mind</strong> - Do not get anxious about the wandering of your mind. When you become aware that your mind is wandering, bring it back by consciously offering your wandering mind also to God. It is part of our confession about ourselves. &quot;This is what I am Lord, distracted and unable to concentrate. I offer myself to Thee as I am. Take my wandering and distracted mind, and heal it by Thy grace.&quot; God will forgive you and transform you gradually.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    (e) <strong>Gestures</strong> - Use the gestures of prostration, bowing the head, making the sign of the cross, and giving the kiss of peace. Words are not the only means of expression we have. Folding the hands and bowing is a sign of adoration, and of waiting for a blessing. Lifting up your hands with palms open, can mean petition, penitence, and intercession. Prostration is like Sashtangapranama, the sign of complete surrender and submission, placing yourselves in the hands of God with full trust. Making the sign of the cross is a way of reminding ourselves that we have been saved by the Cross of Christ, in fact crucified with Christ. Keep your three fingers together (thumb, index and middle fingers) to touch the forehead (symbolizing the Trinity, the source of all life and all good) and make a descending motion to the lower side of your chest to signify the descent of the Son of God from heaven to earth for our salvation, then take your fingers from your left arm to your right arm signifying both the horizontal arm of the cross, and the fact that we who were on the left as children of darkness, have now been brought to the right side of God as children of light. Giving the kiss of peace is the symbol of mutual forgiveness and love, and it is a time for us to overcome all feelings of bitterness or anger against members of the family or others outside. All these signs are part of a language which goes much deeper than words and transforms our sub-conscious minds which words can seldom reach.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    A sixth rule is to keep the balance between group prayer and personal prayer. Man is not primarily an individual. It is as a member of the Body of Christ that he has any standing before God. Therefore it is important for us to come into the presence of God regularly as a community - as a family as a youth group, as a local congregation. And a community is composed of all kinds of people, not all of them exactly like you. They have different tastes, different ways of praying, different habits of prayer. I have to join them even sometimes when I think that their way of worship is not what it should be. Without participating in community worship and making the necessary adjustments necessary for joining them, we cannot get rid of our selfishness and pride, and grow to be a real human being. But community worship is not enough by itself. We need various levels of community with varying degrees of intensity of relationship. The youth group and the family are more intimate communities than the congregation. New forms can be used in these smaller groups which will be difficult or unfamiliar for the congregation as a whole. The prayers in this book are mainly meant for family and group worship, but can also be used for personal prayer in the privacy of your own room at home or in the hostel. In addition to these forms, however, some other forms of prayer should be mastered for personal use. The most effective and useful of these forms is called ejaculatory prayer. These are one - sentence prayers which one can repeat as many times as necessary, no matter, where or when. You can say them in your mind when you are waiting for a bus; when you are anxious about something; when you are facing temptation, when you feel bored and lonely, while you are lying in bed, comfortable and too lazy to get up; while going to bed and when sleep does not come immediately, and so on.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                    The following are some of the possible forms of ejaculatory prayer:
                  </p>
                  <ol className="list-decimal list-inside font-syro-primary text-syro-dark-gray space-y-2 mb-4">
                    <li>Lord Jesus Christ, Son of God, be merciful to me a sinner.</li>
                    <li>O God, Thou art my God. I love Thee. I am Thine for ever.</li>
                    <li>Lord, you are my Master and Lord, I give myself to Thee.</li>
                    <li>Lord, keep me in Thy ways, keep me from all evil.</li>
                    <li>Lord, have mercy, Lord, have mercy, Lord have mercy upon me.</li>
                  </ol>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    You can make up your own forms of prayer, for here the Church lays down no rules for personal prayers. Of these forms above, the first was a favourite with the monks, and is known as the &apos;Jesus Prayer.&apos; They used to recite it thousands of times in a day as a sort of Mantra. In Mount Athos, the monks trained themselves to say this prayer along with every breath. They would say &quot;Lord Jesus Christ, Son of God&quot; with every inhaling breath, hold the breath in the lungs for a few seconds and then exhale, saying &quot;be merciful to me a sinner.&quot; The idea was that the prayer should become as incessant an action as breathing, that the Lord Jesus Christ should become established in your heart as a deity is in a temple, and that you should constantly be in an attitude of prayer and repentance. These forms of personal prayer as well as others should be developed. Each child of God has a right to speak to God any time and at all times, using his or her own words. There are no Church rules for personal prayer. It is an act of your personal freedom, and therefore is all the more pleasing to God when you use your own personal intimate language. Personal prayer enriches group prayer; common prayer in the family, group or congregation enriches one&apos;s personal prayer; neither should be neglected. The two should balance each other. But the use of extemporary prayer is not to be encouraged in group worship.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                    A seventh rule is that prayer should be nourished by the reading of the scriptures and meditation. One can discipline oneself to read a chapter of scripture every day. Read aloud or silently. Meditate on the meaning of the passage. Devotional books may be helpful, but may also obscure the meaning of the scripture. Do not worry about whether the reading of scriptures gives you a feeling of devotion or not. Feelings are deceptive. What you need to find out is the answer to the following questions: &quot;What was God saying to the people of that time through this passage? What does God say to me now?&quot; Systematic reading of the scriptures and memorizing some passages which touch you deeply will be found very helpful as life advances. You will be grateful to God in your middle age that you started reading and memorizing when your mind was still impressionable.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    CONCLUSION
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    All these rules are to help you to become a praying Christian. Only your own sustained and disciplined practice will make you perfect. But remember one thing. Prayer can never be isolated from the common worship of the Eucharist and from the continuous, active compassionate love for your fellowmen. Let us all pray: &quot;Lord, Teach us to pray. Amen.&quot;
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      H. G. Dr. Paulos Mar Gregorios Metropolitan
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center text-sm mt-2">
                      (Written for Orthodox young people in India)
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
