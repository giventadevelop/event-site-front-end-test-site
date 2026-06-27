import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const EventGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1724218937701-923d12a2d3d7",
    alt: "Energetic dance performance on stage with colorful lighting and traditional Kerala costumes during Spark of Kerala event",
    title: "Traditional Dance Performance",
    category: "Performance"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1641666017160-3ca811d1b289",
    alt: "Musicians playing traditional Kerala instruments including tabla and veena in an intimate concert setting",
    title: "Musical Concert",
    category: "Music"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1710097730269-9984dc725616",
    alt: "Vibrant cultural celebration with audience members enjoying traditional Kerala art forms and performances",
    title: "Cultural Celebration",
    category: "Culture"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1546023105-80a2f4a5457d",
    alt: "Behind-the-scenes preparation with artists applying traditional makeup and getting ready for Kerala dance performance",
    title: "Behind the Scenes",
    category: "Preparation"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1710097730269-9984dc725616",
    alt: "Enthusiastic audience members applauding and enjoying the Spark of Kerala cultural showcase event",
    title: "Audience Engagement",
    category: "Audience"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1716839358197-b2b96ca8540b",
    alt: "Group photo of all featured artists and organizers celebrating the successful Spark of Kerala event",
    title: "Artists Showcase",
    category: "Artists"
  }];


  const categories = ["All", "Performance", "Music", "Culture", "Preparation", "Audience", "Artists"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredImages = activeCategory === "All" ?
  galleryImages :
  galleryImages?.filter((img) => img?.category === activeCategory);

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Icon name="Camera" size={32} className="text-purple-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">Event Gallery</h2>
          </div>
          <p className="text-lg text-purple-100 max-w-3xl mx-auto leading-relaxed">
            Relive the magical moments from Spark of Kerala. Browse through our collection of 
            stunning photographs capturing the essence of performance arts and cultural celebration.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories?.map((category) =>
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            activeCategory === category ?
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' :
            'bg-white/10 text-purple-100 hover:bg-white/20 backdrop-blur-sm'}`
            }>

              {category}
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredImages?.map((image) =>
          <div
            key={image?.id}
            className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm cursor-pointer"
            onClick={() => setSelectedImage(image)}>

              <div className="aspect-w-4 aspect-h-3">
                <img
                src={image?.src}
                alt={image?.alt}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" />

              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg mb-1">{image?.title}</h3>
                  <span className="inline-block bg-purple-500/80 text-white text-xs px-2 py-1 rounded-full">
                    {image?.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Icon name="Eye" size={20} color="white" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto">
            <Icon name="Grid3x3" size={20} />
            <span>View Full Gallery</span>
          </button>
        </div>
      </div>
      {/* Modal for Selected Image */}
      {selectedImage &&
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}>

          <div className="relative max-w-4xl w-full">
            <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10">

              <Icon name="X" size={24} />
            </button>
            
            <img
            src={selectedImage?.src}
            alt={selectedImage?.alt}
            className="w-full h-auto max-h-[80vh] object-contain rounded-2xl" />

            
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-white font-semibold text-xl mb-2">{selectedImage?.title}</h3>
              <span className="inline-block bg-purple-500 text-white text-sm px-3 py-1 rounded-full">
                {selectedImage?.category}
              </span>
            </div>
          </div>
        </div>
      }
    </section>);

};

export default EventGallery;