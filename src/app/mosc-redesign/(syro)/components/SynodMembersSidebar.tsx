'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SynodMember {
  name: string;
  href: string;
}

const synodMembers: SynodMember[] = [
  { name: 'H.H. Baselios Marthoma Mathews III, The Ninth Catholicos of the East in Malankara', href: '/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii' },
  { name: 'H. G. Dr. Thomas Mar Athanasius Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-dr-thomas-mar-athanasius' },
  { name: 'H.G. Dr. Yuhanon Mar Meletius Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-yuhanon-mor-meletius-metropolitan' },
  { name: 'H.G. Kuriakose Mar Clemis Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-kuriakose-mar-clemis' },
  { name: 'H.G.Geevarghese Mar Coorilos Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-geevarghese-mar-coorilose-metropolitan' },
  { name: 'H.G. Zachariah Mar Nicholovos Metropolitan', href: '/mosc-redesign/holy-synod/h-g-zachariah-mar-nicholovos-metropolitan' },
  { name: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-jacob-mar-irenios' },
  { name: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-dr-gabriel-mar-gregorios' },
  { name: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan', href: '/mosc-redesign/holy-synod/his-grace-dr-yoohanon-mar-chrysostamus' },
  { name: 'H.G.Yuhanon Mar Policarpos Metropolitan', href: '/mosc-redesign/holy-synod/h-g-youhanon-mar-polycarpus-metropolitan' },
  { name: 'H. G. Mathews Mar Theodosius Metropolitan', href: '/mosc-redesign/holy-synod/h-g-mathews-mar-theodosius' },
  { name: 'H.G.Dr. Joseph Mar Dionysius Metropolitan', href: '/mosc-redesign/holy-synod/h-g-joseph-mar-dionysius-metropolitan' },
  { name: 'H. G. Abraham Mar Epiphanios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-abraham-mar-epiphanios' },
  { name: 'H. G. Dr. Mathews Mar Thimothios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-mathews-mar-thimothios-metropolitan' },
  { name: 'H. G. Alexios mar Eusebius Metropolitan', href: '/mosc-redesign/holy-synod/h-g-alexios-mar-eusebius-metropolitan' },
  { name: 'H.G. Dr. Yuhanon Mar Diascoros Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-yuhanon-mar-dioscoros-metropolitan' },
  { name: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-yuhanon-mar-demetrius-metropolitan' },
  { name: 'H.G. Dr.Yuhanon Mar Thevodoros Metropolitan', href: '/mosc-redesign/holy-synod/h-g-yuhanon-mar-theodorus-metropolitan' },
  { name: 'H.G. Yakob Mar Elias Metropolitan', href: '/mosc-redesign/holy-synod/h-g-yakoob-mar-elias-metropolitan' },
  { name: 'H. G. Dr.Joshua Mar Nicodimos Metropolitan', href: '/mosc-redesign/holy-synod/h-g-joshua-mar-nicodemus-metropolitan' },
  { name: 'H.G. Dr. Zacharias Mar Aprem Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-zacharias-mar-aprem-metropolitan' },
  { name: 'H.G. Dr. Geevarghese Mar Yulios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-geevarghese-mar-julius-metropolitan' },
  { name: 'H.G. Dr. Abraham Mar Seraphim Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-abraham-mar-seraphim-metropolitan' },
  { name: 'H.G. Abraham Mar Stephanos Metropolitan', href: '/mosc-redesign/holy-synod/h-g-abraham-mar-stephanos-metropolitan' },
  { name: 'H.G. Dr. Thomas Mar Ivanios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-thomas-mar-ivanios-metropolitan' },
  { name: 'H.G. Dr. Geevarghese Mar Theophilos Metropolitan', href: '/mosc-redesign/holy-synod/hg-dr-geevarghese-mar-theophilos-metropolitan' },
  { name: 'H.G. Geevarghese Mar Philoxenos Metropolitan', href: '/mosc-redesign/holy-synod/h-g-geevarghese-mar-philaxenos-metropolitan' },
  { name: 'H.G. Geevarghese Mar Pachomios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-geevarghese-mar-pachomios-metropolitan' },
  { name: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan', href: '/mosc-redesign/holy-synod/h-g-dr-geevarghese-mar-barnabas-metropolitan' },
  { name: 'H.G. Zachariah Mar Severios Metropolitan', href: '/mosc-redesign/holy-synod/h-g-zacharia-mar-severios-metropolitan' }
];

export default function SynodMembersSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Holy Synod</h3>
      <nav className="space-y-1">
        {synodMembers.map((member) => {
          const isActive = pathname === member.href;
          return (
            <Link
              key={member.href}
              href={member.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
              }`}
            >
              {member.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
