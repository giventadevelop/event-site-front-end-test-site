"use client";
import React from 'react';

export default function VideoSection() {
  const handlePlayClick = () => {
    const videoContainer = document.getElementById('video-container');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    if (videoContainer && thumbnailContainer) {
      // Hide thumbnail
      thumbnailContainer.style.display = 'none';
      // Show video
      videoContainer.innerHTML = `
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/JSLEUuqkhVQ?autoplay=1&rel=0&controls=1"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="border-radius: 8px;"
        ></iframe>
      `;
    }
  };

  return (
    <div className="w-full py-4" style={{
      marginTop: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '300px' // Reduced by 100px from previous 400px
    }}>
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        <div className="text-center mb-4">
          <h2 className="text-lg md:text-xl font-bold text-white mb-2">Watch Our Story</h2>
          <p className="text-sm text-white/90 max-w-md mx-auto">
            Discover the vibrant culture and traditions of Kerala through our community events and celebrations.
          </p>
        </div>

        <div className="relative w-full max-w-lg mx-auto">
          {/* Video Container - Much Smaller */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
            {/* YouTube Thumbnail */}
            <div id="thumbnail-container" className="absolute inset-0 bg-cover bg-center" style={{
              backgroundImage: `url(https://img.youtube.com/vi/JSLEUuqkhVQ/hqdefault.jpg)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  className="group relative w-12 h-12 md:w-14 md:h-14 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-xl"
                  onClick={handlePlayClick}
                >
                  {/* Play Icon */}
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5 text-white ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>

                  {/* Ripple Effect */}
                  <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-ping"></div>
                </button>
              </div>

              {/* Video Title Overlay */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black bg-opacity-75 text-white p-1.5 rounded-lg">
                  <h3 className="font-semibold text-xs">MCEFEE Community Events</h3>
                  <p className="text-xs text-gray-300">Celebrating Kerala Culture in the USA</p>
                </div>
              </div>
            </div>

            {/* Video iframe container (hidden initially) */}
            <div id="video-container" className="w-full h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}