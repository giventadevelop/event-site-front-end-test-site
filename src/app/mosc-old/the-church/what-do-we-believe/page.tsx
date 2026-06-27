import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import TheChurchSidebar from '../TheChurchSidebar';

export const metadata = {
  title: 'What do we believe?',
  description: 'What do the Orthodox believe? Our trust is in the One True God—Father, Son and Holy Spirit. The faith of the Malankara Orthodox Syrian Church.',
};

const WhatDoWeBelievePage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="What Do We Believe">📖</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              What do we believe?
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              What do the Orthodox believe? In whom do we put our trust?
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/images/church/what-do-we-believe.jpg"
                    alt="What Do We Believe"
                    width={500}
                    height={300}
                    className="rounded-lg sacred-shadow w-full h-auto"
                    priority
                  />
                </div>

                {/* Content from mosc.in/the_church/what-do-we-believe/ */}
                <div className="prose prose-lg max-w-none">
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    What do the Orthodox Believe? It is more to ask: &quot;in whom do we put our trust?&quot; &quot;Believe&quot; is a very vague word. Often it means simply holding an opinion without demonstrable evidence. But our faith is not an opinion, not one of many possible views. It is an affirmation of what ultimate reality is-dependable, trustable reality. We do not put our trust either in the ancient character of our Church or in any dogmas or doctrines. Our trust is in the One True God-Father, Son and Holy Spirit, eternal, self-existent, indivisible, infinite, incomprehensible, glorious, holy, not created or owing his being to something else, all-sovereign, Creator of the whole universe. All things are from Him. We too have our being from Him, acknowledge him as the source of our being. Of the being of all else, of all good and therefore worthy of adoration and praise perpetual. About the First Person of the Trinity, the Father we know only what the Son and the Spirit have revealed to us, and still continue to reveal. The knowledge or statable doctrine, but true worship in the community of Faith. True knowledge of God comes through the quality of our life than through intellectual clarification. Some things, however we can affirm conceptually, knowing well that these concepts do not fully conform to reality. The Triune God is beyond all conceptual comprehension not only by human beings, but by any created mind. He is, in a way different from the way anything else in creation is. We know the Triune God, not because we have comprehended His being or isness, but through His operations or activities, the energies of God which come down to us through the Incarnate Son and through the Holy Spirit. The Triune God, Father, Son and Holy Spirit, share the same is-ness; their being is one-infinite, eternal, uncreated, self-existent, with three persons or centres of consciousness and response, always acting in concord and unison as one being. There is no gap or interval of time or space between the three persons; there is no senior or junior; greater or lesser.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We believe that Jesus Christ the Son of God became a human being, rules in the universe. All power in heaven (the aspects of the universe now not open to our senses) and on earth (that is, the universe in all-its tangible, sensible aspects) is given to Jesus Christ the God-Man. Death and Evil have been overcome, but they are still allowed to function, serving Christ&apos;s purposes. They will disappear-love and life will triumph-this is the faith of the Church, and this we affirm. For us the Holy Spirit is Life-giver, Sanctifier and perfecter. We do think in terms of sin and grace, but the central category in our understanding of salvation is the life-giving Spirit. It is He who effects forgiveness of sins, removes barriers between human beings as well as between them and God, gives life, makes people more holy and God-like, and draws us to perfection. He works in the Church, through His special gifts, to build up the body of Christ and to make its members holy. He also works in the Creation, bringing all things to their fullness and perfection. While we do speak about these operations of the Father, the Son and the Holy Spirit, who are not three Gods, but one God, we know next to nothing about His being as Triune God, It is important for us to confess the incomprehensibility of God. He is not to be discussed or explained, but to be worshipped and adored and acknowledged as Lord of all. We believe in the Church, all who acknowledge the Niceno Constantinopolitan creed do. The Church is the great consequence of the Son of God becoming flesh. It is this community that not only bears witness to Christ, but also is the abode of Christ, Christ dwelling in the Church, which is His body. It is in the Church that the life-giving power of the Spirit is at work. But the Church is not simply the community believers gathered together. It is a reality which spans heaven and earth, the risen Christ himself as chief cornerstone, the Apostles and Prophets as foundation, and all who belong to Christ from Adam to second coming being members of this one, holy Catholic apostolic community. The local Church is not a mere part of this one great heaven-and-earth community; it is the full manifestation of the One Church, especially when the community is gathered together with the Bishop for the hearing of the Word of God and for the Eucharistic participation in the one eternal sacrifice of Christ of the Cross.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    We are never allowed to forget even in a small local church the presence of this great cloud of witnesses who share with us the life of the One Church. We remember at every Eucharist the departed as a whole, and especially the Apostles, great teachers, and spiritual leaders who have helped build up and protect the Church from error and deviation. It is not a law that we have to ask the Saints to intercede for us. We do it with great joy and genuine appreciation of their past and present role in the one Church of Jesus Christ. Of the great Saints in the Church, the first (after Christ) and unique place goes to the Blessed Virgin Mary, for she was the first to hear the Gospel of the Incarnation of our Lord from the Archangel, and to receive Him, on behalf of all of us human beings, into her womb. She is the mother of Christ, and thus mother of all the faithful who are joint-heirs with Christ. But she is also the Theotokos, the Godbearer, for the one whom she bore in her womb was truly God himself. For her, Jesus Christ was not an ordinary human being who was then adopted or exalted as Son by God the Father. No, He is the Second person of the Trinity, who dwelt in the womb of Mary without being absent from the &quot;place&quot; of His eternal being. Jesus Christ is now fully God as he always was, of the same being as God the Father. He is also fully a human being, sharing our fallen human nature, but without incurring sin. His humanness and his Godness are inseparably and indivisibly united without change or mixture. One divine-human Christ, one Person, with one united nature and faculties which combine the divine and the human. Our union with this divine-human nature of Christ is what makes us participate in the divine nature (2 Pet. 2:4; Hebrews 2:10-14) without ceasing to be human beings. Salvation for us means more than escaping hell and going to heaven. It means separation from evil and growth in the good. It means eternal life with true holiness and righteousness. It means also being united with Christ in his divine-human nature, in his sonship and rule over the universe. It means becoming more and more God-like in love, power and wisdom. This is what the Holy spirit makes possible. What is humanly impossible becomes reality by the grace and power of God. The participation in Christ&apos;s body and His being and nature becomes possible, by the grace of God, by the Holy Spirit, through the &quot;mysteries of the Church&quot; (roze-d-idtho in Syriac), which are called Sacraments in the West. These mysteries, mainly Baptism -Chrismation-Eucharist, are acts in the community of Faith by which the eternal and eschatological (i.e. pertaining to the last times) reality of our oneness with Christ becomes experienced by faith in the Church, in time, here and now.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed mb-6">
                    There are other mysteries also-Confession-Absolution for forgiveness of sins for the baptized, an anointing of the Sick for deliverance from Sin and Sickness. Marriage too is a mystery of the Church, because it unites Man and Woman in an act of permanent mutual commitment and permanent union, reflecting the Union of Christ with His Bride, the Church, or of God with the new Humanity. Another great mystery of the Church is hierotonia (or hierothesia) the special laying of hands for receiving special gifts of the Holy Spirit - for the Bishop as the mystery -presence of Christ the High Priest and Good Shepherd with His Church, and the related ministries of ruling elders (priests or presbyters) and serving ministers (deacons and deaconesses). We hold the Bible in very high regard. The Gospel is the Word of Life, the proclamation of life and salvation to the world. We hold the Scriptures in the highest respect, and no other writings can have the same standing, for the primary witness to Christ is in the Scriptures. We revere the Scriptures as the inspired Word of God, and all our prayers, as well as the services of the mysteries of the Church are saturated with Biblical reference, and always completed by the public reading of the Scriptures. Icons are important for us. These mediate to the worshipping community the presence of the Saints, and of the saving events of our Lord&apos;s incarnate life. We do not make images of the unseen God. We consecrate icons to mediate to us the Godbearing persons and events which have been actually manifested to our senses.
                  </p>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    For us Tradition is not something old, static, and life-less; it is the life of the Church as a continuing body, with the presence of Christ and the Holy Spirit in it. It is the Spirit that makes the Tradition alive and it bears witness to Christ; it also moves forward in expectation of the final fulfillment. Hence Tradition for us is dynamic. It includes knowledge of Christ, the teaching of the Apostles, the doctrine of the Saints and fathers, the practices of worship developed by the community of faith, its way of doing things and practicing love. Scripture is part of this tradition. Tradition is not just a body of knowledge, but a way of life and worship and service. Our worship as a community is the centre of our life, not our own personal articulations of faith. It is there that the Church, united with Christ, participates in Christ&apos;s self-offering for the world. Our daily life flows out from worship and has to be a life of love and compassion, caring for the needy, struggling against evil, serving the poor. Our hope is focused on Christ&apos;s coming again. It is only in that coming that evil would be separated from good, death from life, so that the good can triumph eternally and grow eternally also. In that coming there will be a reconstitution of the universe; all things shall be made new; evil shall be banished. Death and darkness would be finally overcome; light and life and love will triumph. It is our task to bear witness to this final reality, while living it out here and now, as much as we can, beset as we are by sin and frailty. Thy Kingdom Come Lord. And when Thou comest in Thy Kingdom, remember us poor sinners also.
                  </p>
                </div>
              </div>

              {/* Quick Links - same as other the-church subpages (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar - The Church (all subpages, like mosc.in) */}
            <div className="lg:col-span-1">
              <TheChurchSidebar />
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
};

export default WhatDoWeBelievePage;
