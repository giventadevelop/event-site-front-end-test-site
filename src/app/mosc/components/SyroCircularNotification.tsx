import React from 'react';

/**
 * Matches static Circularnotification section (background #6e1b48).
 * Static content is filled via API (latestupdates, latestphotos); we render structure only.
 */
export default function SyroCircularNotification() {
  return (
    <section className="Circularnotification">
      <div className="container">
        <div className="row">
          <div className="col" id="latestupdates">
            {/* Static page fills this via API (Latest Updates marquee) */}
          </div>
          <div className="col-lg-2 d-flex justify-content-end gallery1" id="latestphotos">
            {/* Static page fills this via API (Latest Photos) */}
          </div>
        </div>
      </div>
    </section>
  );
}
