import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import ServiceScheduleTable from './components/ServiceScheduleTable';
import ServiceFilters from './components/ServiceFilters';
import SpecialServicesCard from './components/SpecialServicesCard';
import LiturgicalResources from './components/LiturgicalResources';
import Icon from '../../components/AppIcon';


const ServicesAndWorship = () => {
  const [filters, setFilters] = useState({
    location: '',
    language: '',
    serviceType: ''
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Mock data for weekly services
  const weeklyServices = [
    {
      id: 1,
      name: "Holy Qurbana",
      description: "The central act of worship in the Malankara Orthodox Syrian Church",
      time: "07:00 AM",
      language: "Malayalam",
      location: "Main Cathedral",
      type: "Holy Qurbana",
      isSpecial: false,
      bulletin: "/assets/bulletins/holy-qurbana-sunday.pdf"
    },
    {
      id: 2,
      name: "English Holy Qurbana",
      description: "Holy Qurbana celebrated in English for the diaspora community",
      time: "09:30 AM",
      language: "English",
      location: "Main Cathedral",
      type: "Holy Qurbana",
      isSpecial: false,
      bulletin: "/assets/bulletins/english-qurbana.pdf"
    },
    {
      id: 3,
      name: "Evening Prayer (Ramsho)",
      description: "Traditional evening prayer service with ancient Syriac chants",
      time: "06:00 PM",
      language: "Syriac",
      location: "St. Thomas Chapel",
      type: "Evening Prayer",
      isSpecial: false,
      bulletin: "/assets/bulletins/evening-prayer.pdf"
    },
    {
      id: 4,
      name: "Youth Bible Study",
      description: "Interactive Bible study session for young adults and teenagers",
      time: "07:30 PM",
      language: "English",
      location: "Community Center",
      type: "Bible Study",
      isSpecial: false,
      bulletin: null
    },
    {
      id: 5,
      name: "Feast of St. Thomas",
      description: "Special commemorative service honoring our patron saint",
      time: "10:00 AM",
      language: "Bilingual",
      location: "Main Cathedral",
      type: "Special Service",
      isSpecial: true,
      bulletin: "/assets/bulletins/st-thomas-feast.pdf"
    },
    {
      id: 6,
      name: "Morning Prayer (Sapro)",
      description: "Traditional morning prayer service to begin the day in worship",
      time: "06:00 AM",
      language: "Malayalam",
      location: "Main Cathedral",
      type: "Morning Prayer",
      isSpecial: false,
      bulletin: "/assets/bulletins/morning-prayer.pdf"
    },
    {
      id: 7,
      name: "Online Service",
      description: "Live-streamed Holy Qurbana for those unable to attend in person",
      time: "11:00 AM",
      language: "English",
      location: "Online",
      type: "Holy Qurbana",
      isSpecial: false,
      bulletin: "/assets/bulletins/online-service.pdf"
    }
  ];

  // Mock data for special services
  const specialServices = [
    {
      id: 1,
      name: "Christmas Midnight Service",
      description: "Celebrate the birth of our Lord Jesus Christ with traditional midnight Holy Qurbana",
      date: "2025-12-24",
      time: "11:30 PM",
      location: "Main Cathedral",
      image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=300&fit=crop",
      isHighlighted: true,
      registrationRequired: false
    },
    {
      id: 2,
      name: "Epiphany Blessing of Waters",
      description: "Traditional blessing of waters ceremony commemorating Christ\'s baptism",
      date: "2025-01-06",
      time: "10:00 AM",
      location: "Main Cathedral",
      image: "https://images.pexels.com/photos/8363026/pexels-photo-8363026.jpeg?w=400&h=300&fit=crop",
      isHighlighted: true,
      registrationRequired: false
    },
    {
      id: 3,
      name: "Lenten Retreat",
      description: "Three-day spiritual retreat focusing on prayer, fasting, and almsgiving",
      date: "2025-03-15",
      time: "09:00 AM",
      location: "Community Center",
      image: "https://images.pixabay.com/photo/2017/12/15/13/51/bible-3021805_1280.jpg?w=400&h=300&fit=crop",
      isHighlighted: false,
      registrationRequired: true
    },
    {
      id: 4,
      name: "Palm Sunday Procession",
      description: "Traditional palm procession followed by Holy Qurbana",
      date: "2025-04-13",
      time: "09:00 AM",
      location: "Main Cathedral",
      image: "https://images.unsplash.com/photo-1583662017845-4bdc0b5b1e5e?w=400&h=300&fit=crop",
      isHighlighted: true,
      registrationRequired: false
    }
  ];

  // Mock data for liturgical resources
  const liturgicalResources = [
    {
      id: 1,
      category: "prayers",
      title: "Morning Prayer Book",
      description: "Complete collection of traditional morning prayers in Malayalam and English",
      language: "Bilingual",
      fileSize: "2.5 MB",
      hasAudio: true,
      duration: "45 min",
      tags: ["Daily Prayer", "Traditional", "Bilingual"]
    },
    {
      id: 2,
      category: "prayers",
      title: "Evening Prayer Collection",
      description: "Traditional Ramsho prayers with Syriac transliterations",
      language: "Syriac",
      fileSize: "1.8 MB",
      hasAudio: true,
      duration: "30 min",
      tags: ["Evening", "Syriac", "Traditional"]
    },
    {
      id: 3,
      category: "hymns",
      title: "Qurbana Hymns",
      description: "Complete collection of Holy Qurbana hymns with musical notations",
      language: "Malayalam",
      fileSize: "5.2 MB",
      hasAudio: true,
      duration: "2 hours",
      tags: ["Qurbana", "Music", "Traditional"]
    },
    {
      id: 4,
      category: "hymns",
      title: "Seasonal Hymns",
      description: "Hymns for different liturgical seasons and feast days",
      language: "English",
      fileSize: "3.1 MB",
      hasAudio: true,
      duration: "1.5 hours",
      tags: ["Seasonal", "Feast Days", "English"]
    },
    {
      id: 5,
      category: "readings",
      title: "Sunday Scripture Readings",
      description: "Complete lectionary readings for all Sundays of the liturgical year",
      language: "English",
      fileSize: "4.7 MB",
      hasAudio: false,
      tags: ["Scripture", "Sunday", "Lectionary"]
    },
    {
      id: 6,
      category: "readings",
      title: "Feast Day Readings",
      description: "Special scripture readings for major feast days and saints\' commemorations",
      language: "Bilingual",
      fileSize: "3.3 MB",
      hasAudio: false,
      tags: ["Feast Days", "Saints", "Scripture"]
    },
    {
      id: 7,
      category: "explanations",
      title: "Understanding the Holy Qurbana",
      description: "Detailed explanation of the structure and meaning of the Holy Qurbana",
      language: "English",
      fileSize: "1.2 MB",
      hasAudio: false,
      tags: ["Education", "Qurbana", "Liturgy"]
    },
    {
      id: 8,
      category: "explanations",
      title: "Liturgical Calendar Guide",
      description: "Comprehensive guide to the Orthodox liturgical calendar and seasons",
      language: "English",
      fileSize: "2.8 MB",
      hasAudio: false,
      tags: ["Calendar", "Seasons", "Guide"]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services & Worship - Malankara Orthodox Syrian Church</title>
        <meta name="description" content="Join us for worship services, Holy Qurbana, and liturgical celebrations. Find service schedules, special events, and liturgical resources for spiritual participation." />
        <meta name="keywords" content="Orthodox worship, Holy Qurbana, church services, liturgy, prayer, Malayalam church, Syriac tradition" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <NavigationBreadcrumb />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">
              Services & Worship
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Join our community in worship through traditional Orthodox liturgy, prayer services, and special celebrations. 
              Find service schedules, liturgical resources, and opportunities for spiritual participation.
            </p>
          </div>

          {/* Service Filters */}
          <ServiceFilters filters={filters} onFilterChange={handleFilterChange} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Service Schedule */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="font-heading font-semibold text-2xl text-foreground mb-2">Weekly Service Schedule</h2>
                <p className="font-body text-muted-foreground">
                  Regular worship services and prayer times throughout the week
                </p>
              </div>
              
              <ServiceScheduleTable services={weeklyServices} filters={filters} />
              
              {/* Liturgical Resources Section */}
              <div className="mt-12">
                <LiturgicalResources resources={liturgicalResources} />
              </div>
            </div>

            {/* Sidebar - Special Services */}
            <div className="lg:col-span-1">
              <SpecialServicesCard specialServices={specialServices} />
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-16 bg-card rounded-lg sacred-shadow p-8">
            <div className="text-center">
              <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                Join Us in Worship
              </h2>
              <p className="font-body text-muted-foreground mb-6 max-w-2xl mx-auto">
                All are welcome to participate in our liturgical celebrations. Whether you're a longtime member 
                or visiting for the first time, we invite you to experience the beauty of Orthodox worship.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="Clock" size={24} className="text-primary" />
                  </div>
                  <h3 className="font-body font-semibold text-foreground mb-2">Service Times</h3>
                  <p className="text-sm text-muted-foreground">
                    Multiple service times to accommodate different schedules and language preferences
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="Users" size={24} className="text-primary" />
                  </div>
                  <h3 className="font-body font-semibold text-foreground mb-2">All Welcome</h3>
                  <p className="text-sm text-muted-foreground">
                    Open doors and hearts for all who seek to worship and grow in faith
                  </p>
                </div>
                <div className="p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name="BookOpen" size={24} className="text-primary" />
                  </div>
                  <h3 className="font-body font-semibold text-foreground mb-2">Resources</h3>
                  <p className="text-sm text-muted-foreground">
                    Prayer books, hymns, and liturgical materials available for deeper participation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServicesAndWorship;