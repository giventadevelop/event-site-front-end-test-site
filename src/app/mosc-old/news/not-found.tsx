import React from 'react';
import Link from 'next/link';

export default function NewsNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="font-heading font-semibold text-2xl text-foreground mb-4">
        Article not found
      </h1>
      <p className="font-body text-muted-foreground mb-6">
        The news article you are looking for does not exist or is no longer available.
      </p>
      <Link
        href="/mosc-old/news"
        className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 reverent-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Back to News
      </Link>
    </div>
  );
}
