import React from 'react';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import InteractiveMap from './components/InteractiveMap';
import LocationCard from './components/LocationCard';
import ContactDirectory from './components/ContactDirectory';
import EmergencyContact from './components/EmergencyContact';
import Icon from '../../components/AppIcon';


const ContactAndLocations = () => {
  // Mock data for church locations
  const locations = [
    {
      id: 1,
      name: "St. Thomas Orthodox Cathedral",
      address: "123 Cathedral Avenue",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      phone: "(212) 555-0123",
      email: "cathedral@mosc.org",
      pastor: "Rev. Fr. Thomas Mathew",
      image: "https://images.unsplash.com/photo-1520637836862-4d197d17c13a?w=400&h=400&fit=crop",
      coordinates: { lat: 40.7128, lng: -74.0060 },
      serviceTimes: [
        { day: "Sunday", time: "9:00 AM & 11:00 AM" },
        { day: "Wednesday", time: "7:00 PM" },
        { day: "Friday", time: "6:30 PM" }
      ]
    },
    {
      id: 2,
      name: "St. Mary's Orthodox Church",
      address: "456 Church Street",
      city: "Boston",
      state: "MA",
      zipCode: "02101",
      phone: "(617) 555-0456",
      email: "stmarys@mosc.org",
      pastor: "Rev. Fr. John Abraham",
      image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400&h=400&fit=crop",
      coordinates: { lat: 42.3601, lng: -71.0589 },
      serviceTimes: [
        { day: "Sunday", time: "10:00 AM" },
        { day: "Thursday", time: "7:00 PM" },
        { day: "Saturday", time: "6:00 PM" }
      ]
    },
    {
      id: 3,
      name: "Holy Cross Orthodox Church",
      address: "789 Faith Boulevard",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19101",
      phone: "(215) 555-0789",
      email: "holycross@mosc.org",
      pastor: "Rev. Fr. George Samuel",
      image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&h=400&fit=crop",
      coordinates: { lat: 39.9526, lng: -75.1652 },
      serviceTimes: [
        { day: "Sunday", time: "9:30 AM" },
        { day: "Tuesday", time: "6:30 PM" },
        { day: "Friday", time: "7:00 PM" }
      ]
    }
  ];

  // Mock data for contact directory
  const contactDirectory = [
    {
      department: "Administrative Office",
      description: "General inquiries, membership, and administrative services",
      icon: "Building",
      contacts: [
        {
          name: "Sarah Johnson",
          title: "Administrative Coordinator",
          phone: "(212) 555-0100",
          email: "admin@mosc.org"
        },
        {
          name: "Michael Davis",
          title: "Membership Secretary",
          phone: "(212) 555-0101",
          email: "membership@mosc.org"
        }
      ]
    },
    {
      department: "Pastoral Care",
      description: "Spiritual guidance, counseling, and pastoral visits",
      icon: "Heart",
      contacts: [
        {
          name: "Rev. Fr. Thomas Mathew",
          title: "Senior Pastor",
          phone: "(212) 555-0102",
          email: "pastor@mosc.org"
        },
        {
          name: "Rev. Fr. John Abraham",
          title: "Associate Pastor",
          phone: "(617) 555-0103",
          email: "associate@mosc.org"
        }
      ]
    },
    {
      department: "Youth Ministry",
      description: "Programs and activities for children and young adults",
      icon: "Users",
      contacts: [
        {
          name: "Rebecca Thomas",
          title: "Youth Director",
          phone: "(212) 555-0104",
          email: "youth@mosc.org"
        },
        {
          name: "David Wilson",
          title: "Sunday School Coordinator",
          phone: "(212) 555-0105",
          email: "sundayschool@mosc.org"
        }
      ]
    },
    {
      department: "Music Ministry",
      description: "Choir, liturgical music, and worship services",
      icon: "Music",
      contacts: [
        {
          name: "Mary Elizabeth",
          title: "Music Director",
          phone: "(212) 555-0106",
          email: "music@mosc.org"
        },
        {
          name: "James Rodriguez",
          title: "Choir Coordinator",
          phone: "(212) 555-0107",
          email: "choir@mosc.org"
        }
      ]
    },
    {
      department: "Women\'s Fellowship",
      description: "Women\'s ministry programs and community outreach",
      icon: "Users",
      contacts: [
        {
          name: "Anna Mathew",
          title: "Fellowship President",
          phone: "(212) 555-0108",
          email: "womens@mosc.org"
        }
      ]
    },
    {
      department: "Finance Office",
      description: "Donations, tithes, and financial administration",
      icon: "DollarSign",
      contacts: [
        {
          name: "Robert Chen",
          title: "Financial Secretary",
          phone: "(212) 555-0109",
          email: "finance@mosc.org"
        }
      ]
    }
  ];

  // Mock data for emergency contacts
  const emergencyContacts = [
    {
      title: "Emergency Pastoral Care",
      name: "Rev. Fr. Thomas Mathew",
      phone: "(212) 555-9999",
      availability: "24/7",
      icon: "Phone"
    },
    {
      title: "Crisis Counseling",
      name: "Rev. Fr. John Abraham",
      phone: "(617) 555-8888",
      availability: "24/7",
      icon: "Heart"
    },
    {
      title: "Hospital Visits",
      name: "Rev. Fr. George Samuel",
      phone: "(215) 555-7777",
      availability: "On-call",
      icon: "Cross"
    },
    {
      title: "Bereavement Support",
      name: "Deacon Paul Thomas",
      phone: "(212) 555-6666",
      availability: "24/7",
      icon: "Users"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <NavigationBreadcrumb />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading font-semibold text-4xl md:text-5xl text-foreground mb-4">
            Contact & Locations
          </h1>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
            Connect with our church community, find worship locations, and access pastoral care services. We're here to serve your spiritual and practical needs.
          </p>
        </div>

        <div className="space-y-12">
          {/* Interactive Map Section */}
          <section>
            <InteractiveMap locations={locations} />
          </section>

          {/* Emergency Contacts Section */}
          <section>
            <EmergencyContact emergencyContacts={emergencyContacts} />
          </section>

          {/* Location Cards Section */}
          <section>
            <div className="text-center mb-8">
              <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
                Our Locations
              </h2>
              <p className="font-body text-muted-foreground">
                Visit our churches for worship, fellowship, and spiritual growth
              </p>
            </div>
            
            <div className="space-y-8">
              {locations?.map((location) => (
                <LocationCard key={location?.id} location={location} />
              ))}
            </div>
          </section>

          {/* Contact Directory Section */}
          <section>
            <ContactDirectory contacts={contactDirectory} />
          </section>

          {/* Additional Information */}
          <section className="bg-card rounded-lg sacred-shadow p-8">
            <div className="text-center mb-6">
              <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
                Additional Information
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Clock" size={24} className="text-primary" />
                </div>
                <h3 className="font-body font-semibold text-lg text-foreground mb-2">Office Hours</h3>
                <div className="font-body text-sm text-muted-foreground space-y-1">
                  <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                  <p>Saturday: 10:00 AM - 2:00 PM</p>
                  <p>Sunday: After Services</p>
                </div>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Mail" size={24} className="text-primary" />
                </div>
                <h3 className="font-body font-semibold text-lg text-foreground mb-2">Mailing Address</h3>
                <div className="font-body text-sm text-muted-foreground space-y-1">
                  <p>Malankara Orthodox Syrian Church</p>
                  <p>123 Cathedral Avenue</p>
                  <p>New York, NY 10001</p>
                </div>
              </div>

              <div className="text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="Calendar" size={24} className="text-primary" />
                </div>
                <h3 className="font-body font-semibold text-lg text-foreground mb-2">Appointments</h3>
                <div className="font-body text-sm text-muted-foreground space-y-1">
                  <p>Pastoral visits by appointment</p>
                  <p>Counseling sessions available</p>
                  <p>Call ahead for meetings</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground">
              © {new Date()?.getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactAndLocations;