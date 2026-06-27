import React from 'react';
import OrganizationCard from './OrganizationCard';

const SpiritualOrganizationsContent = () => {
  // Spiritual organizations data extracted from the original HTML
  const organizations = [
    {
      id: 1,
      title: "Orthodox Syrian Sunday School Association of the East (SUNDAY SCHOOL)",
      description: "Orthodox Syrian Sunday School Association of the East is a spiritual organization functioning in all the parishes of the Malankara Orthodox Church throughout the world. It takes care of the...",
      image: "https://mosc.in/wp-content/uploads/2015/03/ossae.jpg",
      link: "https://mosc.in/spiritual/orthodox-syrian-sunday-school-association-of-the-eastsunday-school/",
      icon: "BookOpen"
    },
    {
      id: 2,
      title: "Ecological Commission",
      description: "President H. G. Dr. Joseph Mar Dionysius Metropolitan Secretary Rev. Fr. Dr. Michael Zachariah (Mount Tabore Dayara, Pathanapuram)",
      link: "https://mosc.in/spiritual/ecological-commission/",
      icon: "Leaf"
    },
    {
      id: 3,
      title: "Divyabodhanam (Theological Education Programme for the Laity)",
      description: "The Divyabodhanam is a theological training programme for laity in the Church. It was founded in 1984 by the late HH Baselius Marthoma Mathews I by the initiative of the...",
      link: "https://mosc.in/spiritual/divyabodhanam-theological-education-programme-for-the-laity/",
      icon: "GraduationCap"
    },
    {
      id: 4,
      title: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies",
      description: "President H.G. Dr. Yuhanon Mar Thevodoros Metropolitan Office Address St.Paul's M.T.C , Mavelikara Ph- 0479 2302473, 2342709 Email- stpaulsmtc@yahoo.com",
      link: "https://mosc.in/spiritual/st-pauls-st-thomas-suvishesha-sangam-national-association-for-mission-studies/",
      icon: "Users"
    },
    {
      id: 5,
      title: "Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music",
      description: "Director  H. G. Dr. Zacharias Mar Aprem Metropolitan Email- sruthischoolofmusic89@rediffmail.com",
      link: "https://mosc.in/spiritual/orthodox-sabha-gayaka-sangham-co-sruthi-school-of-liturgical-music/",
      icon: "Music"
    },
    {
      id: 6,
      title: "Malankara Orthodox Baskiyoma Association",
      description: "President H. G. Dr. Mathews Mar Thimothios Metropolitan Vice Presidents Fr. Solu Koshy Raju Smt. Jessy Varghese Secretary Rachel P Jose +91 9497675787",
      link: "https://mosc.in/spiritual/malankara-orthodox-baskiyoma-association/",
      icon: "Heart"
    },
    {
      id: 7,
      title: "The Servants of the Cross",
      description: "President H. G. Geevarghese Mar Coorilos Metropolitan General Secretary Fr. Somu K. Samuel Ph- +91 9447933220 Office Address Carmel Dayara. Kandanad, Ph- 0484 2792159",
      link: "https://mosc.in/spiritual/the-servants-of-the-cross/",
      icon: "Cross"
    },
    {
      id: 8,
      title: "Ardra Charitable Society",
      description: "Ardra aims to work for the educational, social, cultural, spiritual and economic advancement of the marginalised people of India, irrespective of caste, creed or community. Etymologically derived from the Sanskrit...",
      image: "https://mosc.in/wp-content/uploads/2015/11/ardra.jpg",
      link: "https://mosc.in/spiritual/ardra-charitable-trust/",
      icon: "HandHeart"
    },
    {
      id: 9,
      title: "Akhila Malankara Prayer Group Association",
      description: "The Akhila Malankara Prayer Group Association has been constituted to monitor and streamline the prayer and reading habits of congregations in different prayer groups functioning in the various parishes under...",
      image: "https://mosc.in/wp-content/uploads/2014/12/Untitled-1.jpg",
      link: "https://mosc.in/spiritual/akhila-malankara-prayer-group-association/",
      icon: "Pray"
    },
    {
      id: 10,
      title: "Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)",
      description: "AMOSS is a movement working on the following objectives: To give instructions to the altar boys of all parishes in the Malankara Church to make uniformity in the worship of the...",
      image: "https://mosc.in/wp-content/uploads/2014/12/Untitled-1.jpg",
      link: "https://mosc.in/spiritual/akhila-malankara-orthodox-shusrushaka-sangham-amoss/",
      icon: "Church"
    },
    {
      id: 11,
      title: "Mission Board and Mission Society",
      description: "Orthodox Church which has been existing in India for the last two thousand years has started the mission society and mission board to fulfil its mission in India and hence...",
      image: "https://mosc.in/wp-content/uploads/2014/12/Untitled-1.jpg",
      link: "https://mosc.in/spiritual/mission-board/",
      icon: "Globe"
    },
    {
      id: 12,
      title: "Ministry of Human Empowerment",
      description: "MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore ,enlighten and empower the human potential of the society  through various awareness campaigns. The main thrust of...",
      image: "https://mosc.in/wp-content/uploads/2014/12/Untitled-1.jpg",
      link: "https://mosc.in/spiritual/ministry-of-human-empowerment/",
      icon: "Lightbulb"
    },
    {
      id: 13,
      title: "Akhila Malankara Balasamajam",
      description: "AKHILA MALANKARA BALASAMAJAM is the student portion of the Malankara Orthodox Syrian Church. Balasamajam aims at the integrated personal development of the youth in the Church. The main objectives are worship, study and virtuous...",
      image: "https://mosc.in/wp-content/uploads/2015/10/balasamajam.jpg",
      link: "https://mosc.in/spiritual/akhila-malankara-bala-samajam/",
      icon: "Users"
    },
    {
      id: 14,
      title: "St. Thomas Orthodox Vaidika Sanghom",
      description: "The antecedents of the St.Thomas Orthodox Vaidhika Sanghom can be traced back to the period of St.Gregorios of Parumala. The Saint, whose organizational skills and vision for the Malankara Orthodox...",
      image: "https://mosc.in/wp-content/uploads/2015/06/vaidika-sanghom.jpg",
      link: "https://mosc.in/spiritual/st-thomas-orthodox-vaidika-sanghom/",
      icon: "BookOpen"
    },
    {
      id: 15,
      title: "Marth Mariam Vanitha Samajam (Women's Wing of Orthodox Church of India)",
      description: "A Brief History Marth Mariam Vanitha Samajam is the Women's wing of the Malankara Orthodox Church of India. It is one of the major spiritual organization of the church combining...",
      image: "https://mosc.in/wp-content/uploads/2015/03/moms.jpg",
      link: "https://mosc.in/spiritual/marth-mariam-vanitha-samajam-womens-wing-of-orthodox-church-of-india/",
      icon: "Users"
    },
    {
      id: 16,
      title: "Mar Gregorios Orthodox Christian Student Movement (MGOCSM)",
      description: "Mar Gregorios Orthodox Christian Student Movement (MGOCSM) is the student wing of the Malankara Orthodox Syrian Church. The students and senior leaders of our church who were residing in Madras...",
      image: "https://mosc.in/wp-content/uploads/2015/03/mgocsm.jpg",
      link: "https://mosc.in/spiritual/mar-gregorios-orthodox-christian-student-movement-mgocsm/",
      icon: "GraduationCap"
    },
    {
      id: 17,
      title: "The Orthodox Christian Youth Movement",
      description: "The Orthodox Christian Youth Movement (OCYM), the Youth-wing of the Malankara Orthodox Syrian Church is in its 77th year of active leadership and Christian witness in the Church and society....",
      image: "https://mosc.in/wp-content/uploads/2015/03/OCYM-ahmedabad.jpg",
      link: "https://mosc.in/spiritual/the-orthodox-christian-youth-movement/",
      icon: "Users"
    },
    {
      id: 18,
      title: "NAVAJYOTHI MOMS CHARITABLE SOCIETY",
      description: "The Navajyothi MOMS Charitable Society is an organization for poor, self- employed women workers in the community. Established in 2009, it is a registered charitable organization owned by Malankara Orthodox...",
      link: "https://mosc.in/spiritual/navajyothi-moms-charitable-society/",
      icon: "Heart"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground mb-4">
          Spiritual Organizations Directory
        </h2>
        <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
          Explore the diverse spiritual organizations and ministries that serve our Church community,
          each contributing to the spiritual growth and social welfare of our members worldwide.
        </p>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {organizations.map((organization) => (
          <OrganizationCard
            key={organization.id}
            organization={organization}
          />
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-16 text-center">
        <div className="bg-muted/20 rounded-lg p-6">
          <p className="font-body text-muted-foreground">
            For more information about any of these organizations or to get involved,
            please contact your local parish or visit the official MOSC website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpiritualOrganizationsContent;
