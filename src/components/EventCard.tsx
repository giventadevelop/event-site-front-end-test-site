"use client";
import { EventWithMedia } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { formatDateLocal } from '@/lib/date';
import { useMemo, useState } from 'react';
import { AspectRatio } from 'radix-ui';

interface EventCardProps {
  event: EventWithMedia;
  placeholderText?: string;
}

export function EventCard({ event, placeholderText }: EventCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Helper to generate Google Calendar URL
  function toGoogleCalendarDate(date: string, time: string) {
    if (!date || !time) return '';
    const [year, month, day] = date.split('-');
    let [hour, minute] = time.split(':');
    let ampm = '';
    if (minute && minute.includes(' ')) {
      [minute, ampm] = minute.split(' ');
    }
    let h = parseInt(hour, 10);
    if (ampm && ampm.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (ampm && ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, '0')}${minute}00`;
  }

  const isUpcoming = useMemo(() => {
    const today = new Date();
    const eventDate = event.startDate ? new Date(event.startDate) : null;
    return eventDate && eventDate >= today;
  }, [event.startDate]);

  const calendarLink = useMemo(() => {
    if (!isUpcoming) return '';
    const start = toGoogleCalendarDate(event.startDate, event.startTime);
    const end = toGoogleCalendarDate(event.endDate, event.endTime);
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  }, [event, isUpcoming]);

  // Debug logging
  console.log(`EventCard ${event.id}: thumbnailUrl = ${event.thumbnailUrl}, imageError = ${imageError}`);

  return (
    <div 
      className="group cursor-pointer w-full m-0 p-0"
      style={{
        margin: 0,
        padding: 0,
        borderRadius: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'box-shadow 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
    >
      <Link href={`/events/${event.id}`} className="block" tabIndex={-1}>
        {/* Enhanced Image Container with Increased Height - No Padding for Edge-to-Edge */}
        <div className="w-full m-0 p-0" style={{ margin: 0, padding: 0 }}>
          <div 
            className="relative w-full overflow-hidden bg-gray-50"
            style={{ 
              height: '400px', // Significantly increased height
              minHeight: '400px',
              margin: 0,
              padding: 0,
              borderRadius: 0
            }}
          >
            {event.thumbnailUrl && !imageError ? (
              event.thumbnailUrl.includes('s3.amazonaws.com') ? (
                // Use regular img tag for S3 URLs with enhanced padding and sizing
                <div className="w-full h-full p-6 flex items-center justify-center">
                  <img
                    src={event.thumbnailUrl}
                    alt={event.title}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl shadow-lg"
                    style={{
                      backgroundColor: 'transparent',
                      objectFit: 'contain',
                      objectPosition: 'center'
                    }}
                    onError={(e) => {
                      console.error(`Image failed to load for event ${event.id}:`, event.thumbnailUrl, e);
                      setImageError(true);
                    }}
                    onLoad={() => {
                      console.log(`Image loaded successfully for event ${event.id}:`, event.thumbnailUrl);
                    }}
                  />
                </div>
              ) : (
                // Use Next.js Image for other URLs with enhanced container
                <div className="relative w-full h-full p-6 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={event.thumbnailUrl}
                      alt={event.title}
                      fill
                      className="object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl shadow-lg"
                      style={{
                        backgroundColor: 'transparent',
                        objectFit: 'contain',
                        objectPosition: 'center'
                      }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      onError={(e) => {
                        console.error(`Image failed to load for event ${event.id}:`, event.thumbnailUrl, e);
                        setImageError(true);
                      }}
                      onLoad={() => {
                        console.log(`Image loaded successfully for event ${event.id}:`, event.thumbnailUrl);
                      }}
                    />
                  </div>
                </div>
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-transparent p-6">
                <div className="text-center">
                  <span className="text-gray-400 text-6xl block mb-4">📅</span>
                  <span className="text-gray-500 text-sm">No Image Available</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Section */}
        <div className="p-4 text-center">
          <h4 className="text-lg font-semibold mb-1 line-clamp-2">{event.title}</h4>
          <p className="text-gray-600 mb-3 text-sm line-clamp-2">{event.description}</p>
          <div className="text-yellow-600 font-bold mb-1 text-sm">
            {formatDateLocal(event.startDate)}
          </div>
          <div className="text-gray-500 text-xs mb-4">
            {event.startTime} - {event.endTime}
          </div>
          <span className="inline-block bg-yellow-400 text-gray-900 px-5 py-2 rounded-lg font-semibold text-xs shadow group-hover:bg-yellow-300 transition">
            Learn More
          </span>
        </div>
      </Link>
      
      {/* Calendar Section */}
      {isUpcoming && calendarLink && (
        <div className="flex flex-col items-center pb-4">
          <a href={calendarLink} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
            <img src="/images/icons8-calendar.gif" alt="Calendar" className="w-7 h-7 rounded shadow mx-auto" />
            <span className="text-xs text-blue-700 font-semibold mt-1">Add to Calendar</span>
          </a>
        </div>
      )}
    </div>
  );
}