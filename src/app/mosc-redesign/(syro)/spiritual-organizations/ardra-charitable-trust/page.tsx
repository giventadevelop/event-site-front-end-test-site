import React from 'react';
import Image from 'next/image';
import SpiritualOrgSubpageLayout from '../SpiritualOrgSubpageLayout';

export const metadata = {
  title: 'Ardra Charitable Society | MOSC',
  description: 'Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India. President H.G. Dr. Abraham Mar Seraphim Metropolitan.',
};

const ArdraCharitableTrustPage = () => {
  return (
    <SpiritualOrgSubpageLayout
      title="Ardra Charitable Society"
      currentHref="/mosc-redesign/spiritual-organizations/ardra-charitable-trust"
    >
      <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
        <div className="mb-8 flex justify-center">
          <Image
            src="/images/spiritual/ARDRA.png"
            alt="Ardra Charitable Society"
            width={175}
            height={175}
            className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
          />
        </div>
        <p>
          Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India, irrespective of caste, creed or community.
        </p>
        <p>
          Etymologically derived from the Sanskrit word Ardra – Ardram in Malayalam – the name means compassion, fellow-feeling or sorrow for the sufferings of another. Ardra strives to help the poor and needy by providing primary necessities, education, medical care, job-training, marriage assistance, employment etc. This charitable society derives its inspiration from our Lord whose compassion towards suffering humanity was boundless. The one who loved us with an everlasting love has often called upon us to translate our love and pity into deeds, into meaningful gestures.
        </p>
        <p>
          Formed in August 2001, Ardra is under the direct patronage of H.H. Baselios Marthoma Paulose II, Catholicos of the East and Malankara Metropolitan. Registered (No. K. 451) under the provision of Travancore-Cochin Literary, Scientific and Charitable Societies Registration Act 12 of 1955 with its head office at Kottayam, Ardra is a non-profit charitable organisation operating throughout India.
        </p>
        <p>
          All contributions made to Ardra will be eligible for exemption under Section 80G of the Income Tax Act. Ardra is a registered entity with the Office of the Registrar of Companies, Ministry of Corporate Affairs under the Government of India, for undertaking CSR activities.
        </p>

        <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red mt-10">
          Office Bearers & Contact
        </h2>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2">
          President
        </h3>
        <p>H.G. Dr. Abraham Mar Seraphim Metropolitan</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          General Secretary
        </h3>
        <p>Joseph Alexander, Ph: +91 9446360949</p>

        <h3 className="font-syro-display font-semibold text-xl text-syro-blue border-b border-syro-table-border pb-2 mt-8">
          Contact Address
        </h3>
        <p>
          Catholicate Office, Devalokam P O<br />
          Kottayam -686004<br />
          Kerala, India
        </p>
        <p>Tel: 0481-2574457, 2578500</p>
        <p>
          Website:{' '}
          <a href="https://www.ardramosc.in" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.ardramosc.in
          </a>
        </p>
        <p>
          Email:{' '}
          <a href="mailto:ardra@mosc.in" className="text-syro-red hover:underline">
            ardra@mosc.in
          </a>
        </p>
        <p>
          <a href="https://www.facebook.com/ardramosc" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.facebook.com/ardramosc
          </a>
          <br />
          <a href="https://www.instagram.com/ardramosc" target="_blank" rel="noopener noreferrer" className="text-syro-red hover:underline">
            www.instagram.com/ardramosc
          </a>
        </p>
      </div>
    </SpiritualOrgSubpageLayout>
  );
};

export default ArdraCharitableTrustPage;
