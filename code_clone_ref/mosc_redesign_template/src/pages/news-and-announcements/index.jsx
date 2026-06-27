import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import AnnouncementCard from './components/AnnouncementCard';
import FilterControls from './components/FilterControls';
import FeaturedAnnouncement from './components/FeaturedAnnouncement';
import NewsletterSubscription from './components/NewsletterSubscription';
import ArchiveSection from './components/ArchiveSection';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const NewsAndAnnouncements = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [selectedImportance, setSelectedImportance] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const announcementsPerPage = 6;

  // Mock announcements data
  const mockAnnouncements = [
    {
      id: 1,
      title: "Holy Week Services Schedule 2024",
      category: "Events",
      summary: `Join us for the sacred observance of Holy Week with special services throughout the week.\n\nPalm Sunday begins our journey with the blessing of palms at 9:00 AM, followed by Divine Liturgy. Maundy Thursday commemorates the Last Supper with evening service at 7:00 PM.\n\nGood Friday observance includes the Passion reading and veneration of the Cross. Easter Vigil begins Saturday evening, culminating in the joyous Easter Sunday celebration.`,
      publishDate: "2024-03-15",
      eventDate: "2024-03-24",
      image: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: true
    },
    {
      id: 2,
      title: "Diocesan Synod Meeting - Important Updates",
      category: "Diocesan News",
      summary: `His Grace Metropolitan has announced important decisions from the recent Diocesan Synod meeting.\n\nKey resolutions include new guidelines for parish administration, updates to liturgical practices, and establishment of youth ministry programs.\n\nAll parish priests and lay leaders are requested to review the detailed circular being distributed this week.`,
      publishDate: "2024-03-10",
      eventDate: null,
      image: "https://images.pexels.com/photos/8468704/pexels-photo-8468704.jpeg?w=800&h=400&fit=crop",
      isUrgent: true,
      isFeatured: false
    },
    {
      id: 3,
      title: "Community Food Drive Success",
      category: "Community Updates",
      summary: `Our recent community food drive exceeded all expectations, collecting over 2,000 pounds of food items.\n\nThanks to the generous contributions from our parish families, we were able to support 150 families in need during this challenging time.\n\nSpecial appreciation to the youth group for organizing collection points and the women's fellowship for sorting donations.`,
      publishDate: "2024-03-08",
      eventDate: null,
      image: "https://images.pixabay.com/photo/2017/09/23/21/21/vegetables-2779844_1280.jpg?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    },
    {
      id: 4,
      title: "New Sunday School Curriculum Launch",
      category: "Events",
      summary: `We are excited to introduce our new comprehensive Sunday School curriculum starting April 2024.\n\nThe updated program includes age-appropriate biblical studies, Orthodox traditions, and interactive learning activities.\n\nRegistration is now open for all children ages 4-16. Classes will be conducted in both English and Malayalam.`,
      publishDate: "2024-03-05",
      eventDate: "2024-04-07",
      image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    },
    {
      id: 5,
      title: "Parish Building Renovation Update",
      category: "Community Updates",
      summary: `Construction work on the parish hall renovation is progressing well and is expected to complete by May 2024.\n\nThe updated facility will include modern audio-visual equipment, improved accessibility features, and expanded seating capacity.\n\nTemporary arrangements for community events will continue in the church basement until completion.`,
      publishDate: "2024-03-01",
      eventDate: null,
      image: "https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    },
    {
      id: 6,
      title: "Annual Retreat Registration Open",
      category: "Events",
      summary: `Join us for our annual spiritual retreat at the beautiful mountain retreat center from June 14-16, 2024.\n\nThis year's theme is 'Deepening Our Faith Journey' with sessions led by visiting clergy and spiritual directors.\n\nEarly bird registration available until April 30th with special rates for families and seniors.`,
      publishDate: "2024-02-28",
      eventDate: "2024-06-14",
      image: "https://images.pixabay.com/photo/2016/11/29/05/45/astronomy-1867616_1280.jpg?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    },
    {
      id: 7,
      title: "Youth Ministry Leadership Training",
      category: "Events",
      summary: `Calling all young adults aged 18-30 to participate in our comprehensive leadership training program.\n\nThe program covers biblical foundations, pastoral care, event planning, and community outreach strategies.\n\nSessions will be held every Saturday for 8 weeks starting March 30th. Certificate of completion provided.`,
      publishDate: "2024-02-25",
      eventDate: "2024-03-30",
      image: "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    },
    {
      id: 8,
      title: "Lenten Season Observance Guidelines",
      category: "Diocesan News",
      summary: `His Grace has issued special guidelines for the observance of the Great Lent season.\n\nRecommendations include daily prayer schedules, fasting practices, and charitable activities for spiritual preparation.\n\nSpecial Lenten services will be conducted every Wednesday and Friday evenings at 7:00 PM throughout the season.`,
      publishDate: "2024-02-20",
      eventDate: null,
      image: "https://images.pexels.com/photos/8468689/pexels-photo-8468689.jpeg?w=800&h=400&fit=crop",
      isUrgent: false,
      isFeatured: false
    }
  ];

  // Featured announcement (first one marked as featured)
  const featuredAnnouncement = mockAnnouncements?.find(ann => ann?.isFeatured);

  // Filter announcements
  useEffect(() => {
    let filtered = mockAnnouncements?.filter(ann => !ann?.isFeatured);

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(ann => 
        ann?.category?.toLowerCase() === selectedCategory?.toLowerCase()
      );
    }

    // Date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (selectedDateRange) {
        case 'today':
          filterDate?.setDate(now?.getDate());
          break;
        case 'week':
          filterDate?.setDate(now?.getDate() - 7);
          break;
        case 'month':
          filterDate?.setMonth(now?.getMonth() - 1);
          break;
        case 'quarter':
          filterDate?.setMonth(now?.getMonth() - 3);
          break;
        default:
          filterDate?.setFullYear(2020);
      }
      
      filtered = filtered?.filter(ann => 
        new Date(ann.publishDate) >= filterDate
      );
    }

    // Importance filter
    if (selectedImportance !== 'all') {
      if (selectedImportance === 'urgent') {
        filtered = filtered?.filter(ann => ann?.isUrgent);
      } else if (selectedImportance === 'featured') {
        filtered = filtered?.filter(ann => ann?.isFeatured);
      }
    }

    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  }, [selectedCategory, selectedDateRange, selectedImportance]);

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements?.length / announcementsPerPage);
  const startIndex = (currentPage - 1) * announcementsPerPage;
  const currentAnnouncements = filteredAnnouncements?.slice(startIndex, startIndex + announcementsPerPage);

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedDateRange('all');
    setSelectedImportance('all');
  };

  const handleShare = (announcement) => {
    if (navigator.share) {
      navigator.share({
        title: announcement?.title,
        text: announcement?.summary,
        url: window.location?.href
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard?.writeText(`${announcement?.title}\n${window.location?.href}`);
    }
  };

  const handleAddToCalendar = (announcement) => {
    if (announcement?.eventDate) {
      const startDate = new Date(announcement.eventDate);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      
      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(announcement?.title)}&dates=${startDate?.toISOString()?.replace(/[-:]/g, '')?.split('.')?.[0]}Z/${endDate?.toISOString()?.replace(/[-:]/g, '')?.split('.')?.[0]}Z&details=${encodeURIComponent(announcement?.summary)}`;
      
      window.open(calendarUrl, '_blank');
    }
  };

  const handleSearchArchive = (searchParams) => {
    console.log('Searching archives with:', searchParams);
    // In a real app, this would trigger an API call to search archived announcements
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>News & Announcements - MOSC</title>
        <meta name="description" content="Stay updated with the latest news, announcements, and events from the Malankara Orthodox Syrian Church community." />
        <meta name="keywords" content="church news, announcements, events, MOSC, Orthodox church updates" />
      </Helmet>
      <Header />
      <NavigationBreadcrumb />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="Newspaper" size={32} className="text-primary" />
          </div>
          <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
            News & Announcements
          </h1>
          <p className="text-xl text-muted-foreground font-body max-w-3xl mx-auto">
            Stay connected with our church community through the latest news, events, and important announcements.
          </p>
        </div>

        {/* Featured Announcement */}
        {featuredAnnouncement && (
          <FeaturedAnnouncement
            announcement={featuredAnnouncement}
            onShare={handleShare}
            onAddToCalendar={handleAddToCalendar}
          />
        )}

        {/* Filter Controls */}
        <FilterControls
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
          selectedImportance={selectedImportance}
          onImportanceChange={setSelectedImportance}
          onClearFilters={handleClearFilters}
          totalResults={filteredAnnouncements?.length}
        />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Announcements Grid */}
            {currentAnnouncements?.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {currentAnnouncements?.map((announcement) => (
                    <AnnouncementCard
                      key={announcement?.id}
                      announcement={announcement}
                      onShare={handleShare}
                      onAddToCalendar={handleAddToCalendar}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      iconName="ChevronLeft"
                      iconPosition="left"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)?.map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      iconName="ChevronRight"
                      iconPosition="right"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                  No Announcements Found
                </h3>
                <p className="text-muted-foreground font-body mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Newsletter Subscription */}
            <NewsletterSubscription />

            {/* Archive Search */}
            <ArchiveSection onSearchArchive={handleSearchArchive} />

            {/* Quick Links */}
            <div className="bg-card rounded-lg sacred-shadow p-6">
              <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                <a 
                  href="/services-and-worship" 
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary reverent-transition"
                >
                  <Icon name="Calendar" size={16} />
                  <span className="font-body">Service Schedule</span>
                </a>
                <a 
                  href="/contact-and-locations" 
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary reverent-transition"
                >
                  <Icon name="MapPin" size={16} />
                  <span className="font-body">Contact Information</span>
                </a>
                <a 
                  href="/clergy-and-leadership" 
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary reverent-transition"
                >
                  <Icon name="Users" size={16} />
                  <span className="font-body">Church Leadership</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewsAndAnnouncements;