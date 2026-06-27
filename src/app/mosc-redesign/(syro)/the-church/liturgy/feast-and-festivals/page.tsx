import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../../components/QuickLinks';
import SyroPageBanner from '../../../components/SyroPageBanner';
import TheChurchSidebar from '../../TheChurchSidebar';

export const metadata = {
  title: 'Feast and Festivals | Liturgy | MOSC',
  description:
    'Truth behind the Feast of Feasts: Easter in the Orthodox tradition, the resurrection of Christ, and its meaning for us today.',
};

export default async function FeastAndFestivalsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const breadcrumbFrom = params.from === 'the-church' ? 'the-church' : 'home';

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Feast and Festivals"
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
                      alt="Feast and Festivals"
                      width={125} height={125}
                      className="rounded-lg w-full max-w-[125px] max-h-[125px] object-contain" priority
                    />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mt-6 mb-4">
                    Truth behind the Feast of Feasts
                  </h2>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Easter is the greatest feast in the Orthodox tradition and the whole Great Lent is a pilgrimage to this feast of feasts. For fifty days from Easter, Orthodox Christians greet each other with the words &apos;Christ is risen&apos; of which the response is &apos;Indeed He is risen.&apos; Resurrection of the crucified Jesus Christ is the heart of Christian faith. Sunday became the most important day of worship from the time of the first century because of His resurrection on a Sunday. The Orthodox Church gives due importance to this unique event in its life and practice. They do not use crucifixion, the cross with an image of the crucified Jesus on it, because they would like even their cross to communicate the importance of the risen Christ. He is no more on the cross or in a tomb but trampling down death by death He is living for ever and ever.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are even Christians who are not fully convinced about the truth of the resurrection of Jesus. Christian theologians like Bultmann, influenced by the European Enlightenment movement which overemphasizes the place of reason in understanding, demythologized the gospel, further strengthening the skepticism regarding the resurrection of Jesus Christ. Liberation theologians&apos; focus is on the resurrection of the victims of injustice rather than the historical resurrection of Jesus Christ or they do not give due importance to the interconnectedness of these. The Lost Tomb of Jesus, the documentary film directed by James Cameron, which became a &apos;sensational news&apos; during the Great Lent of 2007, draws attention to a burial box found near Jerusalem in 1980 which the movie with its experts claim to be containing the bones of Jesus and his family. Even if there is an inscription of Jesus&apos; name on an ancient burial box, why do the director and other experts deliberately hide the fact that Jesus was a common name in Palestine in the first century? Unfortunately human creativity is misused for business purpose or for some other hidden agendas or it is enslaved by the western rationalism repeatedly. Committed Christians have no difficulty to believe that the resurrection of Jesus Christ was really a fact which has far reaching consequences. According to the teaching of Christ we are also in the generations of the blessed ones after the apostles&apos; time because we believe without seeing Him with our naked eyes. However our faith is based on the witness of those who saw Him. In a nutshell the apostolic witness is the foundation of the faith of the Church.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-3">
                    Even if faith does not need any evidence, we can see a couple of supporting factors to prove that the apostolic preaching about the resurrection of Jesus Christ as recorded in the gospels is true:
                  </p>
                  <ol className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 list-decimal pl-6 space-y-4">
                    <li><strong>Number of the witnesses:</strong> More than five hundred people were able to see the risen Christ (1 Corinthians 15:3-7). Since hallucination and dream are individual experience, the experience of the risen Lord by a large number of people cannot be understood as a result of a dream or hallucination.</li>
                    <li><strong>Women as the first witnesses:</strong> Mary Magdalene and other women saw the risen Jesus Christ first and they were asked to pass on this message to the apostles. If the Gospel account of the resurrection of Jesus was only a fabricated story by the apostles they would not have presented women as the first witnesses because in those days evidence of women had no value. If it was an imaginary story the apostles would have presented themselves or at least a few other men as the first ones to see Jesus after His resurrection.</li>
                    <li><strong>Self-criticism:</strong> According to the gospel accounts the apostles did not believe the words of the women about the resurrection of Christ and when Jesus met them He criticized them for not believing (Matthew 28:17; Mark 16:14). St. Mark who was a close associate of St. Peter writes as he heard from the apostles especially from St. Peter: &quot;He scolded them, because they did not have faith and because they were too stubborn to believe those who had seen him alive&quot; (Mk 16:14). Selfish minds normally, even in a true account, will not write this kind of self-deprecating words. Then if it was a false account they would never have used this criticism which is humiliating. This self-criticism points to the fact that the apostles were confessing in humility what had really happened.</li>
                    <li><strong>Empty tomb:</strong> According to the Gospels, Mary Magdalene, Peter, John and other Christians and the soldiers who were guarding the sealed tomb could see the tomb of Jesus opened and without the dead body in it. Even if Jesus could have come out without moving the stone which covered the tomb, it was removed so that the world could see the empty tomb as an evidence of His resurrection. When the guards reported it to the high priests they were bribed to tell the lie that Jesus&apos; body was stolen by the disciples while the guards were sleeping (Mt. 28:12-15). Why were the guards not punished for failing to be vigilant? Instead of that they received money for spreading a lie. How could they see clearly while sleeping that it was disciples of Jesus Christ themselves who &apos;stole&apos; it? If it was done by the disciples why did not the Jewish religious authorities, who took initiative to kill Him with the help of the Roman authorities, try to recover the dead body by arresting the weak and the frustrated disciples of Jesus Christ and foil the Jesus movement fully? There is no reasonable answer to these questions except the truth that Jesus was really risen from the dead which was not graspable easily to human minds.</li>
                    <li><strong>Enthusiasm and fervor of the apostles:</strong> The frustrated and disappointed disciples of Jesus Christ who locked themselves in a room after Jesus&apos; crucifixion were able to take up the ministry of the Kingdom of God entrusted to them with added vigor and increased enthusiasm mainly because of the vision of the risen Lord. They started spreading the good news and the Jesus movement became powerful enough to challenge even the mighty Roman Empire and turn the world upside down. The two particular events which had an enormous impact on them and made them founders and builders of the Church in various corners of the world were the resurrection of Jesus and the reception of the Holy Spirit.</li>
                  </ol>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    If the resurrection of Jesus was a real fact, what does it mean for us today? It gives liberation from fear: 1. the fear of death, 2. the fear of cross, and 3. the fear of loneliness. Jesus&apos; resurrection shows that through death He was not entering into emptiness but to eternity and through that opened window in the roof of history we can have a glimpse of eternity which is the foundation of our hope. Resurrection of Christ is a God-given certificate to the success of the way of cross which encourages us to commit to the discipleship of Him. The Lord Jesus is no more imprisoned in a tomb but is with us till the end strengthening us to finish our race successfully.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 italic">
                    <strong>Fr. Bijesh Philip, Principal, St. Thomas Orthodox Seminary, Nagpur</strong>
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
