import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Ecclesiology | Theology | MOSC',
  description:
    'Ecclesiology: the nature and purpose of the Church in Orthodox theology. Origin in Christ, images of the Church, the four marks, and kingdom-oriented ecclesiology.',
};

export default async function EcclesiologyPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Ecclesiology"
        breadcrumbFrom={breadcrumbFrom}
        breadcrumbParent={breadcrumbFrom === 'the-church' ? { label: 'Theology', href: '/mosc/the-church/theology' } : undefined}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                      src="/images/church/theology.jpg"
                      alt="Ecclesiology - Nature and Purpose of the Church"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Too much compartmentalization like theology, spirituality, liturgy etc and further divisions of theology into Christology, ecclesiology, pneumatology etc were alien to the early Christian fathers and thus foreign to the Orthodox Ethos. Because of the integral vision of the fathers, the theme of the church pervades all aspects of the Orthodox theological and liturgical spiritual orientation. So a limited and exclusive analysis of the Church is not an easy task. Added to that a long historical continuity of the church and continuation of it to future even beyond history and its oneness with Christ and its kingdom oriented existence in the world etc leave an analysis of it a difficult task. However with the help of some popular images and prayerful reflection we may be able to know a little bit of the origin, nature and purpose of the Church(ecclesiology).
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    The word &apos;ecclesia&apos;
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Ecclesiology which deals with the nature and purpose of the Church comes from &apos;ecclesia&apos;, the common Greek term used in New Testament to denote Church. Though it appears only twice in the synoptic gospels (Mt 16:18; 18:17) it is a common and repeated term in Acts and Pauline letters. Ecclesia comes from the Greek verb &apos;kaleo&apos; which means I call. It indicates the fact that Church is the assembly of those who responded to the call from God or to the good news. In other words it is a community called out by God from the world for a purpose. Ecclesia is the Greek equivalent of the Hebrew word qohal which is used in Old Testament to describe the Jewish assembly gathered mainly for worshipping God. By using the Greek equivalent of the Jewish assembly for indicating church, the early Christian community was disclosing its self identity as the chosen people of God or the New Israel which replaces the old Israel( I Pet 2: 9-10; Tit 2:14) The early Christians thought of themselves as the children of God and specially chosen and holy people of God.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Origin and foundation in Christ
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Even if Jesus has not founded a Church directly, in the ultimate analysis Jesus Christ is the origin and foundation of the Church. The church was formed by those who responded to God&apos;s call in Christ. After St. Peter&apos;s confession of Jesus as the Son of God, Jesus says that He will build his church on this rock meaning the faith just proclaimed by Peter. All those who imitate St. Peter and make the same confession likewise inherit the same promise. It is on them, on all believers that the church is built. Understanding the truth and response to it in faith are essential for the building up of the church. Many of Christ&apos;s words and deeds reveal His intention to found a church. Jesus gathered disciples around himself so that later on they could assemble the people of God around Himself. The last supper with the institution of the Eucharist was to help them to continue a community life by being rooted in Him. Likewise the words to the disciples reveal his intention that the community of disciples is to continue to stay together.(Lk:22:16,30,31). The risen Lord bestows powers on the disciples for the continuation of his work in the world. The resurrection of the Lord and Pentecost were two very significant events which contributed to the real birth of the church.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Images of the Church
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are a lot of poetic images and figures of speech for the Church in Orthodox liturgical texts, all derived directly or indirectly from the Bible. This ranges from Noah&apos;s ark in the Book of Genesis to the bridal image of the Church as New Jerusalem in the Book of Revelation. Ancient Christian fathers have interpreted Noah&apos;s ark as a shadow of the Church. The ark of the church is not a symbol of condemnation and destruction but a sign of salvation and renewal of the whole creation. As Christ came not to judge people but to save the world (John 12:47) the church has no right to judge people but is responsible for the redemption of the whole world. Maternal image of the church is also very important in the Orthodox tradition. Rev. Fr. Dr. K. M. George describes it thus: &quot;The Church is personified as mother of the faithful and bride of Christ, and the third person feminine pronoun &apos;she&apos;, rather than the neuter &apos;it&apos;, is consistently applied to the Church in Orthodox theology, hymnology and prayers. On many an occasion the Holy Virgin Mary stands as a symbol of the Church (Rev.12:1). In Orthodox iconography of Pentecost, for instance, the Virgin Mary remains at the centre of the picture surrounded by the Apostles. Obviously she symbolizes the Church. The newly baptized persons are said to be born from the womb of the Mother Church. The maternal image of the Church is deep rooted in the liturgical piety of the Orthodox.&quot; Three frequently used images of the Church in liturgical texts and hymnology are body of Christ, living temple and bride of Christ.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. The Church as the body of Christ
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The image of Body is a central metaphor in the Pauline writings. ( Rom 12: 4-5, I Cor 12, Eph 4:12, Col 1: 24) It emphasizes both the close and intimate connection of the Church to its head Christ and the fellowship of the members of the Church. We are to relate to each other and enjoy harmony as limbs of the same body. Only through compassion, humility, forgiveness and peacemaking in the church we can maintain the harmony of the one body. Christ continues to be present and visible in history through his body the church. So the Church is a continuation of the incarnation of Christ.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    St. Paul describes the church as Christ&apos;s pleroma who fills the universe in every respect. (Eph 1:22,23) One important meaning of the Greek word pleroma which is translated in this passage as fullness is &apos;that which fills the gap or supplies what is lacking. As Paulos Mar Gregorios says &quot; the church is the pleroma of Christ in the sense that &apos; the whole Christ&apos; is the incarnate Lord with His body, the ecclesia.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. The Church as the living temple
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is not a dead material construction but a living organism. Christ himself is the corner stone; the apostles and prophets are the foundation; believers are living stones that add to the growth of the building. This image also highlights the fellowship of the members in the church and the union of the church with Christ, the foundation. On behalf of the whole creation worship is offered to the Triune God in this living temple. In other words this living and ever-growing temple indwelt by the Holy Spirit stands for the whole created universe. We are also joining heavenly orders in worship
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. The Church as the Bride of Christ
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    St. Paul uses the image of the marital bond between husband and wife to portray the mystery of the deep communion between Christ and his bride the church. This image gives us a vision of the ultimate oneness between Christ and his Church. Christ is preparing the bride for the final presentation at the wedding. These images give an organic view rather than an instrumentalist view of the church. Church being integral part of Christ evokes veneration and respect rather than blaming and criticism. At the same time the Church needs to grow in its loving union with Christ and obedient submission to the will of God as revealed in Christ. These images also indicate the beauty of the fellowship and community life in the church. They do point to the mystery of the church by depicting the combination of the historical and eschatological dimensions and also the past, present and the future as well as the immanent and transcendent dimensions of the church.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Universal Ecclesiology and Eucharistic Ecclesiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Orthodox Tradition prefers to practice Eucharistic ecclesiology than universal ecclesiology. Universal ecclesiology depicts the church as a single organic whole including in itself all church units of any kind all over the world. The different parts or members of this church are joined like branches of a single tree. According to the Eucharistic ecclesiology which is more primitive one, each local church was the church of God in all its fullness. Every local church manifests all the fullness of the church of God and not just one part of it. The Eucharist(Holy Qurbana) is where Christ dwells in the fullness of His body. The Eucharist could never have been offered in a local church if it had been just one part of the church of God. Where the Eucharist is there is the fullness of the church. Eucharistic ecclesiology denies the idea of &apos;parts&apos; cherished by the universal ecclesiology. Eucharistic ecclesiology upholds conciliarity in the church. In fact no local church with its presiding bishop has the right to exercise authority or power over other local churches. But they live in fellowship and mutual support. If the bishops meet in council, one of them serves as the president of the councils. His authority or priority is based on the higher witness and love of his church. Primacy is a legalistic expression whereas priority is founded on authority of witness and that is a gift of God. But the ecclesiology of a Universal Pontiff seems to suggest a superior to all the other bishops or a &apos;super- bishop.&apos; In consequence, the others seem to become mere administrative instruments of the supreme head. A note on local church seems to be relevant here. In the Orthodox tradition the word &apos;local&apos; mainly refers to a large cultural grouping with the same cultural heritage or a geographically distinct area like an island. The expression local church often refers to a regional church. The present autocephalous churches like Coptic Orthodox Church, Indian Orthodox Church, Russian Orthodox Church etc are examples of local churches.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Four Marks of the Church
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The Nicene – Constantinopolitan creed formulated by the first two ecumenical Councils, namely Nicea in 325 and Constantinople in 381 is a unique summary statement of Christian faith. The creed attaches four adjectives to the Church- Catholic, Apostolic, One, and Holy. Catholicity, Apostolicity, Unity and Holiness have become the four principal marks of the church and an interpretation of these will give us a basis for a sound ecclesiology.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    1. Catholicity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The word &apos;Catholic&apos; comes from the Greek Kath&apos;olon which means pertaining to the whole or holistic. The Greek words subsequently found their way into Latin word Catholicus, which came to have the meaning &apos;universal or general&apos;. The first known use of the phrase &apos;the Catholic Church&apos; occurs in the writings of St. Ignatius of Antioch who was martyred in Rome around 110 AD. Early Christian fathers used the word Catholic more in a qualitative than in a quantitative sense. In other words it did not have the geographical connotation of a Church that was spread over the whole earth in the writings of the fathers before the ruler Constantine in 4th century. Roman Catholic Church&apos;s self understanding is closely associated with a geographical and quantitative dimension at least since the colonial expansion of the west into the rest of the world. Catholicity of the church can not be limited to mere geographical universality. The fourth century father St. Cyril of Jerusalem gives a comprehensive definition of the word catholic: &apos;The church is catholic ( &apos;universal&apos;) because it has spread all over the world and because it imparts instruction in its fullness to all people regarding matters visible and invisible, earthly and heavenly. The Church leads all sorts of people, the ruler and the ruled, the learned and the ignorant. It treats and heals the sinful soul and body. It embodies all virtues and deeds. It is endowed with all kinds of spiritual gifts.&apos; In terms of its early development, the term &apos;Catholic&apos; as applied to church went through three stages of meaning; 1. A universal and all embracing church, which underlies and undergirds individual local churches. Orthodox ecclesiology is based on the notion that a local Christian community, gathered in the name of Christ, presided over by the bishop, celebrating the eucharistic meal and witnessing Christ is indeed the catholic church and the body of Christ. 2. A church which is orthodox in its theology. Catholicism is now contrasted with schism and heresy by which individuals place themselves outside the boundaries of a doctrinally orthodox church. 3. A church which extends through out the world. The term thus came to posses a geographical reference, originally absent. A fundamental reexamination of the notion of Catholicity took place at the time of the reformation. Protestant writers argued that the essence of Catholicity lay, not in church institutions, but in matters of doctrine. The reformers argued that they remained Catholic, despite having broken away from the medieval church, in that they retained the central and universally recognized elements of Christian doctrine. The mainstream Protestant churches insisted they were simultaneously &apos;catholic&apos; and &apos;reformed&apos; – that is maintaining continuity with the apostolic church at the level of teaching, having eliminated spurious non- biblical practices and beliefs. In the modern ecumenical discussions Catholicity is used in the oldest sense of the term- namely that of totality. Local churches are to be seen as the manifestations, representations or embodiments of the one universal church. As Hans Küng states &quot; Unity and Catholicity are two interwoven dimensions of one and the same church.&quot;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    2. Apostolicity
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Apostolicity refers to the common witness of the apostles on which the church is founded(Eph. 2:20)The apostles&apos; experience of God in Christ is transmitted down through the generations in the church. Commitment to this unbroken stream of apostolic tradition ensures the apostolicity of the church. Apostolic succession is a continuity of the church not with an individual apostle but with the apostolic college as a whole and the community of the church. The apostolic succession is the faith and the instruction of the apostles preserved and transmitted by the Christian community. It is not strictly limited to the laying on of hands through an unbroken chain of bishops which started from the apostles. A good picture of the apostolic church is seen in the beginning of the Acts where the Apostles with St. Mary and other followers of Christ gathered in the name of the risen Christ. Being filled with the Holy Spirit the apostles took leadership to witness Jesus Christ crucified and risen. They became a sharing community, sharing the Eucharist and food and other material resources. The Apostolic Church in all ages participates in the faith, worship and witness of the Apostles. Apostolicity also refers to the mission of the church among the poor and the oppressed. The word missionary is derived by the Latin translation of &apos;apostolic.&apos; Apostle is one who is sent with a mission. The church has also been sent to announce the gospel of the kingdom of God to the poor, healing the sick and liberating the oppressed. The apostolic church has been called upon to work for the good of all mankind. The church loses its apostolic character if it works for narrow communal, racial or political interests. The church that is oriented to the kingdom of God or works for justice and peace in the world and brings love and joy to humanity bears witness to its apostolic nature.
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    3. Unity of the church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The unity of the church is a unity in faith and not an administrative unity. A return to the faith of the apostles and the adherents of the undivided church is necessary for a meaningful unity in the church. The fellowship and unity of the Holy Trinity is the supreme model of unity for the church. Cooperation with the Spirit of God who is the principle of unity in the church is essential for building it according to the beauty of unity in Trinity. St. Ignatius of Antioch depicts &apos;the church as the choir to sing Christ.&apos; Local Churches are in communion with each other. One universal head or administrative set up or ecumenical synods on regular basis are not essential for such communion of the Orthodox Churches. Oriental Orthodox Churches have three ecumenical synods, Ephesus 431 being the last one and Eastern Orthodox Churches have seven ecumenical synods the last one being held in 787. Though these ecumenical synods were important expressions of the unity of the churches, for many centuries after these, the churches enjoyed communion without the regular ecumenical synods. That is why H. G. Paulos Mar Gregorios is of the opinion that they are not inevitable to maintain the communion within the Orthodox Tradition. Diversity in culture among the different sects in different regions is permissible and healthy and it makes the unity of the church richer. Such regional sects which facilitates contextualization of theology and worship with freedom in administrative matters have their own ecclesiastical leadership. It is in this context must we understand autocephaly as a major feature of all orthodox communities. From the 16th century onwards it became clear in the west that the idea of &apos;one church&apos; could no longer be understood sociologically or institutionally. In order to solve this contradiction of a theoretical belief in one church and the reality of a plurality of churches, some Christian thinkers developed various approaches: 1. An imperial approach, which declares that there is only one empirical church which deserves to be treated as the true church with all others, being approximations to real thing. This position was characteristic of Roman Catholic Church prior to II Vatican council. Many Orthodox theologians also holds a position which seems to be closer to this. 2. A Platonic approach, which draws a fundamental distinction between the empirical church and the ideal church. This has found relatively little support in mainstream Christian theology. 3. An eschatological approach, which suggests that the present disunity of the church will be abolished on the last day. Calvin&apos;s distinction between the visible and invisible churches is noticeable. 4. A biological approach, which likens the historical evolution of the church to the development of the branches of a tree. So despite the differences there is an organic unity. 5. Communion approach: Many theologians concerned with ecumenism today recommend communion ecclesiology. The church is a communion of various churches centered around Christ. This seems to be a relevant concept in this age of global ecumenical consciousness. As Hans Küng points out &apos;the unity of the church is grounded in the saving work of God in Christ. The one church adapt itself to local cultural conditions, leading to the formation of local churches.&apos;
                  </p>

                  <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-8 mb-3">
                    4. Holiness of the Church
                  </h3>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is holy because Christ, the holy head of the church has called us to participate in his holiness through the church. Expression of holiness is love, goodness and unceasing fight against dehumanizing structures and evil everywhere. The expression &apos;communio sanctorum&apos; (communion of saints) is used as a synonym of the church. The presence of the holy men and women, both living and dead, is an important aspect of the holiness of the church. The Holy Spirit who dwells in the Church and guides it in all truth is the main sanctifying grace of the church. The epiclesis or invocation of the Spirit is not merely a liturgical act just meant for the transformation of the bread and wine into the body and blood of Christ. But it is to be considered as longing for the life giving breathing of the Holy Spirit which sanctifies the community and makes it a source of sanctifying grace. Sins of the laymen or clergy who are members of the church do not make the church sinful according to the orthodox tradition. The mother church encourages them to confess their sins and it is the church itself transmits the divine absolution of sins through its priestly ministry.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Special Ministry and Authority
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Through baptism all the members of the Church are initiated into and anointed for the ministry of the kingdom of God. However Holy Spirit guides the community to select and appoint special ministers such as bishops, priests and deacons to serve the church. They are also part of the body of Christ and they exercise authority like Christ who humbled himself to serve. They are appointed to their respective offices by the whole worshipping community through an ordination service in the context of Eucharistic celebration. The bishop who is the sacramental presence of Christ in the community together with the clergy play a significant role to lead the faithful in the orthodox faith, worship, unity and witness. The Eucharistic assembly presided over by the bishops together with the clergy and faithful in faith, hope and love serves also as a symbol of the unity of the church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Church&apos;s authority and identity is that of Christ. The church sees its authority in caring for humanity, in emptying itself for others. The words like forgiveness, liberation, healing, reconciliation, love, salvation etc should always replace the words like rule, command, judgment, punishment, etc in the Church to reveal its true authority. Authority is not an end in itself. Responsibility of the leadership is to preserve the apostolic faith in the church and to ensure the spiritual growth of the community as the body of Christ and the exercise of mission according to His wish. They are teachers of true faith. While all members of the church have the responsibility to enlighten others and especially the new generations with regard to the faith, the bishops and the clergy are invested with the special charisma to teach and proclaim the true faith.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Kingdom Oriented Ecclesiology
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    An understanding of the proper relationship of Church, kingdom of God and the world is essential for a sound ecclesiology. Kingdom of God is God&apos;s dream for the world. Liberation from personal and social evil, peace and fellowship and union with God are important aspects of the kingdom of God, the central message of Jesus Christ. What he meant was a fullness of life by submission to the will of God which is to be realized in history, continuation of which is the heavenly experience. The old testament concept of Shalom which is a concern for the welfare of the whole creation is almost identical to the vision of the kingdom of God. We get a perfect picture of the kingdom of God in the life of Jesus Christ. The Church which is Christ&apos;s body is the initial budding forth of the kingdom of God. Even if in a realistic approach Church can not be identified with the kingdom of God, they are in close correlation and can not be separated either. Being the sign and sacrament and instrument of the kingdom of God, the church is serving the world. Compared to the Church, kingdom of God is a larger and more comprehensive term and vision. It is a great privilege that God is giving participation to Church in his dream for the world which is the kingdom of God ministry. Following are some of the advantages of this Kingdom oriented ecclesiology. It liberates the members of the church from unnecessary superiority complex because it subordinates the church to the kingdom. It discourages too much introverted attitude and encourages serving the world. It helps to shift the focus from too much idealistic understanding of the church to more realistic self understanding. It liberates from the secularist temptation to identify the church with the world. The kingdom focus also prepares the ground for the harmony of the churches and cooperation of religions.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Indian Perspective
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    As the Indian Christian theologian Felix Wilfred says the starting point for the budding forth of Indian ecclesiology is the inner experience. Church is viewed as the community of those who are awakened to the Divine mystery. Church is defined as a community of Jesus- Bhaktas. They follow his footsteps, make his experience their own. The Indian theologians use the model of Indian religious bodies like Sabha, samaj, sangha to refer to this. These bodies which have Hindu or Buddhist background is a community of fellowship of equals. Sangha is the body of the enlightened among whom Buddha is present. Other models proposed for living and understanding the mystery of the church are the village communities of the tribals of India. Among these communities, unlike the traditional Hindu society, we note a strong sense of equality and close bonds of fellowship. Indian Christian thinkers recommend a culturally founded ecclesiology. There are some human and cultural traits and values in India which have implications for the understanding of church-community and its praxis. Inclusivism, for example is a characteristic Indian cultural trait which is reflected in the way any community is conceived and lived; the boundaries are not rigidly marked, structures not rigorously fixed and conditions of belonging not strictly laid down. Community exists in the people, in their spirit, attitude and values and in their vision and experience. The deeper religious experience and the path one follows to attain it are more important than the external religious identity. Ashram ideal is also seen as a possible expression of ecclesial community. Experience of God, contemplation, simplicity of life, interiority, hospitality, renunciation and the practice of poverty are traditional Indian religious cultural ideals practiced in Ashram life, but with out association with any rigid structures. While not denying the usefulness of some kind of fluid structures, the Indian ecclesiologists would question any undue place accorded to structures as a vehicle for the transmission of the spirit and teachings of Jesus. Hinduism has continued to flourish almost for forty centuries with out the support of any rigid external structures or a system of central authority from generation to generation. Hinduism has been transmitted as a part and parcel of the life of the people. So the transmission should not be entrusted to external structures only. The poor are a dispensable lot in India. In spite of their marginalization and impoverishment due to the political social and religious oppressions they are awakened to their rights for basic necessities, equality and self determination. The first thing expected of the church is a deep sensitivity to people&apos;s movements and struggles and the burning questions they raise. Local church is a community that lives Jesus&apos; vision of the kingdom in dialogue with the life realities of the people, especially the oppressed and the downtrodden. It is through dialogue with poor that a church which claims to be sign and sacrament of the kingdom of God can be built up. Indian theologians like M.M.Thomas, Michael Amaladoss Felix Wilfred etc are of the opinion that &apos; An inculturation that is not liberation- oriented can become church centered and not kingdom centered.&apos; The power and privileges enjoyed by the church in India through its many institutions are road blocks to its solidarity with the poor and their struggles. Another major hindrance is the ghetto mentality of the churches which discourage the Christians to relate to the society with overwhelming population of Hindus, Muslims and other religious groups. The model is nothing else but God&apos;s relationship to people without discrimination in and through Jesus Christ and also His identification with the struggling poor.
                  </p>

                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-10 mb-4">
                    Conclusion
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    The church is the continuation of the incarnation of Jesus Christ. In union with Christ, the Church makes God visible to the world. As a mother it brings up its children in the image and likeness of God. Third century Christian father Cyprian of Carthage goes to the extent of saying that &quot;he (/she) can no longer have God for his (/ her) Father, who has not the church for his (/her) mother.&quot; Health of this mother is interconnected with the growth of its children and the sound health of the world. So it is an important task of the members to participate in the building up of the church done by God himself. It is the Holy Spirit who is perfecting everything leads the church to perfection in its essential marks and mission. The Holy Spirit is the secret inspiration of steadfastness to the apostolic faith, witness to Christ, service to the poor and needy, and harmony of the Church. Is the Church preparing herself to listen sincerely to this perfecting guide.?
                  </p>

                  <div className="bg-syro-red/5 rounded-lg p-6 mt-8 border border-syro-table-border">
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Fr. Bijesh Philip,
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Principal
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      St. Thomas Orthodox Seminary
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed text-center font-semibold">
                      Nagpur
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
