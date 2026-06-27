import React from 'react';
import Header from '../../components/ui/Header';
import HeroSection from './components/HeroSection';
import FeaturedGuestCard from './components/FeaturedGuestCard';
import ContactInfoCard from './components/ContactInfoCard';
import ProgramDirectorCard from './components/ProgramDirectorCard';
import Icon from '../../components/AppIcon';
import EventDetailsCard from './components/EventDetailsCard';
import SponsorsSection from './components/SponsorsSection';
import EventGallery from './components/EventGallery';

const MainContentPageWithEnhancedCardComponents = () => {
  // Mock data for featured guests
  const featuredGuests = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: "Professional headshot of Dr. Sarah Johnson, a woman with shoulder-length brown hair wearing a navy blazer and white shirt, smiling confidently",
    bio: "Leading AI researcher and keynote speaker with over 15 years of experience in machine learning and neural networks. Currently heading the AI Ethics Committee at Stanford University.",
    socialLinks: [
    { platform: "LinkedIn", icon: "Linkedin", url: "#" },
    { platform: "Twitter", icon: "Twitter", url: "#" },
    { platform: "Website", icon: "Globe", url: "#" }]

  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b2720bf6-1762273579122.png",
    avatarAlt: "Professional portrait of Prof. Michael Chen, an Asian man with short black hair wearing glasses and a dark suit jacket, photographed against a neutral background",
    bio: "Distinguished professor of Computer Science and author of \'The Future of Technology\'. Specializes in quantum computing and blockchain technologies with numerous published papers.",
    socialLinks: [
    { platform: "LinkedIn", icon: "Linkedin", url: "#" },
    { platform: "ResearchGate", icon: "BookOpen", url: "#" },
    { platform: "Email", icon: "Mail", url: "#" }]

  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1beb9fc75-1762273370028.png",
    avatarAlt: "Professional headshot of Dr. Emily Rodriguez, a Hispanic woman with long dark hair wearing a light blue blouse, smiling warmly in an office setting",
    bio: "Innovation strategist and startup mentor who has helped launch over 50 successful tech companies. Former VP of Product at Google and current venture capitalist.",
    socialLinks: [
    { platform: "LinkedIn", icon: "Linkedin", url: "#" },
    { platform: "Twitter", icon: "Twitter", url: "#" },
    { platform: "Medium", icon: "FileText", url: "#" }]

  }];


  // Mock data for contact information
  const contactInfo = {
    phone: "+91-9876543210",
    email: "contact@cardredesign.com",
    address: "123 Innovation Drive, Tech Park, Silicon Valley, CA 94025, United States",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM PST\nSaturday: 10:00 AM - 4:00 PM PST\nSunday: Closed"
  };

  // Mock data for program directors
  const programDirectors = [
  {
    id: 1,
    name: "David Thompson",
    title: "Executive Director",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_13f8cc9bf-1762273546645.png",
    avatarAlt: "Professional headshot of David Thompson, a middle-aged man with short gray hair and beard wearing a charcoal suit and blue tie, photographed in a corporate setting",
    bio: "Visionary leader with 20+ years in technology education and program development. Passionate about bridging the gap between academia and industry.",
    expertise: ["Leadership", "Strategy", "Education"],
    socialLinks: [
    { platform: "LinkedIn", icon: "Linkedin", url: "#" },
    { platform: "Twitter", icon: "Twitter", url: "#" }]

  },
  {
    id: 2,
    name: "Lisa Wang",
    title: "Technical Director",
    avatar: "https://images.unsplash.com/photo-1684262855358-88f296a2cfc2",
    avatarAlt: "Professional portrait of Lisa Wang, an Asian woman with long straight black hair wearing a white blazer, smiling confidently in a modern office environment",
    bio: "Full-stack developer turned educator with expertise in modern web technologies. Leads our technical curriculum and mentors emerging developers.",
    expertise: ["React", "Node.js", "Cloud Architecture"],
    socialLinks: [
    { platform: "GitHub", icon: "Github", url: "#" },
    { platform: "LinkedIn", icon: "Linkedin", url: "#" },
    { platform: "Website", icon: "Globe", url: "#" }]

  },
  {
    id: 3,
    name: "James Miller",
    title: "Creative Director",
    avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_17381d873-1762273709838.png",
    avatarAlt: "Creative portrait of James Miller, a bearded man with brown hair wearing a casual denim shirt, photographed in a bright creative studio with design materials in the background",
    bio: "Award-winning designer and UX expert who believes in the power of beautiful, functional design. Oversees all creative aspects of our programs.",
    expertise: ["UI/UX Design", "Branding", "Creative Strategy"],
    socialLinks: [
    { platform: "Dribbble", icon: "Palette", url: "#" },
    { platform: "Behance", icon: "Eye", url: "#" },
    { platform: "Instagram", icon: "Instagram", url: "#" }]

  }];


  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Event Details Section */}
        <section className="space-y-8" id="event-details">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Sparkles" size={32} className="text-orange-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Event Highlights</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the magic of "Spark of Kerala" - an extraordinary showcase of performance arts 
              and rhythm that celebrates the rich cultural heritage of Kerala in the heart of America.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <EventDetailsCard />
          </div>
        </section>
        
        {/* Featured Guests Section */}
        <section className="space-y-8" id="featured-guests">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Users" size={32} className="text-indigo-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Guests</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet our distinguished speakers and industry experts who bring years of experience 
              and innovative insights to our community. Each guest contributes unique perspectives 
              that drive meaningful conversations and learning opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGuests?.map((guest) =>
            <FeaturedGuestCard key={guest?.id} guest={guest} />
            )}
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="space-y-8" id="contact-info">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="MessageCircle" size={32} className="text-emerald-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Contact Information</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Ready to connect with us? We're here to help answer your questions, provide support, 
              and discuss how we can work together. Reach out through any of the channels below.
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <ContactInfoCard contact={contactInfo} />
          </div>
        </section>

        {/* Program Directors Section */}
        <section className="space-y-8" id="program-directors">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Icon name="Crown" size={32} className="text-rose-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Program Directors</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our leadership team combines decades of industry experience with a passion for education 
              and innovation. They guide our programs with expertise, vision, and commitment to excellence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programDirectors?.map((director) =>
            <ProgramDirectorCard key={director?.id} director={director} />
            )}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Get Started?</h2>
            <p className="text-xl text-indigo-100 leading-relaxed">
              Join our community of innovators, learners, and industry leaders. 
              Experience the difference that premium design and thoughtful user experience can make.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
                <Icon name="Rocket" size={20} />
                <span>Join Now</span>
              </button>
              <button className="border-2 border-white/30 text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center space-x-2">
                <Icon name="Calendar" size={20} />
                <span>Schedule Demo</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Sponsors Section */}
      <SponsorsSection />
      
      {/* Event Gallery Section */}
      <EventGallery />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <Icon name="Layers" size={20} color="white" />
              </div>
              <span className="text-xl font-semibold">Card Redesign System</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Transforming user experiences through premium gradient-enhanced designs 
              and modern visual hierarchy.
            </p>
            <div className="pt-8 border-t border-gray-800">
              <p className="text-gray-500 text-sm">
                © {new Date()?.getFullYear()} Card Redesign System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainContentPageWithEnhancedCardComponents;