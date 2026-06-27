import React from 'react';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import HierarchyDiagram from './components/HierarchyDiagram';
import ClergyProfile from './components/ClergyProfile';
import AdministrativeStaff from './components/AdministrativeStaff';
import PastoralRequestForm from './components/PastoralRequestForm';
import Icon from '../../components/AppIcon';

const ClergyAndLeadership = () => {
  const clergyMembers = [
    {
      id: 1,
      name: "His Holiness Baselios Marthoma Mathews III",
      title: "Catholicos of the East & Malankara Metropolitan",
      diocese: "Supreme Head of the Church",
      image: "https://images.pexels.com/photos/8566473/pexels-photo-8566473.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      email: "catholicos@mosc.in",
      phone: "+91-9876543201",
      ordination: "1975",
      education: "PhD in Theology, University of Oxford",
      specialization: "Patristic Theology, Church History",
      languages: ["English", "Malayalam", "Syriac", "Greek"],
      shortDescription: "The spiritual leader and supreme head of the Malankara Orthodox Syrian Church, guiding the faithful in matters of faith, doctrine, and church governance.",
      fullBiography: `His Holiness Baselios Marthoma Mathews III serves as the Catholicos of the East and Malankara Metropolitan, the supreme head of the Malankara Orthodox Syrian Church. Born in 1950, he was ordained as a priest in 1975 and consecrated as a bishop in 1985.

His Holiness completed his theological education at the Orthodox Theological Seminary in Kottayam and later pursued advanced studies at the University of Oxford, where he earned his PhD in Patristic Theology. He has been instrumental in strengthening the church's theological foundations and promoting Orthodox traditions worldwide.

Under his leadership, the church has expanded its missionary activities, established new parishes globally, and strengthened interfaith dialogue. He has authored several theological works and has been a prominent voice in the World Council of Churches.

His Holiness is known for his pastoral care, theological scholarship, and commitment to preserving the ancient traditions of the Syrian Orthodox Church while adapting to contemporary challenges.`,
      ministryAreas: ["Theological Education", "Interfaith Dialogue", "Global Missions", "Church Administration"],
      achievements: [
        "Established 15 new parishes worldwide",
        "Authored 8 theological books",
        "Led major church reforms",
        "Strengthened ecumenical relations"
      ]
    },
    {
      id: 2,
      name: "H.G. Dr. Yuhanon Mar Diascoros",
      title: "Metropolitan Bishop",
      diocese: "Kochi Diocese",
      image: "https://images.pexels.com/photos/8566464/pexels-photo-8566464.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
      email: "kochi@mosc.in",
      phone: "+91-9876543202",
      ordination: "1995",
      education: "MTh in Biblical Studies, Serampore University",
      specialization: "Biblical Exegesis, Pastoral Theology",
      languages: ["English", "Malayalam", "Tamil", "Hindi"],
      shortDescription: "Metropolitan Bishop of Kochi Diocese, overseeing pastoral care and spiritual guidance for parishes across Kerala's commercial capital.",
      fullBiography: `H.G. Dr. Yuhanon Mar Diascoros has served as the Metropolitan Bishop of Kochi Diocese since 2010. Ordained as a priest in 1995, he was consecrated as a bishop in 2008 after serving in various pastoral and administrative roles.

He completed his Master of Theology in Biblical Studies from Serampore University and has been actively involved in theological education. His expertise in Biblical exegesis has made him a sought-after speaker at theological conferences and seminars.

Under his leadership, the Kochi Diocese has seen significant growth in youth ministry programs and community outreach initiatives. He has been instrumental in establishing new churches in urban areas and strengthening existing parish communities.

His Grace is known for his approachable pastoral style and his commitment to social justice issues. He has led several charitable initiatives and has been actively involved in interfaith harmony programs in Kerala.`,
      ministryAreas: ["Youth Ministry", "Urban Evangelism", "Social Justice", "Biblical Studies"],
      achievements: [
        "Established 5 new urban parishes","Led major youth revival programs","Initiated community health programs","Published biblical commentary series"
      ]
    },
    {
      id: 3,
      name: "H.G. Dr. Geevarghese Mar Coorilos",title: "Metropolitan Bishop",diocese: "Niranam Diocese",image: "https://images.pexels.com/photos/8566466/pexels-photo-8566466.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",email: "niranam@mosc.in",phone: "+91-9876543203",ordination: "1998",education: "PhD in Church History, Princeton Theological Seminary",specialization: "Church History, Liturgical Studies",
      languages: ["English", "Malayalam", "Syriac", "German"],
      shortDescription: "Metropolitan Bishop of Niranam Diocese, preserving ancient traditions while leading the historic mother church of Malankara Christianity.",
      fullBiography: `H.G. Dr. Geevarghese Mar Coorilos serves as the Metropolitan Bishop of Niranam Diocese, which includes the historic Niranam Church, one of the seven churches established by St. Thomas the Apostle in India.

Ordained as a priest in 1998, he pursued advanced theological studies at Princeton Theological Seminary, where he earned his PhD in Church History. His doctoral dissertation focused on the early Christian communities in South India.

His Grace has been instrumental in preserving the ancient liturgical traditions of the Malankara Church while making them accessible to contemporary believers. He has led several archaeological and historical research projects related to early Christianity in India.

Under his leadership, the Niranam Diocese has become a center for theological research and historical studies. He has established a research center dedicated to studying the heritage of St. Thomas Christians and has published extensively on early church history.`,
      ministryAreas: ["Historical Research", "Liturgical Preservation", "Archaeological Studies", "Heritage Conservation"],
      achievements: [
        "Established church history research center","Led archaeological excavations","Published 12 historical research papers","Restored ancient church manuscripts"
      ]
    },
    {
      id: 4,
      name: "Rev. Fr. Thomas Kuriakose",title: "Parish Priest",diocese: "St. Mary's Orthodox Church, Bangalore",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400",
      email: "bangalore@mosc.in",
      phone: "+91-9876543204",
      ordination: "2005",
      education: "BD in Theology, Orthodox Theological Seminary",
      specialization: "Pastoral Care, Family Counseling",
      languages: ["English", "Malayalam", "Kannada", "Tamil"],
      shortDescription: "Parish priest serving the growing Orthodox community in Bangalore with focus on family ministry and youth engagement.",
      fullBiography: `Rev. Fr. Thomas Kuriakose has been serving as the Parish Priest of St. Mary's Orthodox Church in Bangalore since 2012. Ordained in 2005, he has dedicated his ministry to serving the spiritual needs of the Orthodox community in Karnataka's capital.

Father Thomas completed his Bachelor of Divinity from the Orthodox Theological Seminary in Kottayam and has pursued additional training in pastoral counseling and family therapy. His approach to ministry emphasizes the importance of strong family foundations and community support.

Under his leadership, the Bangalore parish has grown significantly, with new families joining the community regularly. He has established various ministry programs including marriage preparation courses, parenting workshops, and youth leadership development programs.

Father Thomas is known for his practical preaching style and his ability to connect ancient Orthodox traditions with contemporary life challenges. He has been actively involved in interfaith dialogue and community service initiatives in Bangalore.`,
      ministryAreas: ["Family Ministry", "Youth Programs", "Community Outreach", "Interfaith Relations"],
      achievements: [
        "Grew parish membership by 200%",
        "Established family counseling center",
        "Led community service initiatives",
        "Developed youth leadership programs"
      ]
    },
    {
      id: 5,
      name: "Rev. Fr. John Mathew",
      title: "Assistant Parish Priest",
      diocese: "Holy Trinity Orthodox Church, Mumbai",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400",
      email: "mumbai@mosc.in",
      phone: "+91-9876543205",
      ordination: "2015",
      education: "MTh in Pastoral Theology, Senate of Serampore University",
      specialization: "Urban Ministry, Social Work",
      languages: ["English", "Malayalam", "Hindi", "Marathi"],
      shortDescription: "Assistant parish priest focusing on urban ministry and social outreach programs in Mumbai's diverse Orthodox community.",
      fullBiography: `Rev. Fr. John Mathew serves as the Assistant Parish Priest at Holy Trinity Orthodox Church in Mumbai, where he has been ministering since 2018. Ordained in 2015, he brings a fresh perspective to urban ministry and community engagement.

Father John completed his Master of Theology in Pastoral Theology from the Senate of Serampore University, with a special focus on urban ministry challenges. His thesis explored the role of the church in addressing social issues in metropolitan areas.

He has been instrumental in developing outreach programs for migrant workers and underprivileged communities in Mumbai. His ministry extends beyond the parish boundaries to include social work among the marginalized populations in the city.

Father John is particularly passionate about environmental stewardship and has initiated several green initiatives within the parish. He regularly conducts workshops on sustainable living and creation care from a theological perspective.`,
      ministryAreas: ["Urban Ministry", "Social Outreach", "Environmental Stewardship", "Migrant Care"],
      achievements: [
        "Established migrant worker support program","Led environmental awareness campaigns","Developed urban ministry model","Initiated interfaith social projects"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavigationBreadcrumb />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Icon name="Users" size={32} color="white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground mb-4">
            Clergy & Leadership
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Meet our dedicated clergy and administrative staff who serve the Malankara Orthodox Syrian Church community with devotion, wisdom, and pastoral care.
          </p>
        </div>

        {/* Church Hierarchy Diagram */}
        <div className="mb-12">
          <HierarchyDiagram />
        </div>

        {/* Clergy Profiles Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-heading font-semibold text-foreground mb-2">
              Our Clergy
            </h2>
            <p className="text-muted-foreground">
              Spiritual leaders dedicated to serving our community with wisdom and compassion
            </p>
          </div>
          
          <div className="space-y-8">
            {clergyMembers?.map((clergy) => (
              <ClergyProfile key={clergy?.id} clergy={clergy} />
            ))}
          </div>
        </div>

        {/* Administrative Staff Section */}
        <div className="mb-12">
          <AdministrativeStaff />
        </div>

        {/* Pastoral Request Form Section */}
        <div className="mb-12">
          <PastoralRequestForm />
        </div>

        {/* Quick Contact Section */}
        <div className="bg-card rounded-lg p-6 sacred-shadow">
          <div className="text-center">
            <h3 className="text-2xl font-heading font-semibold text-foreground mb-4">
              Need Immediate Assistance?
            </h3>
            <p className="text-muted-foreground mb-6">
              For urgent pastoral care or emergency situations, please contact us directly
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                <Icon name="Phone" size={24} className="text-primary mb-2" />
                <h4 className="font-medium text-foreground mb-1">Emergency Line</h4>
                <a
                  href="tel:+91-9876543200"
                  className="text-primary hover:text-primary/80 reverent-transition"
                >
                  +91-9876543200
                </a>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                <Icon name="Mail" size={24} className="text-primary mb-2" />
                <h4 className="font-medium text-foreground mb-1">Pastoral Care</h4>
                <a
                  href="mailto:pastoral@mosc.in"
                  className="text-primary hover:text-primary/80 reverent-transition"
                >
                  pastoral@mosc.in
                </a>
              </div>
              
              <div className="flex flex-col items-center p-4 bg-background rounded-lg border border-border">
                <Icon name="Clock" size={24} className="text-primary mb-2" />
                <h4 className="font-medium text-foreground mb-1">Office Hours</h4>
                <p className="text-muted-foreground text-sm">
                  Mon-Fri: 9AM-5PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Cross" size={20} color="white" />
              </div>
              <span className="font-heading font-semibold text-xl text-foreground">
                MOSC
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ClergyAndLeadership;