import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BISHOP_NAME = 'His Holiness Baselios Marthoma Mathews III';
const BISHOP_ABOUT =
  'His Holiness Baselios Marthoma Mathews III was enthroned as the Catholicos of the East & Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Friday, 15th October 2021. His Holiness is the 92nd Primate on the Apostolic Throne of St. Thomas.';

export default function SyroCatholicosSection() {
  return (
    <section className="cardinal-new syro-cardinal-section" id="syro-cardinal-section">
      <div className="container">
        <div className="row align-items-start">
          {/* Left column: images (main + overlay at bottom-right) */}
          <div className="col-lg-6 order-2 order-lg-1">
            <div className="cardinal-images syro-cardinal-images">
              <div className="cardinal-black-white-div syro-cardinal-main-img-wrap">
                <Image
                  id="bishop_image_front_1"
                  src="/mosc/assets/images/mosc_images/Baselios_Marthoma_Mathews_III.jpeg"
                  alt={BISHOP_NAME}
                  width={400}
                  height={500}
                  className="cardinal-black-white lozad w-100"
                  style={{ filter: 'none' }}
                />
                <div className="cardinal-color-div syro-cardinal-overlay">
                  <Image
                    id="bishop_image_front_2"
                    src="/mosc/assets/images/mosc_images/Baselios_Marthoma_Mathews_III_2.jpeg"
                    alt={BISHOP_NAME}
                    width={220}
                    height={280}
                    className="cardinal-color lozad"
                    style={{ filter: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Right column: vertical label, heading, name bar, text, button */}
          <div className="col-lg-6 order-1 order-lg-2">
            <div className="cardinal-new-details syro-cardinal-details">
              <div className="section-title syro-cardinal-section-title">
                <h6>Malankara Metropolitan</h6>
              </div>
              <div className="cardinal-new-container syro-cardinal-container">
                <h2 className="syro-cardinal-heading">
                  <span className="syro-cardinal-heading-red">Catholicos</span>
                  <br />
                  <span className="syro-cardinal-heading-blue">of the East and Malankara Metropolitan</span>
                </h2>
                <div className="syro-cardinal-name-bar" id="bishop_name_bar">
                  <span id="bishop_name">{BISHOP_NAME}</span>
                </div>
                <p className="syro-cardinal-about mb-0 text-black" id="bishop_about">
                  {BISHOP_ABOUT}
                </p>
                <Link href="/mosc-redesign/holy-synod/his-holiness-baselios-marthoma-mathews-iii" className="primary-button cardinal-new-profile syro-cardinal-profile">
                  <span>View Profile</span>
                  <i className="fa-solid fa-arrow-right-long ms-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
