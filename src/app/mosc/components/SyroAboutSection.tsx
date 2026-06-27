import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SyroSaintsSlider from './SyroSaintsSlider';

const ABOUT_DESCRIPTION =
  'The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India. We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations while serving our members with love, compassion, and spiritual guidance.';

export default function SyroAboutSection() {
  return (
    <section
      className="about-us bg-white"
      style={{
        paddingTop: '60px',
        paddingBottom: '60px',
        boxShadow: 'rgba(50, 50, 93, 0.25) 0 6px 12px -2px, rgba(0, 0, 0, 0.3) 0 3px 7px -3px',
      }}
    >
      <div className="container">
        <div className="section-title">
          <h6>About Us</h6>
        </div>
        <div className="background-text disable-select" />
        <div className="row">
          <div className="col-lg-6">
            <div className="about-data">
              <div className="main-title">
                <h1>
                  <span className="imp-color">The</span> <span className="imp-color">Malankara</span>
                  <br />
                  <span>Orthodox Syrian Church</span>
                </h1>
              </div>
              <div className="about-content">
                <p className="line-9 text-black" id="front_description">
                  {ABOUT_DESCRIPTION}
                </p>
              </div>

              <Link href="/mosc/the-church/the-malankara-orthodox-syrian-church" className="primary-button">
                <span>Know More</span>
                <i className="fa-solid fa-arrow-right-long ms-3" />
              </Link>

              {/* Our Saints & Blesseds - inside left column like syromalabarchurch.in */}
              <SyroSaintsSlider embedInAbout />
            </div>
          </div>
          <div className="col-lg-6">
            <div className="about-images">
              <div className="row position-relative">
                <div className="col-6 about-img-1">
                  <div className="img-1-container">
                    <Image
                      id="about_image_1"
                      src="/mosc/assets/images/mosc_images/Cross_Image.png"
                      alt=""
                      width={280}
                      height={380}
                      className="img-border img-1 w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="col-6">
                  <Image
                    id="about_image_2"
                    src="/mosc/assets/images/mosc_images/Malankara_Orthodox_Fathers_Image.jpeg"
                    alt="Malankara Orthodox Fathers"
                    width={320}
                    height={240}
                    className="img-border mb-4 img-2 w-full h-auto object-cover"
                  />
                  <Image
                    id="about_image_3"
                    src="/mosc/assets/images/mosc_images/MOSC_Cross_Inside_Circle.png"
                    alt=""
                    width={350}
                    height={200}
                    className="img-border img-3 w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
