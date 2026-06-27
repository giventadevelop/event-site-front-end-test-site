import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AboutChurch from './pages/about-church';
import ClergyAndLeadership from './pages/clergy-and-leadership';
import ServicesAndWorship from './pages/services-and-worship';
import ContactAndLocations from './pages/contact-and-locations';
import NewsAndAnnouncements from './pages/news-and-announcements';
import Homepage from './pages/homepage';
import SpiritualOrganizations from './pages/spiritual-organizations';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Define your route here */}
          <Route path="/" element={<Homepage />} />
          <Route path="/about-church" element={<AboutChurch />} />
          <Route path="/clergy-and-leadership" element={<ClergyAndLeadership />} />
          <Route path="/services-and-worship" element={<ServicesAndWorship />} />
          <Route path="/contact-and-locations" element={<ContactAndLocations />} />
          <Route path="/news-and-announcements" element={<NewsAndAnnouncements />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/spiritual-organizations" element={<SpiritualOrganizations />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
