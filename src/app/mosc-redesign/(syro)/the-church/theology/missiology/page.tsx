import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Missiology | Theology | MOSC',
  description:
    'The mission of the Church from an Orthodox perspective. Liturgy after liturgy, paradigm shifts in mission, and developing mission paradigms for the 21st century.',
};

export default async function MissiologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Missiology"
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
                      alt="Missiology - Orthodox Perspectives on Mission"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-0 mb-4">
                    MISSION: The Orthodox Perspective
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ion Bria, the famous Orthodox Theologian traces the theological foundations of Orthodox Mission in his work &quot;Go Forth in Peace: Orthodox Perspectives on Mission&quot;. According to Bria, &apos;The mission of the Church is based on Christ&apos;s mission. A proper understanding of this mission requires, in the first place, an application of Trinitarian theology…. Trinitarian theology points to the fact that the God is in God&apos;s own self a life of communion and that God&apos;s involvement in history aims at drawing humanity and creation in general in to this communion with God&apos;s very life.&apos; Regarding the aim of Orthodox Mission, Ion Bria explicitly says, &apos;mission does not aim primarily at the propagation or transmission of intellectual convictions, doctrines, moral commands, etc., but at the transmission of the life of communion that exists in God. The &quot;sending&quot; of mission is essentially the sending of the spirit (Jn.14:26), who manifests precisely the life of God as communion (I Cor.13:3).&apos; The other foundations also include the centrality of Christ, the incarnation, the Cross, the Resurrection, the work of Holy Spirit, Synergia: the invitation of God to partake in the mission. And this includes a &apos;call to Repentance and the obedience to the Will of God.&apos;
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The springboard of Orthodox mission is liturgy. That&apos;s why the Orthodox mission is called <em>liturgy after liturgy.</em> &quot;Nothing reveals better than the relation between the Church as fullness and the church as mission than the Eucharist, the central act of the Church&apos;s <em>leitouragia</em>, the sacrament of the Church itself.&quot; In the Eucharistic celebration there are two complimentary movements, the movement of ascension and the movement of return. The Eucharist begins as ascension toward the throne of God, toward the Kingdom. The second movement begins a return to the world, when the celebrant says &apos;Let depart in peace&apos; as he leaves the altar and leads the congregation outside the church. &quot;The Eucharist is always the End, the sacrament of the Parousia, and yet it is always the beginning, the starting point: now the mission begins.&quot; &quot;Without this ascension into the Kingdom we would have had nothing to witness to. Now having once more become &apos;His people and His inheritance&apos;, we can do what Christ wants us to do: &apos;you are witnesses of these things&apos; (Luke 24:8). The Eucharist, transforming &apos;the Church into what it is,&apos; transforms it in to mission.&quot; H.G.Geevarghese Mar Osthathiose in his paper &quot;Confessing Christ Today through Liturgy as a Form and Experience of the fullness of Salvation&quot; cites several examples of the interrelationship between Liturgy and Mission.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    &apos;We confess Christ today through the Liturgy in multifarious ways. There is first of all the combination of the pulpit and the altar in Liturgical worship. The sermon is a part and parcel of liturgical worship. The homilies of the Fathers were mostly delivered in the liturgical context. Most of the Christian preaching and teaching in the Orthodox Churches in the Soviet Union takes place in the liturgical context today. Then, the transformed lives of the faithful who partake of the mysteries regularly is an eloquent witness to the whole world that Jesus Christ is still the great defying force on earth. Though there are exceptions, of course, regular communicants manifest their deified lives in the so-called secular vocations of life and they sanctify everything they touch. Thirdly, we confess Christ today to the non-Christians who attend the Liturgy casually at first. Conversions still take place through the magnetic attraction of the Eucharistic service. The casual visitor slowly becomes a regular attendant and then studies the faith of the Church and asks for baptism.&apos;
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Paradigm Changes in Missiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The concept of paradigm shift really started with the progress of scientific knowledge. Paradigm is a concept developed by Thomas Kuhn in his book, The Structure of Scientific Revolutions and it refers to certain basic assumptions that a community takes for granted, and which create a particular vision of reality within that community; and which provides the basis for the organization of thought and behavior. The concept is that the scientific community holds certain beliefs, and these govern assumptions as fundamental and their research and interpretation of data. Anything that does not fit into this paradigm is rejected. With the coming of new discoveries, old paradigms begin to loosen their hold and a new paradigm gradually emerges. The thesis of paradigm shift is applied to the development of theological thinking in the third world also. New paradigms are evolving in theological situations which have their origin in the experiences of people living under systems of violence, caste domination, racial discrimination, patriarchy and economic exploitation. It was David Bosch, the eminent Missiologist of our times, who introduced the &apos;theory of Paradigm shift&apos; into the missiological area. Bosch follows the historico-theological subdivisions suggested by Hans Kung, the renowned German theologian. Kung suggests that the entire history of Christianity can be subdivided into &quot;six major paradigms&quot;. These are:
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    1. The apocalyptic paradigm of primitive Christianity. 2. The Hellenistic paradigm of the patristic period. 3. The medieval Roman Catholic paradigm. 4. The Protestant (Reformation) paradigm. 5. The modern Enlightenment paradigm. 6. The emerging ecumenical paradigm. Concerning the paradigm classification and the division of Christian era by Kung, Bosch believes that the classification and division themselves are not very original. He comments: &quot;What is original is Kung&apos;s fashioning of these subdivisions according to Thomas Kuhn&apos;s theory of paradigm shift. Each of these epochs, Kung suggests, reflects a theological &apos;paradigm&apos; profoundly different from any of its predecessors. In each era the Christians of that period understood and experienced their faith in ways only partially commensurable with the understanding and experience of believers of other eras.&quot; Bosch says that Kung&apos;s observations regarding theology in general have a profound effect on our understanding of how Christians perceived the Church&apos;s mission in the various epochs of the history of Christianity. Yet w e must take a closer look at the entire issue with to get a deeper insight into what mission might mean for us today.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Every attempt at interpreting the past is indirectly an attempt at understanding the present and the future. So, one important way for Christian theology to explore its relevance for the present is to probe its own past, to allow its &apos;self definitions&apos; to be challenged by the &apos;self-definitions&apos; of the first Christians .It is in this respect that we may benefit by turning to Kuhn&apos;s suggestions about paradigm changes. According to Hanz Kung, the Paradigm Theory provides a threefold goal. It divides history into periods which it helps to survey, it provides a structure with a historical foundation; it challenges the present and provides possibilities for the future. For the 21st century, missiologists Bevans and Doidge , recognize six essential components of God&apos;s mission, in which Church is called to share :
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    1) Witness and proclamation 2) Liturgy ,Prayer and Contemplation 3) Commitment to Justice ,Peace and the Integrity of Creation 4) The practice of inter religious dialogue 5) Efforts of inculturation and 6) The ministry of reconciliation.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Developing Mission Paradigms
                  </h2>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The mission Paradigm of the Meal Table Sharing
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The caste hierarchy in India had succeeded in keeping Dalits always at the lowest level. In this system, once born into a lower caste, one can never hope to come up in life. One important way of practicing God&apos;s mission is to encourage meal table sharing. It has its origin in the work of Jesus Christ himself when he lived among us. He moved with the poor and oppressed the impure and the condemned and shared his meals with publicans and other sinners, which was something very uncommon at that time. The Jewish codes of conduct prevented the Jews from mixing freely with the lepers and such ritually impure people. Jesus touched them and healed them, both spiritually and physically. Meal table sharing in the present time proclaims that it is one way of expressing God&apos;s love for all humanity, irrespective of the considerations of caste or creed. Taken at a metaphorical level, meal table mission addresses the greatest human need for understanding reconciliation, healing and peace which is highly needed in the Indian context, and at the level of international relations. The inherent dignity of the human being is acknowledged and accepted when sharing meals with outcasts and strangers, and this is something which illustrates the living presence of God in our lives. It is mission in action.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. A Mission Paradigm for the Integrity of Creation
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The current eco-crisis presents the occasion for serious soul searching and thinking in Christian theology. The western colonial enterprise supported by a crusading missionary theology has supported the onslaught of nature, and the elimination of indigenous cultures and languages. The consumerist culture encouraged by industrialization and production based only on profit motives has also contributed to the depletion of resources. The church can urge people to look at the earth, not from the point of view of a conqueror but from the point of view of the conquered, subjugated and oppressed. The church&apos;s mission should involve teaching people to adopt life-styles that use fewer of the world&apos;s resources. Committed to recycling waste, driving automobiles less, using resources sparingly and wisely, are all practices that Christians can cultivate and proclaim. Christians individually and the churches as institutions can support and promote legislation that enhances the sustainability of the environment. The church and Christians individually can, for example, promote organic farming. In third world countries such as India, the land of the tribals, Dalits and other marginalized people are taken away from them in the name of progress and development. The churches can join hands with these people arguing for the rights of the displaced and the unfortunate. God&apos;s mission does not side with the powers that rule: God&apos;s mission is fulfilled in standing for the oppressed, be it the earth itself, or its marginalized people.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. A Mission Paradigm for Eco-Justice
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Civilization lost its reverence and awe of nature as it progressed with the help of science and technology. But many ancient civilizations looked upon nature as sacred, and those ancient civilizations had an insight into the inter-connectedness of all life. Now science also stresses the interconnectedness of all life, and it is known that ecologically, survival depends on biodiversity. The stress on eco-justice as mission should encourage movements which take into account both peoples need and nature&apos;s needs and should work for preserving the diversity of life on earth.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. Mission Paradigm for upholding the rights of Women
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The consumerist culture prevalent in our society looks at woman as an object of pleasure, and media-portrayals of woman deprive her of her inherent dignity and value. The mission of the church should include attempts to give back their voice to women, as a gesture of showing the church&apos;s solidarity with women&apos;s suffering under patriarchy. God&apos;s justice embraces all humankind, and so the church should denounce all discrimination against women.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    5. Mission Paradigm for Live as companions in Solidarity with the Suffering
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church should extend its mission activities to offer companionship to people who are ostracized due to the contracting of disease like HIV/AIDS. Another area of mission for church is the caring of the aged who do not have anyone to take care of them. Juvenile delinquents also need to be restored to normal life and churches should feel the need to extend the gospel values of the Kingdom of God to include services to such people also.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    6. Mission Paradigm to Collaborate with Other Churches and Groups
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are situations such as unexpected natural calamities wherein Christian love should be manifested and demonstrated through action for people who are struck by these calamities, and who need help. In such cases, instead of working on their own, the different churches can come together in the name of Christ to collaborate with each other&apos;s relief groups. This can be a pattern for community development works, and also for establishing peace in areas where communal disharmony and violence break out. This sort of coming together will promote ecumenism among the churches.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    7. Mission in Empowering the Powerless
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church&apos;s mission should also include empowerment of the powerless. The Christian churches have been instrumental in giving education to the masses, and thus empowering them. But it has to stand and work specifically for the empowerment of people who are powerless and suffering. Solidarity with the poor means participating in their struggle for justice, and not just offering charity from afar. There is a need for a radical change in the system of exploitation which makes the rich richer and the poor poorer. The churches should reconsider their idea of mission to include action and thought which will support policies to eradicate poverty and suffering of the masses, and which will witness for Christ effectively in our country. People throughout the ages have recognized the great bond between justice, peace and the integrity of creation. A great longing for justice lies at the heart and mind of those who are denied justice everywhere. When deprived of justice, disappointments, frustration, unrest, riot, rebellions and wars happen. These will always destroy peace. The injustices that are rampant in society may be traced to various evils such as discrimination based on caste, class and gender. These evils exist in society in general, and also in the body of God, as represented by the church. Both in the West and in the East, Christian mission has been anthropocentric. The Bible, especially the creation story in the book of Genesis, was formerly interpreted in such a manner as to prove man&apos;s superiority over nature and its creatures. Western colonizers moved forward subduing and conquering nature and other cultures, even destroying them. Other cultures, beliefs and religions were considered inferior when compared with the dominant Western culture. Now, all over the world there is a voicing of the need that marginalized and oppressed people should be enabled to join the main stream of society, and that there should be a movement towards justice for all. The ecological movement and the feminist movement of the twentieth century have succeeded in making people conscious of the need to preserve nature and uphold the dignity of women. The impact of these movements can be seen in the main thought processes in the twentieth century, and theology is no exception.
                  </p>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Mission in the 21st century should take in to account contemporary realities. India has gone through changes in the political, social and economic sectors and mission needs to consider these drastic changes and evolve new paradigms to suit contemporary times. India is a country where people of different faiths reside. In such a multifaith context, there is a great need for harmony among people of different religions. Encouraging inter-religious dialogue will help people to know the commonalities in all religions. Instead of fighting in the name religions, it might help one to love one&apos;s neighbour who is also God&apos;s child, and it will encourage people to respect each other&apos;s religions, and also create a suitable environment for peaceful co-existence. Churches need to concentrate on this aspect of God&apos;s mission in contemporary India. The capitalist mode of economy creates a situation where the rich become richer and the poor become poorer. It encourages a consumerist mode of living which does not think about the poorest of the poor, or of future generations. The limited resources of the earth are plundered and exhausted, and the protective ozone layers are also destroyed due to man&apos;s greed. In a highly mechanized culture, human beings lose their dignity as individuals and they feel that they are insignificant. A highly consumerist culture also sees women as commodities to be bought and sold. Female infanticide, destroying female-life even at the foetal level, dowry deaths, trading in sex and such evils have their roots in the emerging consumerist mode, which is the mark of the day. The church must stress the need to go back to a simple, frugal life as against the flamboyant exhibitionism wealth tempts. The church&apos;s mission should include propaganda against consumerism. Jesus Christ went in search of the oppressed and marginalized, and the church&apos;s mission should also include the empowerment of the powerless and the marginalized. Tribals, women and children all need the special attention of the church, and mission today has a calling to concentrate on programmes for the benefit of these groups.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The churches while pursuing mission work had, on many occasions, gone away from God&apos;s mission. The conquest, colonizing and destroying of other cultures were all done with a view to do mission in a militant manner. But God&apos;s mission must achieved by respecting each individual&apos;s intrinsic worth, the right to freedom and independence, and respecting differences among peoples. Seeing the divine in the midst of a plurality of experiences is the need of the hour. God&apos;s mission has to be sought in new and varied ways by the churches in the rapidly changing life situations we see in our own time. Rather than the militant missions of yester years, it will be the peace-building, soothing, sustaining activities of Christian mission that will be welcomed as the work of God in the present communally torn Indian situation, and indeed throughout the world.
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Thomas Varghese Chavadyil,
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Professor, Orthodox Theological Seminary, Kottayam
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
