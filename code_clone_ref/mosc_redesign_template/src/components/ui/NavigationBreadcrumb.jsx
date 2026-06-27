import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NavigationBreadcrumb = () => {
  const location = useLocation();

  const pathMapping = {
    '/homepage': 'Home',
    '/about-church': 'About Church',
    '/services-and-worship': 'Services & Worship',
    '/clergy-and-leadership': 'Clergy & Leadership',
    '/news-and-announcements': 'News & Announcements',
    '/contact-and-locations': 'Contact & Locations'
  };

  const generateBreadcrumbs = () => {
    const pathSegments = location?.pathname?.split('/')?.filter(segment => segment);
    const breadcrumbs = [];

    // Always start with Home
    breadcrumbs?.push({
      label: 'Home',
      path: '/homepage',
      isActive: location?.pathname === '/homepage'
    });

    // Add current page if not home
    if (location?.pathname !== '/homepage') {
      const currentPageLabel = pathMapping?.[location?.pathname];
      if (currentPageLabel) {
        breadcrumbs?.push({
          label: currentPageLabel,
          path: location?.pathname,
          isActive: true
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render breadcrumbs if only home
  if (breadcrumbs?.length <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex items-center space-x-2 text-sm font-body py-4 px-4 sm:px-6 lg:px-8"
      aria-label="Breadcrumb navigation"
    >
      {breadcrumbs?.map((crumb, index) => (
        <React.Fragment key={crumb?.path}>
          {index > 0 && (
            <Icon 
              name="ChevronRight" 
              size={14} 
              className="text-muted-foreground mx-2" 
            />
          )}
          {crumb?.isActive ? (
            <span 
              className="text-primary font-medium"
              aria-current="page"
            >
              {crumb?.label}
            </span>
          ) : (
            <Link
              to={crumb?.path}
              className="text-muted-foreground hover:text-primary reverent-transition"
            >
              {crumb?.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default NavigationBreadcrumb;